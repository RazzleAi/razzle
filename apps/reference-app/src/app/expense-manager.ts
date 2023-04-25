import { Action, ActionParam, CallDetails } from '@razzledotai/sdk'
import {
  RazzleColumn,
  RazzleContainer,
  RazzleCustomList,
  RazzleCustomListItem,
  RazzleCustomTable,
  RazzleLink,
  RazzleList,
  RazzleRow,
  RazzleTable,
  RazzleText,
  WidgetPadding,
} from '@razzledotai/widgets'
import { RazzleResponse } from '@razzledotai/sdk'
import { ExpenseManagerService } from './expense-manager.service'

export class ExpenseManagerModule {
  constructor(private readonly expenseManagerService: ExpenseManagerService) {}

  @Action({
    name: 'getCompanies',
    description:
      'Gets all companies in our database and returns their company IDs and name',
    paged: true,
  })
  getCompanies(callDetails: CallDetails) {
    const pagination = callDetails.pagination
    let companies = this.expenseManagerService.listCompanies()
    const totalCount = companies.length
    const { pageNumber, pageSize } = pagination || {
      pageNumber: 1,
      pageSize: 10,
    }
    companies = companies.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    )
    const data: unknown[][] = companies.map((company) => [
      ...Object.values(company),
      '',
      '',
    ])
    return new RazzleResponse({
      data: companies,
      pagination: {
        pageNumber,
        pageSize,
        totalCount,
      },
      ui: new RazzleCustomTable({
        columns: [
          {
            id: 'id',
            header: 'ID',
          },
          {
            id: 'name',
            header: 'Name',
            widthPct: 50,
          },
          {
            id: 'actionManage',
            header: '',
          },
          {
            id: 'actionListCards',
            header: '',
          },
        ],
        data,
        builder: (rowIdx: number, colId: string, value: unknown) => {
          const company = companies[rowIdx]
          switch (colId) {
            case 'actionManage':
              return new RazzleLink({
                textSize: 'small',
                action: {
                  action: 'getCompany',
                  label: 'Manage',
                  args: [company.id],
                },
              })
            case 'actionListCards':
              return new RazzleLink({
                textSize: 'small',
                action: {
                  action: 'listCardsByCompany',
                  label: 'List cards',
                  args: [company.id],
                },
              })
            default:
              return new RazzleText({ text: value as string })
          }
        },
      }),
    })
  }

  @Action({
    name: 'getAllCards',
    description: 'Get all cards in out database regardless of company',
    paged: true,
  })
  getAllCards(callDetails: CallDetails) {
    const pagination = callDetails.pagination
    let cards = this.expenseManagerService.listAllCards()
    const totalCount = cards.length
    const { pageNumber, pageSize } = pagination || {
      pageNumber: 1,
      pageSize: 10,
    }
    cards = cards.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
    return new RazzleResponse({
      pagination: {
        pageNumber,
        pageSize,
        totalCount,
      },
      data: cards,
      ui: new RazzleCustomList({
        title: 'All cards',
        divider: true,
        items: cards.map((card) => {
          return new RazzleCustomListItem({
            content: new RazzleText({ text: card.cardNumber }),
          })
        }),
      }),
    })
  }

  @Action({
    name: 'getCompany',
    description:
      'Looks for a company in our database using its ID and returns its details',
    stealth: true,
  })
  getCompany(@ActionParam('companyId') id: string) {
    const company = this.expenseManagerService.getCompany(id)
    if (!company) {
      return new RazzleResponse({
        error: { message: `Company ${id} not found` },
      })
    }

    return new RazzleResponse({
      data: company,
      ui: new RazzleList({
        title: company.name,
        items: [
          {
            text: 'Manage',
            actions: [
              {
                action: 'getEmployeesByCompany',
                label: 'List employees',
                args: [company.id],
              },
            ],
          },
        ],
      }),
    })
  }

  @Action({
    name: 'getEmployeesByCompanyId',
    description: 'Get all employees in the database by company ID',
  })
  getEmployeesByCompanyID(@ActionParam('companyId') id: string) {
    const employees = this.expenseManagerService.listEmployeesByCompany(id)
    const data: string[][] = []
    for (const employee of employees) {
      data.push([employee.firstName, employee.lastName, employee.email])
    }
    return new RazzleResponse({
      data: employees,
      ui: new RazzleContainer({
        body: new RazzleColumn({
          children: [
            new RazzleText({ text: 'All Employees' }),
            new RazzleTable({
              columns: [
                {
                  id: 'firstName',
                  header: 'First Name',
                },
                {
                  id: 'lastname',
                  header: 'Last Name',
                },
                {
                  id: 'email',
                  header: 'Email',
                },
              ],
              data: data,
            }),
          ],
        }),
      }),
    })
  }

  @Action({
    name: 'listCardsByCompany',
    description:
      'Searches for the all the cards that a registered to a perticular company using the company ID as the identifier',
  })
  listCardsByCompany(@ActionParam('companyId') id: string) {
    const cards = this.expenseManagerService.listCardsByCompany(id)
    return new RazzleResponse({
      data: cards,
      ui: new RazzleList({
        title: 'All Cards',
        items: cards.map((card) => {
          const actions = []
          if (card.active) {
            actions.push({
              action: 'deactivateCard',
              label: 'Deactivate',
              args: [card.id],
            })
          }

          return {
            text: `${card.cardNumber} - Active: ${card.active}`,
            actions: [...actions],
          }
        }),
      }),
    })
  }

  @Action({
    name: 'deactivateCard',
    description: 'Deactivates a card using the the provided card id',
    stealth: true,
  })
  deactivateCard(@ActionParam('cardId') id: string) {
    const card = this.expenseManagerService.deactivateCardByCardId(id)
    if (!card) {
      return new RazzleResponse({
        ui: new RazzleText({ text: `Card not found` }),
      })
    }

    return new RazzleResponse({
      ui: new RazzleContainer({
        padding: new WidgetPadding({
          top: 10,
          bottom: 10,
        }),
        body: new RazzleRow({
          children: [
            new RazzleText({ text: `Deactivated card ${card.cardNumber}` }),
            new RazzleText({ text: `Card Status: ${card.active}` }),
          ],
        }),
      }),
    })
  }

  @Action({
    name: 'deactivateCardByCardNumber',
    description: 'Deactivates a card using the the provided card number',
  })
  deactivateCardByCardNumber(@ActionParam('cardNumber') cardNumber: string) {
    const card =
      this.expenseManagerService.deactivateCardByCardNumber(cardNumber)
    if (!card) {
      return new RazzleResponse({
        ui: new RazzleText({ text: `Card not found` }),
      })
    }

    return new RazzleResponse({
      ui: new RazzleContainer({
        padding: new WidgetPadding({}),
        body: new RazzleColumn({
          children: [
            new RazzleText({ text: `Deactivated card ${card.cardNumber}` }),
            new RazzleText({ text: `Card Status: ${card.active}` }),
          ],
        }),
      }),
    })
  }
}
