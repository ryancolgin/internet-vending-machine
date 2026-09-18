import { showRestockControls } from "../../lib/editionPreview"
import { useMachine } from "../../state/MachineContext"

export function RestockControl() {
  const { restock, haul, setHaulOpen, notice } = useMachine()
  const restockNotice = notice?.kind === "restock" ? notice : null
  const showRestock = showRestockControls()

  return (
    <div className="restock-control">
      <div className={`restock-row${showRestock ? "" : " restock-row--haul-only"}`}>
        {showRestock ? (
          <button type="button" className="restock" onClick={restock}>
            RESTOCK MACHINE
          </button>
        ) : null}
        <button type="button" className="haul-tab" onClick={() => setHaulOpen(true)}>
          YOUR HAUL · {haul.length}
        </button>
      </div>
      <p className="notice restock-notice" aria-live="polite">
        {restockNotice ? restockNotice.message : ""}
      </p>
    </div>
  )
}
