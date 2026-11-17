import {
  editionSlotRecord,
  getCurrentEdition,
  getEditionById,
  getPublishedEditions,
  EDITIONS,
} from "../data/editions"
import { isEditionLive } from "../types/machine"
import type { Edition, EditionStatus } from "../types/edition"
import type { SlotCode } from "../types/product"

/** Isolated DEV sandbox face. Never written in production builds. */
export const SANDBOX_SLOTS_KEY = "sandboxSlots"

/** Fired after a client-side edition change so the machine can re-read the URL. */
export const EDITION_VIEW_EVENT = "ivm-edition-view"

export function readEditionQuery(): string | null {
  if (typeof window === "undefined") return null
  const id = new URLSearchParams(window.location.search).get("edition")?.trim()
  return id || null
}

/**
 * Face for this URL.
 * No query, an unknown id, or a draft id in a production build: the current edition.
 * A published id (`current` or `previous`) resolves in every build.
 * A draft id resolves only in DEV.
 */
export function resolveEditionView(): Edition | null {
  const current = getCurrentEdition() ?? null
  const requested = readEditionQuery()
  if (!requested) return current
  const edition = getEditionById(requested)
  if (!edition) return current
  if (edition.status === "draft" && !import.meta.env.DEV) return current
  return edition
}

/** Editions a visitor can step through. Drafts are included only in DEV. */
export function browsableEditions(): Edition[] {
  const published = getPublishedEditions()
  const visible = import.meta.env.DEV
    ? [
        ...published,
        ...EDITIONS.filter(
          (edition) =>
            edition.status === "draft" &&
            !published.some((item) => item.id === edition.id),
        ),
      ]
    : published
  return visible.sort((a, b) => a.number - b.number)
}

export function adjacentEditions(edition: Edition | null): {
  previous: Edition | null
  next: Edition | null
} {
  if (!edition) return { previous: null, next: null }
  const list = browsableEditions()
  const index = list.findIndex((item) => item.id === edition.id)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: list[index - 1] ?? null,
    next: list[index + 1] ?? null,
  }
}

/** Public label for the face being viewed. */
export function editionPhaseLabel(status: EditionStatus): "CURRENT" | "PREVIOUS" | "DRAFT" {
  if (status === "draft") return "DRAFT"
  if (status === "previous") return "PREVIOUS"
  return "CURRENT"
}

/**
 * Point the URL at an edition without reloading.
 * The current edition uses `/` so the public default stays canonical.
 * `/?edition=001` still resolves when that edition is current.
 */
export function showEditionInUrl(id: string): void {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  const current = getCurrentEdition()
  if (current && id === current.id) url.searchParams.delete("edition")
  else url.searchParams.set("edition", id)
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.pushState({}, "", next)
  window.dispatchEvent(new Event(EDITION_VIEW_EVENT))
}

/** Stamp a vend with the edition currently on screen. */
export function provenanceEditionId(): string | undefined {
  return resolveEditionView()?.id
}

/** Slots for the edition in the URL, including the current edition at `/`. */
export function getViewedEditionSlots(): Record<SlotCode, string> | null {
  const edition = resolveEditionView()
  return edition ? editionSlotRecord(edition) : null
}

/** Published current-edition slots. Null while pre-launch. */
export function getPublishedEditionSlots(): Record<SlotCode, string> | null {
  if (!isEditionLive()) return null
  const edition = getCurrentEdition()
  return edition ? editionSlotRecord(edition) : null
}

/**
 * Edition whose face badges and NEW count should drive the machine.
 */
export function getActiveEditionFace(): Edition | null {
  return resolveEditionView()
}

/**
 * DEV restock used to reshuffle the published face.
 * Curated editions stay fixed, so this stays off.
 */
export function isSandboxRestockEnabled(): boolean {
  return false
}

/** RESTOCK MACHINE only before an edition is the public face. */
export function showRestockControls(): boolean {
  return !isEditionLive()
}

/** RESTOCK LOG is test-era UI. Hidden once an edition is live. */
export function showRestockLog(): boolean {
  return !isEditionLive()
}
