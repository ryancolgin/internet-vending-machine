import type { HaulItem } from "../types/machine"

export const HAUL_CARD_LIMIT = 16

/**
 * The 16 most recently collected products, returned in collection order.
 * Missing timestamps fall back to that same order.
 */
export function latestHaulCardIds(haul: readonly HaulItem[]): string[] {
  const ranked = haul.map((item, index) => {
    const parsed = Date.parse(item.vendedAt ?? "")
    return {
      id: item.productId,
      index,
      time: Number.isNaN(parsed) ? index : parsed,
    }
  })
  const latest = [...ranked]
    .sort((a, b) => a.time - b.time || a.index - b.index)
    .slice(-HAUL_CARD_LIMIT)
  latest.sort((a, b) => a.index - b.index)
  return latest.map((item) => item.id)
}

/** Incoming share links keep their original order. The card still holds 16. */
export function sharedHaulCardIds(productIds: readonly string[]): string[] {
  return productIds.slice(0, HAUL_CARD_LIMIT)
}

export function haulCardLabel(shown: number, total: number): string {
  if (total > HAUL_CARD_LIMIT) return `LATEST ${shown} OF ${total}`
  if (shown >= HAUL_CARD_LIMIT) return "16 / 16 · FULL MACHINE"
  return `${shown} / 16 THINGS FROM THE MACHINE`
}
