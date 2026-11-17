import type { Product, ProductPromo } from "../types/product"

/**
 * Active sale window. Fail closed: no endsAt, a bad date, or a passed
 * endsAt all return null so a promotional price or badge cannot stick.
 */
export function activePromo(
  product: Pick<Product, "promo">,
  now = new Date(),
): ProductPromo | null {
  const promo = product.promo
  if (!promo?.endsAt || !promo.priceLabel?.trim()) return null
  const ends = Date.parse(promo.endsAt)
  if (Number.isNaN(ends) || now.getTime() >= ends) return null
  return promo
}

export function displayPriceLabel(
  product: Pick<Product, "priceLabel" | "promo">,
  now = new Date(),
): string {
  return activePromo(product, now)?.priceLabel ?? product.priceLabel
}

/** Sale badge, only while the promo window is open. */
export function promoBadgeLabel(
  product: Pick<Product, "promo">,
  now = new Date(),
): string | null {
  const badge = activePromo(product, now)?.badge?.trim()
  return badge || null
}
