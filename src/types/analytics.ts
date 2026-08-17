export type AnalyticsEventName =
  | "slot_selected"
  | "product_vended"
  | "keep_stocked"
  | "already_own"
  | "share_item"
  | "share_haul"
  | "restock_triggered"
  | "product_shown"

export type AnalyticsEvent = {
  name: AnalyticsEventName
  timestamp: string
  sessionId: string
  productId?: string
  restockId?: string
  slotCode?: string
}
