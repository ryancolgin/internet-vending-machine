import { editionSlotRecord, getEditionById } from "../data/editions"
import type { Edition } from "../types/edition"
import type { SlotCode } from "../types/product"

/** Dev-only `?edition=001` overlay. Production always returns null. */
export function getDevEditionPreview(): Edition | null {
  if (!import.meta.env.DEV) return null
  if (typeof window === "undefined") return null
  const id = new URLSearchParams(window.location.search).get("edition")
  if (!id) return null
  return getEditionById(id) ?? null
}

export function getDevEditionPreviewSlots(): Record<SlotCode, string> | null {
  const edition = getDevEditionPreview()
  return edition ? editionSlotRecord(edition) : null
}

/**
 * Edition whose face badges and NEW count should drive the machine.
 * Preview-only until Friday. Then: `getDevEditionPreview() ?? getCurrentEdition()`.
 */
export function getActiveEditionFace(): Edition | null {
  return getDevEditionPreview()
}
