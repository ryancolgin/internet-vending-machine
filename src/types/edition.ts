import type { SlotCode } from "./product"

/**
 * Slot presentation on an edition face.
 * Reserved for later, do not add yet: sold-out | gone | retired | returns-later
 */
export type EditionSlotFlag = "new" | "carried" | "returning"

export type EditionStatus = "draft" | "current" | "previous"

export type EditionSlot = {
  slot: SlotCode
  productId: string
  flag?: EditionSlotFlag
}

export type Edition = {
  id: string
  number: number
  stockedAt: string
  launchAt?: string
  status: EditionStatus
  slots: EditionSlot[]
}
