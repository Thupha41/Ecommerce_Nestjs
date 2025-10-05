```ts
type Variant = {
  value: string
  options: string[]
}
type SKU = {
  value: string
  price: number
  stock: number
  image: string
}
const variants: Variant[] = [
  {
    value: 'Màu sắc',
    options: ['Đen', 'Trắng', 'Xanh', 'Tím'],
  },
  {
    value: 'Kích thước',
    options: ['S', 'M', 'L', 'XL'],
  },
]
```

Hãy tạo một hàm nhận vào variants và trả về mảng `skus: SKU[]` như sau

```json
[
  { "value": "Đen-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Đen-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Đen-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Đen-XL", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-XL", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-XL", "price": 0, "stock": 100, "image": "" },
  { "value": "Tím-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Tím-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Tím-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Tím-XL", "price": 0, "stock": 100, "image": "" }
]
```

Yêu cầu nếu số lượng variants có tăng lên thì hàm vẫn hoạt động đúng.
