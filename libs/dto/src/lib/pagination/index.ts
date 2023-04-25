export type PageParams = {
    limit: number
    cursor?: string
}

export type Page<T> = {
    items: T[]
    nextOffsetId?: string    
}