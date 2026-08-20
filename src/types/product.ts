export type ProductType = "physical" | "software" | "digital" | "free"

export type ProductStatus =
  | "candidate"
  | "test"
  | "active"
  | "house-stock"
  | "retired"
  | "archived"

export type ProductBadge =
  | "new"
  | "house-stock"
  | "leaving"
  | "wildcard"
  | "back-in-machine"

export type ProductMetrics = {
  timesShown: number
  timesSelected: number
  timesVended: number
  keepVotes: number
  alreadyOwned: number
  shares: number
}

export type ProductImageFit = "contain" | "cover"

export type ProductImage = {
  src: string
  fit?: ProductImageFit
}

export type ProductImageEntry = string | ProductImage

export type Product = {
  id: string
  name: string
  brand?: string
  shortName?: string

  type: ProductType

  category?: string
  tags: string[]

  price?: number
  priceLabel: string

  source?: string
  sourceUrl?: string
  illustration: string
  productImage?: string
  productImages?: ProductImageEntry[]

  machineCopy: string
  stockReason?: string

  status: ProductStatus

  badges?: ProductBadge[]

  addedDate?: string
  lastStockedDate?: string

  metrics?: ProductMetrics
}

export const SLOT_CODES = [
  "A1",
  "A2",
  "A3",
  "A4",
  "B1",
  "B2",
  "B3",
  "B4",
  "C1",
  "C2",
  "C3",
  "C4",
  "D1",
  "D2",
  "D3",
  "D4",
] as const

export type SlotCode = (typeof SLOT_CODES)[number]

export const LIVE_STATUSES: ProductStatus[] = ["test", "active", "house-stock"]

export const BADGE_LABEL: Record<ProductBadge, string> = {
  new: "NEW",
  "house-stock": "HOUSE STOCK",
  leaving: "LEAVING",
  wildcard: "WILDCARD",
  "back-in-machine": "BACK IN MACHINE",
}
