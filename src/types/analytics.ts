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
  | "restock_signup_opened"
  | "restock_signup_submitted"
  | "restock_signup_succeeded"
  | "restock_signup_failed"
  | "haul_opened"
  | "haul_card_viewed"
  | "product_link_opened"
  | "haul_product_link_opened"
  | "product_gallery_navigated"

export type AnalyticsEvent = {
  name: AnalyticsEventName
  timestamp: string
  sessionId: string
  clientId?: string
  productId?: string
  restockId?: string
  slotCode?: string
}
