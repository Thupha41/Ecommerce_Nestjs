# Giải thích chi tiết về Authentication Guard

## Tổng quan

`AuthenticationGuard` là một guard trong NestJS được sử dụng để bảo vệ các endpoint API bằng cách xác thực người dùng. Guard này hoạt động như một lớp trung gian (middleware) kiểm tra xem người dùng có quyền truy cập vào một route cụ thể hay không.

## Cấu trúc và cách hoạt động

### 1. Các thành phần chính

```typescript
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }
  // ...
}
```

- `authTypeGuardMap`: Một đối tượng ánh xạ các loại xác thực với guard tương ứng
  - `AuthType.Bearer`: Sử dụng `AccessTokenGuard` để xác thực token JWT
  - `AuthType.None`: Cho phép truy cập không cần xác thực

### 2. Phương thức `canActivate`

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const authTypeValue = this.getAuthTypeValue(context)
  const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])
  return authTypeValue.options.condition === ConditionGuard.And
    ? this.handleAndCondition(guards, context)
    : this.handleOrCondition(guards, context)
}
```

Phương thức này là phương thức chính của guard:

1. Lấy thông tin về loại xác thực từ decorator `@Auth()` thông qua `getAuthTypeValue`
2. Ánh xạ các loại xác thực thành các guard tương ứng
3. Dựa vào điều kiện (`And` hoặc `Or`), gọi phương thức xử lý tương ứng

### 3. Phương thức `getAuthTypeValue`

```typescript
private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
  return (
    this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } }
  )
}
```

- Sử dụng `Reflector` để lấy metadata từ decorator `@Auth()`
- Nếu không có decorator, mặc định sẽ sử dụng `AuthType.Bearer` với điều kiện `And`

### 4. Xử lý điều kiện OR

```typescript
private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
  let lastError: any = null

  // Duyệt qua hết các guard, nếu có 1 guard pass thì return true
  for (const guard of guards) {
    try {
      if (await guard.canActivate(context)) {
        return true
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof HttpException) {
    throw lastError
  }
  throw new UnauthorizedException()
}
```

- Duyệt qua tất cả các guard
- Nếu có ít nhất một guard trả về `true`, cho phép truy cập
- Nếu tất cả đều thất bại, ném ra lỗi cuối cùng hoặc `UnauthorizedException`

### 5. Xử lý điều kiện AND

```typescript
private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
  // Duyệt qua hết các guard, nếu mọi guard đều pass thì return true
  for (const guard of guards) {
    try {
      if (!(await guard.canActivate(context))) {
        throw new UnauthorizedException()
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException()
    }
  }
  return true
}
```

- Duyệt qua tất cả các guard
- Nếu có bất kỳ guard nào trả về `false` hoặc ném ra lỗi, từ chối truy cập
- Chỉ cho phép truy cập khi tất cả guard đều trả về `true`

## Cách sử dụng

Guard này được sử dụng kết hợp với decorator `@Auth()`:

```typescript
@Auth(AuthType.Bearer)
@Get('profile')
getProfile() {
  // Chỉ người dùng đã xác thực mới có thể truy cập
}

@Auth(AuthType.None)
@Get('public')
getPublicData() {
  // Ai cũng có thể truy cập
}

@Auth([AuthType.Bearer, AuthType.None], { condition: ConditionGuard.Or })
@Get('mixed')
getMixedData() {
  // Người dùng đã xác thực hoặc không xác thực đều có thể truy cập
}
```

## Tại sao được import vào SharedModule?

`AuthenticationGuard` được import vào `SharedModule` vì những lý do sau:

1. **Tính tái sử dụng**: Guard này được sử dụng trong nhiều module khác nhau trong ứng dụng. Việc đặt nó trong `SharedModule` giúp tránh việc phải import nó nhiều lần ở các module khác nhau.

2. **Tính nhất quán**: Việc quản lý xác thực cần được xử lý một cách nhất quán trong toàn bộ ứng dụng. `SharedModule` cung cấp một nơi tập trung để quản lý các thành phần liên quan đến xác thực.

3. **Quản lý phụ thuộc**: `AuthenticationGuard` phụ thuộc vào `AccessTokenGuard` và các thành phần khác có thể cũng được định nghĩa trong `SharedModule`. Việc đặt chúng trong cùng một module giúp quản lý các phụ thuộc dễ dàng hơn.

4. **Mô hình thiết kế**: Trong kiến trúc NestJS, các thành phần dùng chung thường được đặt trong một module shared để tuân theo nguyên tắc DRY (Don't Repeat Yourself).

5. **Khả năng mở rộng**: Khi cần thêm các loại xác thực mới, chỉ cần cập nhật `AuthenticationGuard` trong `SharedModule` mà không cần thay đổi cách sử dụng ở các module khác.

## Luồng xử lý

1. Khi một request đến một endpoint được bảo vệ, NestJS sẽ kích hoạt `AuthenticationGuard`
2. Guard sẽ kiểm tra metadata của endpoint để xác định loại xác thực cần thiết
3. Dựa vào loại xác thực, guard sẽ gọi các guard con tương ứng (như `AccessTokenGuard`)
4. Nếu xác thực thành công, request được cho phép tiếp tục
5. Nếu xác thực thất bại, một exception sẽ được ném ra và client nhận được lỗi 401 Unauthorized

## Kết luận

`AuthenticationGuard` là một thành phần quan trọng trong hệ thống xác thực của ứng dụng, cung cấp một cách linh hoạt để bảo vệ các endpoint API. Việc đặt nó trong `SharedModule` giúp tăng tính tái sử dụng và nhất quán trong toàn bộ ứng dụng.
