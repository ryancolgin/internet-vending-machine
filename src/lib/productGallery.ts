import type { Product, ProductImageFit, ProductImagePosition } from "../types/product"

export type ProductGalleryPhoto = {
  src: string
  fit: ProductImageFit
  position: ProductImagePosition
}

function photoFit(value: ProductImageFit | undefined): ProductImageFit {
  return value === "cover" ? "cover" : "contain"
}

function photoPosition(value: ProductImagePosition | undefined): ProductImagePosition {
  return value === "top" ? "top" : "center"
}

export function productGalleryPhotos(
  product: Pick<Product, "productImage" | "productImages">,
): ProductGalleryPhoto[] {
  const photos: ProductGalleryPhoto[] = []
  const seen = new Set<string>()

  const add = (
    src: string | undefined,
    fit: ProductImageFit = "contain",
    position: ProductImagePosition = "center",
  ) => {
    if (!src || seen.has(src)) return
    seen.add(src)
    photos.push({ src, fit, position })
  }

  for (const entry of product.productImages ?? []) {
    if (typeof entry === "string") add(entry)
    else add(entry.src, photoFit(entry.fit), photoPosition(entry.position))
  }
  add(product.productImage)
  return photos
}
