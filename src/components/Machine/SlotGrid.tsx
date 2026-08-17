import type { KeyboardEvent } from "react"
import { getProduct } from "../../data/products"
import { neighborSlot } from "../../lib/slots"
import { useMachine } from "../../state/MachineContext"
import { SLOT_CODES } from "../../types/product"
import { ProductSlot } from "./ProductSlot"

export function SlotGrid() {
  const { slots, selectedSlot, selectSlot } = useMachine()

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!selectedSlot) return
    const columns = window.matchMedia("(max-width: 839px)").matches ? 2 : 4
    const next = neighborSlot(selectedSlot, event.key, columns)
    if (!next) return
    event.preventDefault()
    selectSlot(next)
    const target = event.currentTarget.querySelector<HTMLButtonElement>(`[data-slot="${next}"]`)
    target?.focus()
  }

  return (
    <section className="slot-window" aria-label="Product windows" id="slots">
      <div className="slot-grid" onKeyDown={onKeyDown}>
        {SLOT_CODES.map((code) => {
          const product = getProduct(slots[code])
          if (!product) return null
          return (
            <ProductSlot
              key={code}
              code={code}
              product={product}
              selected={selectedSlot === code}
              onSelect={() => selectSlot(code)}
            />
          )
        })}
      </div>
    </section>
  )
}
