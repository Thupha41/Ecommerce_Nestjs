import _ from 'lodash'
const list = [
  {
    id: 1,
    name: 'POST /auth/register',
    description: '',
    path: '/auth/register',
    module: 'AUTH',
    method: 'POST',
  },
  {
    id: 2,
    name: 'POST /auth/otp',
    description: '',
    path: '/auth/otp',
    module: 'AUTH',
    method: 'POST',
  },
]

const result = _.keyBy(list, (permission) => `${permission.path}:${permission.method}`)
console.log(result)
