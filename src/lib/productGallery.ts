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

function firstProductImageSrc(
  product: Pick<Product, "productImage" | "productImages">,
): string | undefined {
  const entry = product.productImages?.[0]
  if (typeof entry === "string") return entry
  if (entry) return entry.src
  return product.productImage
}

function slotLeadsInspector(
  product: Pick<Product, "productImage" | "productImages" | "slotImage" | "slotSourceImage">,
): boolean {
  if (!product.slotImage) return false
  const first = firstProductImageSrc(product)
  if (!first) return true
  if (!product.slotSourceImage) return true
  return assetPath(product.slotSourceImage) === assetPath(first)
}

/**
 * Inspector gallery.
 * The slot asset leads only when it replaces the first gallery image
 * (slotSourceImage matches productImages[0]). Otherwise the slot is
 * machine-only and productImages keep their authored order. Leading
 * slots use contain unless inspectorFit is cover. Dedupes on exact
 * resolved path. Icons are never appended.
 */
export function inspectorGallery(
  product: Pick<
    Product,
    "productImage" | "productImages" | "slotImage" | "slotSourceImage" | "inspectorFit"
  >,
): ProductGalleryPhoto[] {
  const photos: ProductGalleryPhoto[] = []
  const seen = new Set<string>()
  const slotLeads = slotLeadsInspector(product)
  const excluded = new Set(
    slotLeads && product.slotSourceImage ? [assetPath(product.slotSourceImage)] : [],
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

  if (slotLeads && product.slotImage) {
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
