import { track } from "../lib/analytics"
import { productOutboundUrl } from "../lib/productLinks"
import type { Product, SlotCode } from "../types/product"

type ProductOutboundLinkProps = {
  product: Product
  from: "inspector" | "haul"
  slotCode?: SlotCode
  restockId?: string
  className?: string
}

export function ProductOutboundLink({
  product,
  from,
  slotCode,
  restockId,
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
        })
      }}
    >
      VIEW PRODUCT ↗
    </a>
  )
}
