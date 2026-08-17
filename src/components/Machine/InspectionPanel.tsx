import { useEffect, useRef, useState, type PointerEvent } from "react"
import { ProductFigure, type ProductVisual } from "../ProductFigure"
import { DispenseTray } from "./DispenseTray"
import { RestockControl } from "./RestockControl"
import {
  MOBILE_MACHINE_QUERY,
  TABLET_MACHINE_QUERY,
  useMediaQuery,
} from "../../lib/media"
import { useMachine } from "../../state/MachineContext"
import { NEXT_RESTOCK_LABEL } from "../../types/machine"
import { slotForProduct } from "../../lib/slots"
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
  selectedSlot: SlotCode | null
  selectedProduct: Product
  inMachine: boolean
  compact?: boolean
  visual?: ProductVisual
}

export function InspectorBody({
  selectedSlot,
  selectedProduct,
  inMachine,
  compact = false,
  visual = "photo",
}: InspectorBodyProps) {
  const { vend, keepStocked, alreadyOwn, shareItem, reactions, notice, shareOpen } =
    useMachine()
  const badge = selectedProduct.badges?.[0]
  const notedKeep = Boolean(reactions[selectedProduct.id]?.keep)
  const notedOwn = Boolean(reactions[selectedProduct.id]?.own)
  const hasPhoto = Boolean(selectedProduct.productImage)
  const inspectorNotice =
    notice && !shareOpen && notice.kind !== "restock" ? notice : null
  const offMachineLabel =
    selectedProduct.status === "retired" || selectedProduct.status === "archived"
      ? "PAST STOCK"
      : "NOT CURRENTLY STOCKED"

  return (
    <div className="inspector__select">
      <div
        className={`inspection__stage${hasPhoto ? " inspection__stage--photo" : ""}`}
      >
        <ProductFigure product={selectedProduct} visual={visual} />
      </div>
      <div className="inspection__body" key={selectedProduct.id}>
        <p className="inspection__code">{inMachine && selectedSlot ? selectedSlot : "—"}</p>
        <h2 className="inspection__name">{selectedProduct.name.toUpperCase()}</h2>
        <p className="inspection__price">{selectedProduct.priceLabel}</p>
        <p className="inspection__copy">{selectedProduct.machineCopy}</p>
        <p className="inspection__meta">
          {selectedProduct.source ? (
            <span>SOURCE · {selectedProduct.source.toUpperCase()}</span>
          ) : null}
          {inMachine ? (
            statusLine(badge) ? <span>{statusLine(badge)}</span> : null
          ) : (
            <span>{offMachineLabel}</span>
          )}
        </p>
      </div>
      <div className={`inspection__actions${compact ? " inspection__actions--compact" : ""}`}>
        <button type="button" className="vend" onClick={vend} disabled={!inMachine}>
          VEND →
        </button>
        <div className="inspection__secondary">
          <button
            type="button"
            className={`ghost${notedKeep ? " ghost--on" : ""}`}
            aria-pressed={notedKeep}
            onClick={() => keepStocked(selectedProduct.id)}
          >
            KEEP STOCKED
          </button>
          <button
            type="button"
            className={`ghost${notedOwn ? " ghost--on" : ""}`}
            aria-pressed={notedOwn}
            onClick={() => alreadyOwn(selectedProduct.id)}
          >
            ALREADY OWN
          </button>
          <button type="button" className="ghost" onClick={() => void shareItem()}>
            SHARE
          </button>
        </div>
        {inspectorNotice ? <span className="notice">{inspectorNotice.message}</span> : null}
      </div>
    </div>
  )
}

type SheetDrag = {
  pointerId: number
  startY: number
  lastY: number
  lastT: number
  velocity: number
}

const SHEET_RESTING_DVH = 55
const SHEET_EXPANDED_DVH = 80

