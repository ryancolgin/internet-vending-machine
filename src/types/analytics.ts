export type AnalyticsEventName =
  | "slot_selected"
  | "product_vended"
  | "keep_stocked"
  | "keep_stocked_removed"
  | "already_own"
  | "already_own_removed"
  | "share_item"
  | "share_haul"
  | "restock_triggered"
  | "product_shown"
  | "help_opened"
  | "suggest_opened"
  | "stock_product_opened"
  | "follow_restocks_opened"
  | "haul_opened"
  | "haul_card_viewed"
  | "product_link_opened"
  | "haul_product_link_opened"

export type AnalyticsEvent = {
  name: AnalyticsEventName
  timestamp: string
  sessionId: string
  productId?: string
  restockId?: string
  slotCode?: string
}
