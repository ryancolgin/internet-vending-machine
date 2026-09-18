import type { SlotCode } from "./product"

export type HaulItem = {
  productId: string
  slotCode?: SlotCode
  vendedAt: string
  /** Set on new vends from a published edition face. Pre-launch entries omit this. */
  editionId?: string
}

export type RestockLogEntry = {
  id: string
  at: string
  productIds: string[]
  retainedIds: string[]
}

export type HaulSnapshot = {
  id: string
  createdAt: string
  productIds: string[]
  restockId?: string
}

export type ModalId = "suggest" | "stock" | "follow" | "log"

export type NoticeKind = "vend" | "keep" | "own" | "share" | "restock"

export type Notice = {
  kind: NoticeKind
  message: string
}

export const NEXT_RESTOCK_LABEL = "FRI 09.18"
export const EDITION_LABEL = "EDITION 001"
/**
 * Public launch switch. `false` makes Edition 001 the public machine.
 * DEV-only `?live=1` is unused once this is false.
 */
export const EDITION_PRELAUNCH = false

export function isEditionLive(): boolean {
  if (!EDITION_PRELAUNCH) return true
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("live") === "1"
  }
  return false
}

export function machineStatusTail(): string {
  return isEditionLive()
    ? `${EDITION_LABEL} · ${NEXT_RESTOCK_LABEL}`
    : `${EDITION_LABEL} · LAUNCHES ${NEXT_RESTOCK_LABEL}`
}

export function machineServicePlate(): string {
  return isEditionLive()
    ? "IVM-001 · EDITION 001 · NO PURCHASE"
    : "IVM-001 · TEST UNIT · NO PURCHASE"
}

export const MACHINE_STATUS_TAIL = EDITION_PRELAUNCH
  ? `${EDITION_LABEL} · LAUNCHES ${NEXT_RESTOCK_LABEL}`
  : `${EDITION_LABEL} · ${NEXT_RESTOCK_LABEL}`
export const MACHINE_NUMBER = "001"
export const MACHINE_NAME = "THE INTERNET VENDING MACHINE"
export const MACHINE_TAGLINE = "GOOD LITTLE THINGS FROM AROUND THE INTERNET"
