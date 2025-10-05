# Lưu ý về Prisma

## Quan hệ nhiều nhiều prisma

Để đơn giản hóa model khi tạo quan hệ nhiều nhiều, cta thường không khai báo model trung gian mà để [Prisma tự tạo](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)

## Tự quan hệ

- 1-1, 1-n, n-n: [Tham khảo doc](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/self-relations)

## Cùng 1-n trong một table

Thì phải quy định rõ name relation
