import type { Product } from "../types/product"

/** Impact tracking hosts already used in product destinations. */
const AFFILIATE_HOSTS = ["pxf.io", "sjv.io"]

export const AFFILIATE_DISCLOSURE =
  "Affiliate link · I may earn a commission at no extra cost to you."

export function isAffiliateDestination(
  product: Pick<Product, "sourceUrl">,
): boolean {
  const href = productOutboundUrl(product)
  if (!href) return false
  const host = new URL(href).hostname.toLowerCase()
  return AFFILIATE_HOSTS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  )
}

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
