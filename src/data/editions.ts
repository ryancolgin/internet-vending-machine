import type { Edition, EditionSlotBadge } from "../types/edition"
import { SLOT_CODES, type SlotCode } from "../types/product"
import { makeEmptySlots } from "../lib/slots"
import { isEditionLive, MACHINE_NUMBER } from "../types/machine"

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
  status: "previous",
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

/**
 * Published November 17, 2026. Edition 001 is previous.
 *
 * penco-tape is the intended small wildcard and is not slotted. Its
 * status is still "test" and its metrics are empty, so it is not eligible.
 * rhodia-16 holds that seat, in B1.
 *
 * The Polaroid album is not slotted. WiiM Sound Lite is the variety
 * alternate: audio, rather than a second Polaroid.
 *
 * XTEINK X4 Classic is not in inventory. Do not write its Nov 16–18
 * promotional price into priceLabel. Sales belong on product.promo
 * with an endsAt, and stop displaying when that instant passes.
 *
 * launchAt is the publication date. The header stamp is derived from it.
 */
export const EDITION_002: Edition = {
  id: "002",
  number: 2,
  stockedAt: "2026-11-17",
  launchAt: "2026-11-17",
  status: "current",
  slots: [
    { slot: "A1", productId: "field-notes", badge: "house-favorite" },
    { slot: "A2", productId: "nitecore-tube", badge: "new" },
    { slot: "A3", productId: "pocket-ref", badge: "house-favorite" },
    { slot: "A4", productId: "nalgene-storage-jar-32oz", badge: "new" },
    { slot: "B1", productId: "rhodia-16", badge: "new" },
    { slot: "B2", productId: "polaroid-lab", badge: "new" },
    { slot: "B3", productId: "kaweco-sport", badge: "new" },
    { slot: "B4", productId: "excalidraw", badge: "returning" },
    { slot: "C1", productId: "xteink-x4-pro", badge: "new" },
    { slot: "C2", productId: "bludot-ends-trays", badge: "new" },
    { slot: "C3", productId: "chef-iq-sense", badge: "new" },
    { slot: "C4", productId: "stimeez-emotion-explorers", badge: "returning" },
    { slot: "D1", productId: "satechi-onthego-7-in-1", badge: "new" },
    { slot: "D2", productId: "wiim-sound-lite", badge: "new" },
    { slot: "D3", productId: "level8-packing-cubes", badge: "new" },
    { slot: "D4", productId: "flipper-zero", badge: "new" },
  ],
}

export const EDITIONS: Edition[] = [EDITION_001, EDITION_002]

const STAMP_WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const

/** `2026-11-17` → `TUE 11.17`, using the UTC calendar date. */
export function editionStamp(edition: Pick<Edition, "launchAt" | "stockedAt">): string {
  const raw = edition.launchAt ?? edition.stockedAt
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (!match) return raw
  const weekday =
    STAMP_WEEKDAYS[
      new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).getUTCDay()
    ]
  return `${weekday} ${match[2]}.${match[3]}`
}

/** `EDITION 002 · TUE 11.17` */
export function editionStatusLine(edition: Edition): string {
  return `EDITION ${edition.id} · ${editionStamp(edition)}`
}

/** `IVM-001 · EDITION 002 · NO PURCHASE` */
export function editionServicePlate(edition: Edition): string {
  return `IVM-${MACHINE_NUMBER} · EDITION ${edition.id} · NO PURCHASE`
}

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
