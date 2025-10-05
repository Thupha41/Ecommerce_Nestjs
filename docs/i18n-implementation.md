# Triển khai Đa ngôn ngữ (i18n) trong NestJS

Tài liệu này mô tả chi tiết cách triển khai và sử dụng tính năng đa ngôn ngữ (internationalization - i18n) trong dự án NestJS.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cấu trúc i18n](#cấu-trúc-i18n)
3. [Module Language](#module-language)
4. [Cơ chế Translation](#cơ-chế-translation)
5. [Cách sử dụng i18n](#cách-sử-dụng-i18n)
6. [Thực hành tốt nhất](#thực-hành-tốt-nhất)

## Tổng quan

Hệ thống đa ngôn ngữ trong dự án được thiết kế để hỗ trợ:

1. **Nội dung tĩnh**: Các thông báo lỗi, nhãn, và văn bản tĩnh khác trong ứng dụng
2. **Nội dung động**: Dữ liệu từ database như tên sản phẩm, mô tả, v.v.

Dự án sử dụng hai cách tiếp cận kết hợp:

- **nestjs-i18n**: Thư viện để quản lý các chuỗi dịch tĩnh
- **Translation tables**: Bảng dịch trong database để lưu trữ nội dung động theo từng ngôn ngữ

## Cấu trúc i18n

### Cấu hình nestjs-i18n

Thư viện nestjs-i18n được cấu hình trong `app.module.ts`:

```typescript
I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.resolve('src/i18n/'),
    watch: true,
  },
  resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
  typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
})
```

Cấu hình này:

- Đặt ngôn ngữ mặc định là 'en'
- Tải các file dịch từ thư mục `src/i18n/`
- Xác định ngôn ngữ từ query parameter `lang` hoặc header `Accept-Language`
- Tạo type definitions cho TypeScript tại `src/generated/i18n.generated.ts`

### Cấu trúc thư mục i18n

```
src/
├── i18n/
│   ├── en/
│   │   └── error.json
│   └── vi/
│       └── error.json
└── generated/
    └── i18n.generated.ts
```

Mỗi ngôn ngữ có một thư mục riêng chứa các file JSON theo từng namespace.

## Module Language

Module Language quản lý các ngôn ngữ được hỗ trợ trong hệ thống.

### Cấu trúc Model

```typescript
// language.model.ts
export const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

### Repository

```typescript
// language.repo.ts
@Injectable()
export class LanguageRepo implements ILanguageRepository {
  constructor(private prismaService: PrismaService) {}

  findAll(): Promise<LanguageType[]> {
    return this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    })
  }

  // ... các phương thức khác
}
```

### Service

```typescript
// language.service.ts
@Injectable()
export class LanguageService {
  constructor(@Inject('ILanguageRepository') private languageRepo: ILanguageRepository) {}

  async findAll() {
    const data = await this.languageRepo.findAll()
    return {
      items: data,
      totalItems: data.length,
    }
  }

  // ... các phương thức khác
}
```

## Cơ chế Translation

Dự án sử dụng mô hình Translation để lưu trữ nội dung đa ngôn ngữ cho dữ liệu động. Ví dụ với Brand:

### Mô hình Brand và BrandTranslation

```typescript
// shared-brand.model.ts
export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().url().max(1000),
  // ... các trường khác
})

export const BrandIncludeTranslationSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
})

