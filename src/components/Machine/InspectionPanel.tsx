import { ProductFigure } from "../ProductFigure"
import { DispenseTray } from "./DispenseTray"
import { RestockControl } from "./RestockControl"
import {
  MOBILE_MACHINE_QUERY,
  TABLET_MACHINE_QUERY,
  useMediaQuery,
} from "../../lib/media"
import { useMachine } from "../../state/MachineContext"
import { NEXT_RESTOCK_LABEL } from "../../types/machine"
import type { Product, ProductBadge, SlotCode } from "../../types/product"

function statusLine(badge?: ProductBadge): string | null {
  if (badge === "leaving") return `LEAVES · ${NEXT_RESTOCK_LABEL}`
  if (badge === "house-stock") return "HOUSE STOCK"
  if (badge === "back-in-machine") return "BACK IN THE MACHINE"
  if (badge === "wildcard") return "WILDCARD"
  if (badge === "new") return "NEW"
  return null
}

type InspectorBodyProps = {
  selectedSlot: SlotCode
  selectedProduct: Product
  compact?: boolean
}

function InspectorBody({ selectedSlot, selectedProduct, compact = false }: InspectorBodyProps) {
  const { vend, keepStocked, alreadyOwn, shareItem, reactions, notice } = useMachine()
  const badge = selectedProduct.badges?.[0]
  const notedKeep = Boolean(reactions[selectedProduct.id]?.keep)
  const notedOwn = Boolean(reactions[selectedProduct.id]?.own)
  const hasPhoto = Boolean(selectedProduct.productImage)

  return (
    <div className="inspector__select">
      <div
        className={`inspection__stage${hasPhoto ? " inspection__stage--photo" : ""}`}
      >
        <ProductFigure product={selectedProduct} visual="photo" />
      </div>
      <div className="inspection__body" key={selectedProduct.id}>
        <p className="inspection__code">{selectedSlot}</p>
        <h2 className="inspection__name">{selectedProduct.name.toUpperCase()}</h2>
        <p className="inspection__price">{selectedProduct.priceLabel}</p>
        <p className="inspection__copy">{selectedProduct.machineCopy}</p>
        <p className="inspection__meta">
          {selectedProduct.source ? (
            <span>SOURCE · {selectedProduct.source.toUpperCase()}</span>
          ) : null}
          {statusLine(badge) ? <span>{statusLine(badge)}</span> : null}
        </p>
      </div>
      <div className={`inspection__actions${compact ? " inspection__actions--compact" : ""}`}>
        <button type="button" className="vend" onClick={vend}>
          VEND →
        </button>
        <div className="inspection__secondary">
          <button
            type="button"
            className={`ghost${notedKeep ? " ghost--on" : ""}`}
            onClick={() => keepStocked()}
          >
            KEEP STOCKED
          </button>
          <button
            type="button"
            className={`ghost${notedOwn ? " ghost--on" : ""}`}
            onClick={() => alreadyOwn()}
          >
            ALREADY OWN
          </button>
          <button type="button" className="ghost" onClick={() => void shareItem()}>
            SHARE
          </button>
        </div>
        {notice ? <span className="notice">{notice.message}</span> : null}
      </div>
    </div>
  )
}

export function InspectionPanel() {
  const { selectedSlot, selectedProduct, inspectorOpen, setInspectorOpen } = useMachine()
  const isMobile = useMediaQuery(MOBILE_MACHINE_QUERY)
  const isTablet = useMediaQuery(TABLET_MACHINE_QUERY)
  const overlayLayout = isMobile || isTablet

  if (!selectedProduct || !selectedSlot) {
    return (
      <aside className="inspector inspector--rail" aria-live="polite" id="inspection">
        <div className="inspector__card">
          <p className="inspector__plate">SELECT</p>
          <p className="inspection__copy">Select a slot.</p>
        </div>
        {!overlayLayout ? (
          <>
            <div className="inspector__mechanism">
              <DispenseTray />
            </div>
            <div className="inspector__controls">
              <RestockControl />
            </div>
          </>
        ) : null}
      </aside>
    )
  }

  return (
    <>
      <aside
        className="inspector inspector--rail"
        aria-live="polite"
        id={overlayLayout ? undefined : "inspection"}
      >
        <div className="inspector__card">
          <p className="inspector__plate">SELECTED</p>
          <InspectorBody selectedSlot={selectedSlot} selectedProduct={selectedProduct} />
        </div>
        {!overlayLayout ? (
          <>
            <div className="inspector__mechanism">
              <DispenseTray />
            </div>
            <div className="inspector__controls">
              <RestockControl />
            </div>
          </>
        ) : null}
      </aside>

      {overlayLayout && inspectorOpen ? (
        <div
          className={`inspector-sheet${isTablet ? " inspector-sheet--tablet" : ""}`}
          role="dialog"
          aria-labelledby="inspector-sheet-title"
        >
          <div className="inspector-sheet__panel">
            <button
              type="button"
              className="inspector-sheet__handle"
              aria-label="Close inspector"
              onClick={() => setInspectorOpen(false)}
            />
            <div className="inspector-sheet__chrome">
              <p className="inspector__plate" id="inspector-sheet-title">
                SELECTED
              </p>
              <button
                type="button"
                className="ghost"
                onClick={() => setInspectorOpen(false)}
              >
                CLOSE
              </button>
            </div>
            <div
              className={`inspector inspector--sheet${isTablet ? " inspector--tablet" : ""}`}
              id="inspection"
            >
              <div className="inspector__card">
                <InspectorBody
                  selectedSlot={selectedSlot}
                  selectedProduct={selectedProduct}
                  compact={isMobile}
                />
              </div>
              <div className="inspector__output">
                <div className="inspector__mechanism">
                  <DispenseTray />
                </div>
                <div className="inspector__controls">
                  <RestockControl />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
