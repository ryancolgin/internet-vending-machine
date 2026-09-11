import { useEffect, useState, type CSSProperties } from "react"
import { getIllustration } from "../illustrations/catalog"
import { productSlotImage } from "../lib/productGallery"
import type { Product } from "../types/product"

export type ProductVisual = "illustration" | "photo"

type ProductFigureProps = {
  product: Product
  visual?: ProductVisual
  className?: string
  style?: CSSProperties
}

export function ProductFigure({
  product,
  visual = "illustration",
  className = "",
  style,
}: ProductFigureProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const slotPhoto = productSlotImage(product)

  useEffect(() => {
    setPhotoFailed(false)
  }, [slotPhoto?.src])

  const showPhoto = visual === "photo" && Boolean(slotPhoto) && !photoFailed

  if (showPhoto && slotPhoto) {
    return (
      <div className={`product-figure product-figure--photo ${className}`.trim()} style={style}>
        <img
          src={slotPhoto.src}
          alt=""
          onError={() => setPhotoFailed(true)}
        />
      </div>
    )
  }

  const Glyph = getIllustration(product.illustration)
  return (
    <div className={`product-figure ${className}`.trim()} style={style}>
      <Glyph title={product.name} />
    </div>
  )
}
