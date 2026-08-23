import { useEffect, useState, type CSSProperties } from "react"
import { getIllustration } from "../illustrations/catalog"
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

  useEffect(() => {
    setPhotoFailed(false)
  }, [product.productImage])

  const showPhoto = visual === "photo" && Boolean(product.productImage) && !photoFailed

  if (showPhoto && product.productImage) {
    return (
      <div className={`product-figure product-figure--photo ${className}`.trim()} style={style}>
        <img
          src={product.productImage}
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
