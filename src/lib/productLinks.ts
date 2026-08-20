import type { Product } from "../types/product"

export function productOutboundUrl(
  product: Pick<Product, "sourceUrl">,
): string | null {
  const raw = product.sourceUrl?.trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return raw
  } catch {
    return null
  }
}
