import { Employee } from './types'
import { faker } from '@faker-js/faker'

const employeeStore: Employee[] = [
  {
    id: 'E100001',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    companyId: "C1203939"
  },
  {
    id: 'E100002',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    companyId: "C392020210"
  },
  {
    id: 'E100003',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    companyId: "C3049393"
  },
  {
    id: 'E100004',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    companyId: "C3051393"
  },
  {
    id: 'E100005',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    companyId: "C3051393"
  }
]

export default employeeStore