import { editionSlotRecord, getCurrentEdition, getEditionById } from "../data/editions"
import { isEditionLive } from "../types/machine"
import type { Edition } from "../types/edition"
import type { SlotCode } from "../types/product"

/** Isolated DEV sandbox face. Never written in production builds. */
export const SANDBOX_SLOTS_KEY = "sandboxSlots"

/** Dev-only `?edition=001` overlay. Production always returns null. */
export function getDevEditionPreview(): Edition | null {
  if (!import.meta.env.DEV) return null
  if (typeof window === "undefined") return null
  const id = new URLSearchParams(window.location.search).get("edition")
  if (!id) return null
  const edition = getEditionById(id)
  if (!edition) return null
  // Live current edition is the public face, not a draft overlay.
  if (isEditionLive() && edition.status === "current") return null
  if (edition.status !== "draft") return null
  return edition
}

/** Stamp new Haul vends with the published/preview edition they came from. */
export function provenanceEditionId(productId: string): string | undefined {
  const edition = getDevEditionPreview() ?? getCurrentEdition()
  if (!edition) return undefined
  return edition.slots.some((slot) => slot.productId === productId)
    ? edition.id
    : undefined
}

export function getDevEditionPreviewSlots(): Record<SlotCode, string> | null {
  const edition = getDevEditionPreview()
  return edition ? editionSlotRecord(edition) : null
}

/** Published edition slots for the public machine. Null while pre-launch. */
export function getPublishedEditionSlots(): Record<SlotCode, string> | null {
  if (!isEditionLive()) return null
  const edition = getCurrentEdition()
  return edition ? editionSlotRecord(edition) : null
}

/**
 * Edition whose face badges and NEW count should drive the machine.
 * Preview overlay wins, then the live public edition.
 */
export function getActiveEditionFace(): Edition | null {
  return getDevEditionPreview() ?? getCurrentEdition() ?? null
}

/**
 * DEV restock after launch, isolated from the published face.
 * Hidden during `?live=1` so that query simulates the public site.
 */
export function isSandboxRestockEnabled(): boolean {
  if (!import.meta.env.DEV) return false
  if (!isEditionLive()) return false
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("live") !== "1"
}

/** RESTOCK MACHINE: public test restock, or isolated DEV sandbox after launch. */
export function showRestockControls(): boolean {
  if (!isEditionLive()) return true
  return isSandboxRestockEnabled()
}

/** RESTOCK LOG is test-era UI. Hidden once an edition is live. */
export function showRestockLog(): boolean {
  return !isEditionLive()
}
