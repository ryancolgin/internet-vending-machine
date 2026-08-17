import { getProduct } from "../../data/products"
import { ProductFigure, type ProductVisual } from "../ProductFigure"
import { useMachine } from "../../state/MachineContext"

const HAUL_VISUAL: ProductVisual = "illustration"

export function HaulDrawer() {
  const {
    haulOpen,
    haul,
    setHaulOpen,
    setShareOpen,
    shareHaul,
    removeFromHaul,
    keepStocked,
    alreadyOwn,
    reactions,
  } = useMachine()

  if (!haulOpen) return null

  return (
    <div
      className="haul-drawer"
      role="dialog"
      aria-labelledby="haul-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) setHaulOpen(false)
      }}
    >
      <div className="panel">
        <h2 id="haul-title">YOUR HAUL · {haul.length}</h2>
        {haul.length === 0 ? (
          <p>Nothing has dropped yet. Vend something you would actually consider getting.</p>
        ) : (
          <ul className="haul-list">
            {haul.map((item) => {
              const product = getProduct(item.productId)
              if (!product) return null
              const notedKeep = Boolean(reactions[product.id]?.keep)
              const notedOwn = Boolean(reactions[product.id]?.own)
              return (
                <li key={item.productId} className="haul-item">
                  <ProductFigure product={product} visual={HAUL_VISUAL} />
                  <div>
                    <p className="haul-item__name">{product.name}</p>
                    <p className="haul-item__price">
                      {item.slotCode} · {product.priceLabel}
                    </p>
                    <div className="haul-item__actions">
                      <button
                        type="button"
                        className={`ghost${notedKeep ? " ghost--on" : ""}`}
                        onClick={() => keepStocked(product.id)}
                      >
                        KEEP STOCKED
                      </button>
                      <button
                        type="button"
                        className={`ghost${notedOwn ? " ghost--on" : ""}`}
                        onClick={() => alreadyOwn(product.id)}
                      >
                        ALREADY OWN
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => removeFromHaul(product.id)}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="panel__actions">
          <button type="button" className="vend" onClick={() => void shareHaul()}>
            SHARE YOUR HAUL
          </button>
          <button type="button" className="ghost" onClick={() => setShareOpen(true)}>
            HAUL CARD
          </button>
          <button type="button" className="ghost" onClick={() => setHaulOpen(false)}>
            BACK TO MACHINE
          </button>
        </div>
      </div>
    </div>
  )
}