// shared-brand-translation.model.ts
export const BrandTranslationSchema = z.object({
  id: z.number(),
  brandId: z.number(),
  languageId: z.string(),
  name: z.string().max(500),
  description: z.string(),
  // ... các trường khác
})
```

### Truy vấn dữ liệu theo ngôn ngữ

```typescript
// brand.repo.ts
findById(id: number, languageId: string): Promise<BrandIncludeTranslationType | null> {
  return this.prismaService.brand.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      brandTranslations: {
        where: languageId === ALL_LANGUAGE_CODE
          ? { deletedAt: null }
          : { deletedAt: null, languageId },
      },
    },
  })
}
```

### Xử lý ngôn ngữ trong Service

```typescript
// brand.service.ts
async findById(id: number) {
  const brand = await this.brandRepo.findById(id, I18nContext.current()?.lang as string)
  if (!brand) {
    throw NotFoundRecordException
  }
  return brand
}
```

## Cách sử dụng i18n

### 1. Sử dụng i18n cho nội dung tĩnh

#### Định nghĩa các chuỗi dịch

Tạo file JSON cho mỗi ngôn ngữ:

```json
// src/i18n/en/error.json
{
  "NOT_FOUND": "The requested resource was not found."
}

// src/i18n/vi/error.json
{
  "NOT_FOUND": "Tài nguyên yêu cầu không được tìm thấy."
}
```

#### Sử dụng trong code

```typescript
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class SomeService {
  constructor(private readonly i18n: I18nService) {}

  async someMethod() {
    const message = await this.i18n.t('error.NOT_FOUND')
    // ...
  }
}
```

### 2. Sử dụng i18n cho nội dung động

#### Tạo bản dịch

```typescript
// Tạo một Brand
const brand = await brandService.create({
  data: { name: 'Apple', logo: 'https://example.com/apple.png' },
  createdById: 1,
})

// Tạo bản dịch tiếng Việt
await brandTranslationService.create({
  data: {
    brandId: brand.id,
    languageId: 'vi',
    name: 'Apple',
    description: 'Công ty công nghệ hàng đầu thế giới',
  },
  createdById: 1,
})

// Tạo bản dịch tiếng Anh
await brandTranslationService.create({
  data: {
    brandId: brand.id,
    languageId: 'en',
    name: 'Apple',
    description: 'Leading technology company in the world',
  },
  createdById: 1,
})
```

#### Truy vấn theo ngôn ngữ

```typescript
// Ngôn ngữ được xác định từ query parameter hoặc Accept-Language header
const brand = await brandService.findById(1) // I18nContext.current().lang được sử dụng nội bộ
```

### 3. Chuyển đổi ngôn ngữ

Để thay đổi ngôn ngữ, client có thể:

1. Thêm query parameter: `?lang=vi`
2. Đặt header Accept-Language: `Accept-Language: vi`

## Thực hành tốt nhất

1. **Sử dụng Constants**: Định nghĩa các khóa i18n dưới dạng constants để tránh lỗi typo

```typescript
// i18n-keys.constant.ts
export const I18nKeys = {
  Error: {
    NOT_FOUND: 'error.NOT_FOUND',
    // ...
  },
}
```

2. **Phân tách namespace**: Tổ chức các file dịch theo chức năng (error, common, validation...)

3. **Fallback**: Luôn cung cấp ngôn ngữ mặc định (fallback) để tránh lỗi khi không tìm thấy bản dịch

4. **Type Safety**: Sử dụng type definitions được tạo tự động để đảm bảo type safety

```typescript
import { I18nPath } from 'src/generated/i18n.generated'

const key: I18nPath = 'error.NOT_FOUND'
```

5. **Kiểm tra đầy đủ**: Đảm bảo tất cả các ngôn ngữ đều có đầy đủ các khóa dịch

6. **Tối ưu hóa truy vấn**: Khi truy vấn dữ liệu đa ngôn ngữ, chỉ lấy bản dịch cho ngôn ngữ cần thiết

## Kết luận

Việc triển khai đa ngôn ngữ trong dự án NestJS kết hợp cả cách tiếp cận tĩnh (nestjs-i18n) và động (translation tables) giúp xử lý hiệu quả các loại nội dung khác nhau. Điều này cho phép ứng dụng dễ dàng mở rộng hỗ trợ nhiều ngôn ngữ mà không cần thay đổi cấu trúc code cơ bản.
