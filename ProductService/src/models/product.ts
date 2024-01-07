export type Product = {
    id: string
    title: string
    description: string
    price: number
    image?: string
}

export type FoundProduct = {
    id?: string
    title: string
    price: number
    description: string
    count: number
}
