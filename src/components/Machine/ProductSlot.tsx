import { ProductFigure } from "../ProductFigure"
import { BADGE_LABEL, type Product, type SlotCode } from "../../types/product"

type ProductSlotProps = {
  code: SlotCode
  product: Product
  selected: boolean
  onSelect: () => void
}

export function ProductSlot({ code, product, selected, onSelect }: ProductSlotProps) {
  const badge = product.badges?.[0]
  return (
    <button
      type="button"
      className={`slot${selected ? " slot--selected" : ""}`}
      data-slot={code}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${code}, ${product.name}, ${product.priceLabel}`}
    >
      <div className="slot__chrome">
        <span className="slot__code">{code}</span>
        {badge ? <span className="slot__badge">{BADGE_LABEL[badge]}</span> : <span />}
      </div>
      <div className="slot__well">
        <ProductFigure product={product} visual="illustration" />
      </div>
      <div className="slot__meta">
        <div className="slot__copy">
          <div className="slot__name">{product.shortName ?? product.name}</div>
          <div className="slot__price">{product.priceLabel}</div>
        </div>
        <span className="slot__selector" aria-hidden="true">
          <span className="slot__lamp" />
        </span>
      </div>
    </button>
  )
}