export function InspectionPanel() {
  const { selectedSlot, selectedProduct, inspectorOpen, setInspectorOpen, slots } =
    useMachine()
  const isMobile = useMediaQuery(MOBILE_MACHINE_QUERY)
  const isTablet = useMediaQuery(TABLET_MACHINE_QUERY)
  const overlayLayout = isMobile || isTablet
  const inMachine = Boolean(
    selectedProduct && slotForProduct(slots, selectedProduct.id),
  )
  const [expanded, setExpanded] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<SheetDrag | null>(null)
  const suppressHandleClick = useRef(false)

  useEffect(() => {
    if (!inspectorOpen) {
      setExpanded(false)
      setDragY(0)
      setDragging(false)
      drag.current = null
    }
  }, [inspectorOpen])

  const closeSheet = () => setInspectorOpen(false)
  const snapHeight = expanded ? SHEET_EXPANDED_DVH : SHEET_RESTING_DVH

  const onGrabPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!isMobile || event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest("[data-sheet-close]")) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
    }
    setDragging(true)
  }

  const onGrabPointerMove = (event: PointerEvent<HTMLElement>) => {
    const active = drag.current
    if (!active || event.pointerId !== active.pointerId) return
    const y = event.clientY - active.startY
    const dt = event.timeStamp - active.lastT
    if (dt > 0) active.velocity = (event.clientY - active.lastY) / dt
    active.lastY = event.clientY
    active.lastT = event.timeStamp
    setDragY(y)
  }

  const endGrab = (event: PointerEvent<HTMLElement>) => {
    const active = drag.current
    if (!active || event.pointerId !== active.pointerId) return
    const y = event.clientY - active.startY
    const flickUp = active.velocity < -0.45
    const flickDown = active.velocity > 0.45
    drag.current = null
    setDragging(false)
    if (Math.abs(y) > 10) suppressHandleClick.current = true

    if (y < -36 || flickUp) {
      setExpanded(true)
      setDragY(0)
      return
    }
    if (expanded && (y > 36 || flickDown)) {
      setExpanded(false)
      setDragY(0)
      return
    }
    if (!expanded && (y > 140 || (flickDown && y > 72))) {
      closeSheet()
      setDragY(0)
      return
    }
    setDragY(0)
  }

  const onHandleClick = () => {
    if (suppressHandleClick.current) {
      suppressHandleClick.current = false
      return
    }
    setExpanded((open) => !open)
  }

  if (overlayLayout) {
    if (!inspectorOpen || !selectedProduct) return null
    const liveHeight = dragging
      ? `clamp(48dvh, calc(${snapHeight}dvh - ${dragY}px), 84dvh)`
      : `${snapHeight}dvh`
    return (
      <div
        className={`inspector-sheet${isTablet ? " inspector-sheet--tablet" : ""}${
          isMobile && expanded ? " inspector-sheet--expanded" : ""
        }`}
        role={isTablet ? "dialog" : "region"}
        aria-modal={isTablet ? true : undefined}
        aria-labelledby="inspector-sheet-title"
      >
        <div
          className="inspector-sheet__panel"
          style={
            isMobile
              ? {
                  height: liveHeight,
                  transition: dragging ? "none" : "height 280ms var(--ease)",
                }
              : undefined
          }
        >
          <div
            className="inspector-sheet__grab"
            onPointerDown={onGrabPointerDown}
            onPointerMove={onGrabPointerMove}
            onPointerUp={endGrab}
            onPointerCancel={endGrab}
          >
            <button
              type="button"
              className="inspector-sheet__handle"
              aria-label={expanded ? "Collapse selected panel" : "Expand selected panel"}
              onClick={onHandleClick}
            />
            <div className="inspector-sheet__chrome">
              <p className="inspector__plate" id="inspector-sheet-title">
                SELECTED
              </p>
              <button
                type="button"
                className="ghost"
                data-sheet-close
                onClick={closeSheet}
              >
                CLOSE
              </button>
            </div>
          </div>
          <div className="inspector-sheet__body">
            <div
              className={`inspector inspector--sheet${isTablet ? " inspector--tablet" : ""}`}
              id="inspection"
            >
              <div className="inspector__card">
                <InspectorBody
                  selectedSlot={selectedSlot}
                  selectedProduct={selectedProduct}
                  inMachine={inMachine}
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
      </div>
    )
  }

  if (!selectedProduct) {
    return (
      <aside className="inspector inspector--rail" aria-live="polite" id="inspection">
        <div className="inspector__card">
          <p className="inspector__plate">SELECT</p>
          <p className="inspection__copy">Select a slot.</p>
        </div>
        <div className="inspector__mechanism">
          <DispenseTray />
        </div>
        <div className="inspector__controls">
          <RestockControl />
        </div>
      </aside>
    )
  }

  return (
    <aside className="inspector inspector--rail" aria-live="polite" id="inspection">
      <div className="inspector__card">
        <p className="inspector__plate">SELECTED</p>
        <InspectorBody
          selectedSlot={selectedSlot}
          selectedProduct={selectedProduct}
          inMachine={inMachine}
        />
      </div>
      <div className="inspector__mechanism">
        <DispenseTray />
      </div>
      <div className="inspector__controls">
        <RestockControl />
      </div>
    </aside>
  )
}
