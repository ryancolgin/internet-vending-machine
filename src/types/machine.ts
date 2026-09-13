import type { SlotCode } from "./product"

export type HaulItem = {
  productId: string
  slotCode?: SlotCode
  vendedAt: string
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
/** Flip to false on Friday → `EDITION 001 · FRI 09.18`. */
export const EDITION_PRELAUNCH = true
export const MACHINE_STATUS_TAIL = EDITION_PRELAUNCH
  ? `${EDITION_LABEL} · LAUNCHES ${NEXT_RESTOCK_LABEL}`
  : `${EDITION_LABEL} · ${NEXT_RESTOCK_LABEL}`
export const MACHINE_NUMBER = "001"
export const MACHINE_NAME = "THE INTERNET VENDING MACHINE"
export const MACHINE_TAGLINE = "GOOD LITTLE THINGS FROM AROUND THE INTERNET"
