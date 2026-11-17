import { track } from "../lib/analytics"
import {
  AFFILIATE_DISCLOSURE,
  isAffiliateDestination,
  productOutboundUrl,
} from "../lib/productLinks"
import type { Product, SlotCode } from "../types/product"

export function AffiliateNote({
  product,
}: {
  product: Pick<Product, "sourceUrl">
}) {
  if (!isAffiliateDestination(product)) return null
  return <span className="affiliate-note">{AFFILIATE_DISCLOSURE}</span>
}

type ProductOutboundLinkProps = {
  product: Product
  from: "inspector" | "haul"
  slotCode?: SlotCode
  restockId?: string
  editionId?: string
  className?: string
}

export function ProductOutboundLink({
  product,
  from,
  slotCode,
  restockId,
  editionId,
  className,
}: ProductOutboundLinkProps) {
  const href = productOutboundUrl(product)
  if (!href) return null

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        track({
          name: from === "haul" ? "haul_product_link_opened" : "product_link_opened",
          restockId,
          productId: product.id,
          slotCode,
          editionId,
        })
      }}
    >
      VIEW PRODUCT ↗
    </a>
  )
}
