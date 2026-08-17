import { getProduct } from "../../data/products"
import { parseShareHash } from "../../lib/share"
import type { Product } from "../../types/product"
import { ProductFigure, type ProductVisual } from "../ProductFigure"
import { useMachine } from "../../state/MachineContext"
import { MACHINE_NUMBER } from "../../types/machine"

const HAUL_CARD_VISUAL: ProductVisual = "illustration"

export function HaulShareCard() {
  const { shareOpen, haul, setShareOpen, shareHaul } = useMachine()
  if (!shareOpen) return null

  const hashed = parseShareHash(window.location.hash).haulIds ?? []
  const ids = hashed.length > 0 ? hashed : haul.map((item) => item.productId)
  const products = ids
    .map((id) => getProduct(id))
    .filter((product): product is Product => Boolean(product))

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
            {products.map((product) => (
              <div key={product.id} className="share-card__cell">
                <ProductFigure product={product} visual={HAUL_CARD_VISUAL} />
              </div>
            ))}
          </div>
          <p className="share-card__foot" style={{ marginTop: 16 }}>
            {products.length} THING{products.length === 1 ? "" : "S"} FROM THE MACHINE
          </p>
        </div>
        <div className="panel__actions">
          <button type="button" className="vend" onClick={() => void shareHaul()}>
            SHARE YOUR HAUL
          </button>
          <button type="button" className="ghost" onClick={() => setShareOpen(false)}>
            BACK TO MACHINE
          </button>
        </div>
      </div>
    </div>
  )
}
