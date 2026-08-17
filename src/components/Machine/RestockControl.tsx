import { useMachine } from "../../state/MachineContext"

export function RestockControl() {
  const { restock, haul, setHaulOpen } = useMachine()

  return (
    <div className="restock-row">
      <button type="button" className="restock" onClick={restock}>
        RESTOCK MACHINE
      </button>
      <button type="button" className="haul-tab" onClick={() => setHaulOpen(true)}>
        YOUR HAUL · {haul.length}
      </button>
    </div>
  )
}
