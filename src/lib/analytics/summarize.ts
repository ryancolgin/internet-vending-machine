import type { AnalyticsEvent } from "../../types/analytics"
import { getProduct } from "../../data/products"

export type OverallStats = {
  sessions: number
  shown: number
  selections: number
  vends: number
  restocks: number
  shares: number
}

export type ProductStats = {
  productId: string
  name: string
  shown: number
  selections: number
  vends: number
  keepVotes: number
  alreadyOwn: number
  shares: number
  vendRate: number | null
}

export function summarizeEvents(events: AnalyticsEvent[]): {
  overall: OverallStats
  products: ProductStats[]
} {
  const sessions = new Set<string>()
  const byProduct = new Map<string, ProductStats>()

  const overall: OverallStats = {
    sessions: 0,
    shown: 0,
    selections: 0,
    vends: 0,
    restocks: 0,
    shares: 0,
  }

  function row(productId: string): ProductStats {
    const existing = byProduct.get(productId)
    if (existing) return existing
    const created: ProductStats = {
      productId,
      name: getProduct(productId)?.name ?? productId,
      shown: 0,
      selections: 0,
      vends: 0,
      keepVotes: 0,
      alreadyOwn: 0,
      shares: 0,
      vendRate: null,
    }
    byProduct.set(productId, created)
    return created
  }

  for (const event of events) {
    sessions.add(event.sessionId)
    switch (event.name) {
      case "product_shown":
        overall.shown += 1
        if (event.productId) row(event.productId).shown += 1
        break
      case "slot_selected":
        overall.selections += 1
        if (event.productId) row(event.productId).selections += 1
        break
      case "product_vended":
        overall.vends += 1
        if (event.productId) row(event.productId).vends += 1
        break
      case "restock_triggered":
        overall.restocks += 1
        break
      case "share_item":
        overall.shares += 1
        if (event.productId) row(event.productId).shares += 1
        break
      case "share_haul":
        overall.shares += 1
        break
      case "keep_stocked":
        if (event.productId) row(event.productId).keepVotes += 1
        break
      case "already_own":
        if (event.productId) row(event.productId).alreadyOwn += 1
        break
    }
  }

  overall.sessions = sessions.size

  const products = [...byProduct.values()]
    .map((product) => ({
      ...product,
      vendRate: product.shown > 0 ? product.vends / product.shown : null,
    }))
    .sort((a, b) => b.vends - a.vends || b.shown - a.shown || a.name.localeCompare(b.name))

  return { overall, products }
}

export function formatRate(value: number | null): string {
  if (value === null) return "—"
  return `${Math.round(value * 100)}%`
}
