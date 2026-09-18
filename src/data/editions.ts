import type { Edition, EditionSlotBadge } from "../types/edition"
import { SLOT_CODES, type SlotCode } from "../types/product"
import { makeEmptySlots } from "../lib/slots"
import { isEditionLive } from "../types/machine"

/**
 * Edition catalog.
 *
 * Public face is `getCurrentEdition()` when `EDITION_PRELAUNCH` is false.
 * DEV `?edition=` overlays drafts only; the live current edition is not
 * preview-overlaid. Future PREVIOUS EDITIONS can read `getPublishedEditions()`.
 */

export const EDITION_001: Edition = {
  id: "001",
  number: 1,
  stockedAt: "2026-09-18",
  launchAt: "2026-09-18",
  status: "current",
  slots: [
    { slot: "A1", productId: "singer-mini" },
    { slot: "A2", productId: "field-notes", badge: "house-favorite" },
    { slot: "A3", productId: "ticktime-2-max" },
    { slot: "A4", productId: "midori-ruler" },
    { slot: "B1", productId: "stimeez-emotion-explorers", badge: "new" },
    { slot: "B2", productId: "polaroid-now-gen-3", badge: "new" },
    { slot: "B3", productId: "awesome-screenshot" },
    { slot: "B4", productId: "tombow-zero" },
    { slot: "C1", productId: "nalgene-stained-glass", badge: "new" },
    { slot: "C2", productId: "hoto-24-1" },
    { slot: "C3", productId: "bludot-100-trays" },
    { slot: "C4", productId: "horizon" },
    { slot: "D1", productId: "leatherman-skeletool-cx", badge: "new" },
    { slot: "D2", productId: "pocket-ref", badge: "house-favorite" },
    { slot: "D3", productId: "excalidraw", badge: "new" },
    { slot: "D4", productId: "satechi-findall-card" },
  ],
}

export const EDITIONS: Edition[] = [EDITION_001]

export function getEditionById(id: string): Edition | undefined {
  return EDITIONS.find((edition) => edition.id === id)
}

export function getDraftEdition(): Edition | undefined {
  return EDITIONS.filter((edition) => edition.status === "draft").sort(
    (a, b) => b.number - a.number,
  )[0]
}

export function getCurrentEdition(): Edition | undefined {
  const marked = EDITIONS.find((edition) => edition.status === "current")
  if (marked) return marked
  if (isEditionLive()) return EDITION_001
  return undefined
}

/** Current + previous faces. Ready for a future public PREVIOUS EDITIONS list. */
export function getPublishedEditions(): Edition[] {
  const published = EDITIONS.filter(
    (edition) => edition.status === "current" || edition.status === "previous",
  )
  const current = getCurrentEdition()
  if (current && !published.some((edition) => edition.id === current.id)) {
    published.push(current)
  }
  return published.sort((a, b) => b.number - a.number)
}

export function editionSlotRecord(edition: Edition): Record<SlotCode, string> {
  const slots = makeEmptySlots()
  for (const entry of edition.slots) {
    slots[entry.slot] = entry.productId
  }
  return slots
}

export function editionHasAllSlots(edition: Edition): boolean {
  const bySlot = new Map(edition.slots.map((entry) => [entry.slot, entry.productId]))
  return SLOT_CODES.every((code) => Boolean(bySlot.get(code)))
}

export function editionBadgeForSlot(
  edition: Edition,
  slot: SlotCode,
): EditionSlotBadge | undefined {
  return edition.slots.find((entry) => entry.slot === slot)?.badge
}

export function editionNewCount(edition: Edition): number {
  return edition.slots.filter((entry) => entry.badge === "new").length
}
