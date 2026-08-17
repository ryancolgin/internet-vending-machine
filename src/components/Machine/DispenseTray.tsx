import { getProduct } from "../../data/products"
import { ProductFigure } from "../ProductFigure"
import { useMachine } from "../../state/MachineContext"

export function DispenseTray() {
  const { dispensingId } = useMachine()
  const product = dispensingId ? getProduct(dispensingId) : undefined

  return (
    <div className="tray-bay">
      <div className="tray__lip" />
      <div className="tray__mouth" />
      <div className="tray" aria-hidden={!product}>
        <span className="tray__label">DISPENSE</span>
        {product ? (
          <div className="tray__item">
            <ProductFigure product={product} visual="illustration" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
