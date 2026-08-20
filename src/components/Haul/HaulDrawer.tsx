import { getProduct } from "../../data/products"
import { ProductFigure, type ProductVisual } from "../ProductFigure"
import { ProductOutboundLink } from "../ProductOutboundLink"
import { useMachine } from "../../state/MachineContext"

const HAUL_VISUAL: ProductVisual = "illustration"

export function HaulDrawer() {
  const {
    haulOpen,
    haul,
    setHaulOpen,
    setShareOpen,
    removeFromHaul,
    keepStocked,
    alreadyOwn,
    reactions,
    restockId,
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
          <p className="haul-empty">
            Nothing has dropped yet. Vend something you would actually consider getting.
          </p>
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
                      {item.slotCode
                        ? `${item.slotCode} · ${product.priceLabel}`
                        : product.priceLabel}
                    </p>
                    <div className="haul-item__actions">
                      <ProductOutboundLink
                        product={product}
                        from="haul"
                        restockId={restockId}
                        slotCode={item.slotCode}
                        className="ghost haul-item__outbound"
                      />
                      <button
                        type="button"
                        className={`ghost${notedKeep ? " ghost--on" : ""}`}
                        aria-pressed={notedKeep}
                        onClick={() => keepStocked(product.id)}
                      >
                        KEEP STOCKED
                      </button>
                      <button
                        type="button"
                        className={`ghost${notedOwn ? " ghost--on" : ""}`}
                        aria-pressed={notedOwn}
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
          <button type="button" className="vend" onClick={() => setShareOpen(true)}>
            VIEW HAUL CARD
          </button>
          <button type="button" className="ghost" onClick={() => setHaulOpen(false)}>
            BACK TO MACHINE
          </button>
        </div>
      </div>
    </div>
  )
}
