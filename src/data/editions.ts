import type { Edition, EditionSlotBadge } from "../types/edition"
import { SLOT_CODES, type SlotCode } from "../types/product"
import { makeEmptySlots } from "../lib/slots"

/**
 * Edition catalog. Draft only until Friday.
 *
 * The public/test machine still reads INITIAL_SLOT_PRODUCT_IDS, localStorage
 * slots, and restockMachine(). A DEV-only `?edition=001` overlay can render
 * this draft without persisting it or changing production behavior.
 *
 * Friday activation (manual, do not automate yet):
 * 1. Set EDITION_001.status to "current".
 * 2. Make Edition 001 the public slot source: seed MachineContext from
 *    editionSlotRecord(getCurrentEdition()) instead of
 *    INITIAL_SLOT_PRODUCT_IDS, and stop hydrating public slots from
 *    test localStorage restocks.
 * 3. Hide RESTOCK MACHINE on the public machine (Machine.tsx +
 *    InspectionPanel RestockControl). Keep it in development / sandbox.
 * 4. In src/types/machine.ts, set EDITION_PRELAUNCH = false so the header
 *    tail changes from `EDITION 001 · LAUNCHES FRI 09.18` to
 *    `EDITION 001 · FRI 09.18`.
 * 5. Do not add edition navigation or a previous-editions UI in that pass.
 */

export const EDITION_001: Edition = {
  id: "001",
  number: 1,
  stockedAt: "2026-09-18",
  launchAt: "2026-09-18",
  status: "draft",
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
  return EDITIONS.find((edition) => edition.status === "current")
}

export function getPublishedEditions(): Edition[] {
  return EDITIONS.filter(
    (edition) => edition.status === "current" || edition.status === "previous",
  ).sort((a, b) => b.number - a.number)
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
