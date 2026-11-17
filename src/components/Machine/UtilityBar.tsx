import { editionServicePlate } from "../../data/editions"
import { showRestockLog } from "../../lib/editionPreview"
import { useMachine } from "../../state/MachineContext"
import { machineServicePlate, type ModalId } from "../../types/machine"

const actions: Array<{ id: ModalId; label: string }> = [
  { id: "suggest", label: "SUGGEST SOMETHING" },
  { id: "stock", label: "STOCK YOUR PRODUCT" },
  { id: "follow", label: "FOLLOW RESTOCKS" },
  { id: "log", label: "RESTOCK LOG" },
]

export function UtilityBar() {
  const { setModal, faceEdition } = useMachine()
  const visibleActions = showRestockLog()
    ? actions
    : actions.filter((action) => action.id !== "log")

  return (
    <div className="utility">
      <div className="utility__actions">
        {visibleActions.map((action) => (
          <button
            key={action.id}
            id={action.id === "follow" ? "utility-follow" : undefined}
            type="button"
            onClick={() => setModal(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <p className="service-plate">
        {faceEdition ? editionServicePlate(faceEdition) : machineServicePlate()}
      </p>
    </div>
  )
}
