import { getProduct } from "../../data/products"
import { parseShareHash } from "../../lib/share"
import type { Product } from "../../types/product"
import { ProductFigure, type ProductVisual } from "../ProductFigure"
import { useMachine } from "../../state/MachineContext"
import { MACHINE_NUMBER } from "../../types/machine"

const HAUL_CARD_VISUAL: ProductVisual = "illustration"
const HAUL_CARD_CELLS = 16

function haulCardFoot(count: number): string {
  if (count >= HAUL_CARD_CELLS) return "16 / 16 · FULL MACHINE"
  return `${count} / 16 THINGS FROM THE MACHINE`
}

export function HaulShareCard() {
  const { shareOpen, haul, setShareOpen, shareHaul, notice } = useMachine()
  if (!shareOpen) return null

  const hashed = parseShareHash(window.location.hash).haulIds ?? []
  const ids = hashed.length > 0 ? hashed : haul.map((item) => item.productId)
  const products = ids
    .map((id) => getProduct(id))
    .filter((product): product is Product => Boolean(product))
  const cells = Array.from({ length: HAUL_CARD_CELLS }, (_, index) => products[index])
  const haulNotice =
    notice?.message === "HAUL LINK COPIED" || notice?.message === "HAUL SHARED"
      ? notice
      : null

  return (
    <div
      className="share-view"
      role="dialog"
      aria-labelledby="share-card-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) setShareOpen(false)
      }}
    >
      <div className="panel">
        <div className="share-card">
          <p className="share-card__kicker">INTERNET VENDING MACHINE · № {MACHINE_NUMBER}</p>
          <h2 id="share-card-title" className="share-card__title">
            YOUR HAUL
          </h2>
          <div className="share-card__grid">
            {cells.map((product, index) =>
              product ? (
                <div key={product.id} className="share-card__cell">
                  <ProductFigure product={product} visual={HAUL_CARD_VISUAL} />
                </div>
              ) : (
                <div
                  key={`empty-${index}`}
                  className="share-card__cell share-card__cell--empty"
                  aria-hidden="true"
                />
              ),
            )}
          </div>
          <p className="share-card__foot" style={{ marginTop: 16 }}>
            {haulCardFoot(products.length)}
          </p>
        </div>
        <div className="panel__actions">
          <div className="share-view__share">
            <button type="button" className="vend" onClick={() => void shareHaul()}>
              SHARE YOUR HAUL
            </button>
            {haulNotice ? <span className="notice">{haulNotice.message}</span> : null}
          </div>
          <button type="button" className="ghost" onClick={() => setShareOpen(false)}>
            BACK TO MACHINE
          </button>
        </div>
      </div>
    </div>
  )
}
