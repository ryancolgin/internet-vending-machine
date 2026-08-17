import { SLOT_CODES, type SlotCode } from "../types/product"

export function makeEmptySlots(): Record<SlotCode, string> {
  return Object.fromEntries(SLOT_CODES.map((code) => [code, ""])) as Record<
    SlotCode,
    string
  >
}

export function assignToSlots(productIds: string[]): Record<SlotCode, string> {
  const slots = makeEmptySlots()
  SLOT_CODES.forEach((code, index) => {
    const id = productIds[index]
    if (id) slots[code] = id
  })
  return slots
}

export function slotForProduct(
  slots: Record<SlotCode, string>,
  productId: string,
): SlotCode | undefined {
  return SLOT_CODES.find((code) => slots[code] === productId)
}

export function slotProductIds(slots: Record<SlotCode, string>): string[] {
  return SLOT_CODES.map((code) => slots[code]).filter(Boolean)
}

export function neighborSlot(
  code: SlotCode,
  key: string,
  columns = 4,
): SlotCode | null {
  const index = SLOT_CODES.indexOf(code)
  if (index < 0) return null
  const col = index % columns
  const row = Math.floor(index / columns)
  const rows = Math.ceil(SLOT_CODES.length / columns)

  let nextCol = col
  let nextRow = row

  if (key === "ArrowRight") nextCol = Math.min(columns - 1, col + 1)
  if (key === "ArrowLeft") nextCol = Math.max(0, col - 1)
  if (key === "ArrowDown") nextRow = Math.min(rows - 1, row + 1)
  if (key === "ArrowUp") nextRow = Math.max(0, row - 1)

  const nextIndex = nextRow * columns + nextCol
  const next = SLOT_CODES[nextIndex]
  return next && next !== code ? next : null
}
