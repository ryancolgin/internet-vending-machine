import type { SlotCode } from "./product"

export type HaulItem = {
  productId: string
  slotCode: SlotCode
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

export const NEXT_RESTOCK_LABEL = "FRI 08.21"
export const MACHINE_NUMBER = "001"
export const MACHINE_NAME = "INTERNET VENDING MACHINE"
export const MACHINE_TAGLINE = "GOOD LITTLE THINGS FROM AROUND THE INTERNET"
