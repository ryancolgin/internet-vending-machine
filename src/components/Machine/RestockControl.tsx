import { useMachine } from "../../state/MachineContext"

export function RestockControl() {
  const { restock, haul, setHaulOpen, notice } = useMachine()
  const restockNotice = notice?.kind === "restock" ? notice : null

  return (
    <div className="restock-control">
      <div className="restock-row">
        <button type="button" className="restock" onClick={restock}>
          RESTOCK MACHINE
        </button>
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
