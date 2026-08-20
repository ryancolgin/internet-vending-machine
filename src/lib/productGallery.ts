import type { Product, ProductImageFit } from "../types/product"

export type ProductGalleryPhoto = {
  src: string
  fit: ProductImageFit
}

function photoFit(value: ProductImageFit | undefined): ProductImageFit {
  return value === "cover" ? "cover" : "contain"
}

export function productGalleryPhotos(
  product: Pick<Product, "productImage" | "productImages">,
): ProductGalleryPhoto[] {
  const photos: ProductGalleryPhoto[] = []
  const seen = new Set<string>()

  const add = (src: string | undefined, fit: ProductImageFit = "contain") => {
    if (!src || seen.has(src)) return
    seen.add(src)
    photos.push({ src, fit })
  }

  for (const entry of product.productImages ?? []) {
    if (typeof entry === "string") add(entry)
    else add(entry.src, photoFit(entry.fit))
  }
  add(product.productImage)
  return photos
}
