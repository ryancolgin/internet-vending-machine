import type { SlotCode } from "./product"

/**
 * Editorial badge on an edition face.
 * Reserved for later, do not add yet: sold-out | gone | retired | returns-later
 */
export type EditionSlotBadge = "new" | "house-favorite" | "returning"

export const EDITION_BADGE_LABEL: Record<EditionSlotBadge, string> = {
  new: "NEW",
  "house-favorite": "HOUSE FAVORITE",
  returning: "RETURNING",
}

export type EditionStatus = "draft" | "current" | "previous"

export type EditionSlot = {
  slot: SlotCode
  productId: string
  badge?: EditionSlotBadge
}

export type Edition = {
  id: string
  number: number
  stockedAt: string
  launchAt?: string
  status: EditionStatus
  slots: EditionSlot[]
}
