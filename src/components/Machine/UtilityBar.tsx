import { useMachine } from "../../state/MachineContext"
import type { ModalId } from "../../types/machine"

const actions: Array<{ id: ModalId; label: string }> = [
  { id: "suggest", label: "SUGGEST SOMETHING" },
  { id: "stock", label: "STOCK YOUR PRODUCT" },
  { id: "follow", label: "FOLLOW RESTOCKS" },
  { id: "log", label: "RESTOCK LOG" },
]

export function UtilityBar() {
  const { setModal } = useMachine()

  return (
    <div className="utility">
      <div className="utility__actions">
        {actions.map((action) => (
          <button key={action.id} type="button" onClick={() => setModal(action.id)}>
            {action.label}
          </button>
        ))}
      </div>
      <p className="service-plate">IVM-001 · TEST UNIT · NO PURCHASE</p>
    </div>
  )
}
