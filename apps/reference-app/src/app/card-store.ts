import { Card } from './types'
import { faker } from '@faker-js/faker'

const cardStore: Card[] = [
  {
    id: 'CD10001',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100001',
    active: true,
  },
  {
    id: 'CD10002',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100002',
    active: true,
  },
  {
    id: 'CD10003',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100002',
    active: true,
  },
  {
    id: 'CD10004',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100003',
    active: true,
  },
  {
    id: 'CD10005',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100003',
    active: true,
  },
  {
    id: 'CD10006',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100004',
    active: true,
  },
  {
    id: 'CD10007',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100004',
    active: true,
  },
  {
    id: 'CD10008',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100005',
    active: true,
  },
  {
    id: 'CD10009',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100005',
    active: true,
  },
  {
    id: 'CD10010',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100005',
    active: true,
  },
  {
    id: 'CD10011',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100005',
    active: true,
  },
  {
    id: 'CD10012',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100005',
    active: true,
  },
  {
    id: 'CD10013',
    cardNumber: faker.finance.creditCardNumber(),
    employeeId: 'E100005',
    active: true,
  },
]

export default cardStore