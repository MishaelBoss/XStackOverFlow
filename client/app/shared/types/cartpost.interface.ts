import { StaticImageData } from "next/dist/shared/lib/get-img-props"

export interface ICartPost{
    id: number
    title: string
    image: StaticImageData
    isDecided: boolean
    created_at: string
}