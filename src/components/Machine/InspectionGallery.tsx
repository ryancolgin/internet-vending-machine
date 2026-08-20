import { useLayoutEffect, useRef, useState, type KeyboardEvent, type UIEvent } from "react"
import { productGalleryPhotos } from "../../lib/productGallery"
import type { Product } from "../../types/product"
import { ProductFigure, type ProductVisual } from "../ProductFigure"

type InspectionGalleryProps = {
  product: Product
  visual?: ProductVisual
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function frameIndexFromScroll(track: HTMLElement) {
  const width = track.clientWidth
  if (!width) return 0
  return Math.max(0, Math.round(track.scrollLeft / width))
}

export function InspectionGallery({
  product,
  visual = "illustration",
}: InspectionGalleryProps) {
  const photos = productGalleryPhotos(product)
  const frameCount = 1 + photos.length
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.scrollLeft = 0
    setIndex(0)
  }, [product.id])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const snapToCurrent = () => {
      const slide = track.children[frameIndexFromScroll(track)] as HTMLElement | undefined
      if (!slide) return
      track.scrollLeft = slide.offsetLeft
    }
    const observer = new ResizeObserver(snapToCurrent)
    observer.observe(track)
    return () => observer.disconnect()
  }, [product.id])

  if (photos.length === 0) {
    return (
      <div className="inspection__stage">
        <ProductFigure product={product} visual={visual} />
      </div>
    )
  }

  const goTo = (next: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(frameCount - 1, next))
    const slide = track.children[clamped] as HTMLElement | undefined
    if (!slide) return
    track.scrollTo({
      left: slide.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
    setIndex(clamped)
  }

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    setIndex(frameIndexFromScroll(event.currentTarget))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      goTo(index - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      goTo(index + 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      goTo(0)
    } else if (event.key === "End") {
      event.preventDefault()
      goTo(frameCount - 1)
    }
  }

  return (
    <div className="inspection__stage inspection__stage--gallery">
      <div
        className="inspection-gallery"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${product.shortName ?? product.name} images`}
        onKeyDown={onKeyDown}
      >
        <div className="inspection-gallery__viewport">
          <div
            ref={trackRef}
            className="inspection-gallery__track"
            tabIndex={0}
            onScroll={onScroll}
          >
            <div className="inspection-gallery__slide" aria-hidden="true">
              <ProductFigure product={product} visual="illustration" />
            </div>
            {photos.map((photo, photoIndex) => (
              <div
                className={`inspection-gallery__slide${
                  photo.fit === "cover" ? " inspection-gallery__slide--cover" : ""
                }`}
                key={photo.src}
                aria-hidden={index !== photoIndex + 1}
              >
                <img
                  src={photo.src}
                  alt={`${product.name}, photo ${photoIndex + 1} of ${photos.length}`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="inspection-gallery__dots">
          {Array.from({ length: frameCount }, (_, frame) => (
            <button
              type="button"
              key={frame}
              className={`inspection-gallery__dot${frame === index ? " is-active" : ""}`}
              aria-label={
                frame === 0
                  ? "Show machine illustration"
                  : `Show photo ${frame} of ${photos.length}`
              }
              aria-current={frame === index ? "true" : undefined}
              onClick={() => goTo(frame)}
            />
          ))}
        </div>
        <button
          type="button"
          className="inspection-gallery__nav inspection-gallery__nav--prev"
          aria-label="Previous image"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        />
        <button
          type="button"
          className="inspection-gallery__nav inspection-gallery__nav--next"
          aria-label="Next image"
          disabled={index === frameCount - 1}
          onClick={() => goTo(index + 1)}
        />
      </div>
    </div>
  )
}
