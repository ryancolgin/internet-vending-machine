import type {
  Product,
  ProductImageFit,
  ProductImagePosition,
} from "../types/product"

export type ProductGalleryPhoto = {
  src: string
  fit: ProductImageFit
  position: ProductImagePosition
}

export type ProductMedia = {
  slotImage: ProductGalleryPhoto | null
  galleryImages: ProductGalleryPhoto[]
}

function photoFit(value: ProductImageFit | undefined): ProductImageFit {
  return value === "cover" ? "cover" : "contain"
}

function photoPosition(value: ProductImagePosition | undefined): ProductImagePosition {
  return value === "top" ? "top" : "center"
}

function assetPath(src: string): string {
  const bare = src.split("#")[0].split("?")[0]
  try {
    if (/^https?:\/\//i.test(bare)) {
      return new URL(bare).pathname
    }
  } catch {
    /* keep bare path */
  }
  return bare
}

/**
 * Inspector gallery.
 * Frame 1 is the dedicated slot asset when one exists (contain unless
 * inspectorFit is cover). Canonical productImages follow, minus the
 * exact slotSourceImage path when the slot is a derivative of that
 * gallery file. Dedupes only on exact resolved path. Icons are never
 * appended.
 */
export function inspectorGallery(
  product: Pick<
    Product,
    "productImage" | "productImages" | "slotImage" | "slotSourceImage" | "inspectorFit"
  >,
): ProductGalleryPhoto[] {
  const photos: ProductGalleryPhoto[] = []
  const seen = new Set<string>()
  const excluded = new Set(
    product.slotSourceImage ? [assetPath(product.slotSourceImage)] : [],
  )

  const add = (
    src: string | undefined,
    fit: ProductImageFit = "contain",
    position: ProductImagePosition = "center",
  ) => {
    if (!src) return
    const path = assetPath(src)
    if (seen.has(path) || excluded.has(path)) return
    seen.add(path)
    photos.push({ src, fit, position })
  }

  if (product.slotImage) {
    add(
      product.slotImage,
      product.inspectorFit === "cover" ? "cover" : "contain",
      "center",
    )
  }

  for (const entry of product.productImages ?? []) {
    if (typeof entry === "string") add(entry)
    else add(entry.src, photoFit(entry.fit), photoPosition(entry.position))
  }
  add(product.productImage)
  return photos
}

export const productGalleryPhotos = inspectorGallery

export function productMedia(
  product: Pick<
    Product,
    "productImage" | "productImages" | "slotImage" | "slotSourceImage" | "inspectorFit"
  >,
): ProductMedia {
  const galleryImages = inspectorGallery(product)
  if (product.slotImage) {
    return {
      slotImage: { src: product.slotImage, fit: "contain", position: "center" },
      galleryImages,
    }
  }
  return {
    slotImage: galleryImages[0] ?? null,
    galleryImages,
  }
}

export function productSlotImage(
  product: Pick<
    Product,
    "productImage" | "productImages" | "slotImage" | "slotSourceImage" | "inspectorFit"
  >,
): ProductGalleryPhoto | null {
  return productMedia(product).slotImage
}
