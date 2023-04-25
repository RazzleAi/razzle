import { Transaction } from './types'
import { faker } from '@faker-js/faker'

export const transactions: Transaction[] = [
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10001',
    date: faker.date.past(),
    employeeId: "E100001",
    companyId: "C1203939"
  },
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10002',
    date: faker.date.past(),
    employeeId: "E100002",
    companyId: "C392020210"
  },
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10001',
    date: faker.date.past(),
    employeeId: "E100001",
    companyId: "C1203939"
  },
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10001',
    date: faker.date.past(),
    employeeId: "E100001",
    companyId: "C1203939"
  },
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10002',
    date: faker.date.past(),
    employeeId: "E100002",
    companyId: "C392020210"
  },
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10002',
    date: faker.date.past(),
    employeeId: "E100002",
    companyId: "C392020210"
  },
  {
    id: faker.datatype.uuid(),
    amount: Number(faker.finance.amount()),
    cardId: 'CD10005',
    date: faker.date.past(),
    employeeId: "E100003",
    companyId: "C3049393"
  },
]
