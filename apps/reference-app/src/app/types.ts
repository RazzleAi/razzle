export interface Company {
    id: string;
    name: string;
}

export interface Employee {
    id: string;
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Card {
    id: string;
    employeeId: string;
    cardNumber: string;
    active: boolean;
}

export interface Transaction {
    id: string;
    cardId: string;
    companyId: string
    employeeId: string
    amount: number;
    date: Date;
}