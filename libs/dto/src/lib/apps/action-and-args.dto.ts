export interface ActionAndArgsDto {
    actionName: string
    actionDescription: string
    args: {
        name: string
        type: string
    }[]
}