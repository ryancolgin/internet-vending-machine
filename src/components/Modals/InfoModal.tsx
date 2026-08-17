import { useMachine } from "../../state/MachineContext"
import { NEXT_RESTOCK_LABEL } from "../../types/machine"

export function InfoModal() {
  const { modal, setModal, restockLog, restockCount } = useMachine()
  if (!modal) return null

  const title = {
    suggest: "SUGGEST SOMETHING",
    stock: "STOCK YOUR PRODUCT",
    follow: "FOLLOW RESTOCKS",
    log: "RESTOCK LOG",
  }[modal]

  return (
    <div
      className="modal"
      role="dialog"
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) setModal(null)
      }}
    >
      <div className="panel">
        <h2 id="modal-title">{title}</h2>
        <div className="modal__body">
          {modal === "suggest" ? (
            <p>Not open yet. Soon you&apos;ll be able to suggest products for the machine.</p>
          ) : null}
          {modal === "stock" ? (
            <p>Maker and merchant stocking is not live in this test.</p>
          ) : null}
          {modal === "follow" ? (
            <p>Restock notices aren&apos;t wired yet. Next restock: {NEXT_RESTOCK_LABEL}.</p>
          ) : null}
          {modal === "log" ? (
            restockLog.length === 0 ? (
              <p>No restocks yet. This is still the opening assortment. Restocks: {restockCount}.</p>
            ) : (
              <ul className="log">
                {restockLog.map((entry, index) => (
                  <li key={entry.id}>
                    #{restockCount - index} · {new Date(entry.at).toLocaleString()} · kept{" "}
                    {entry.retainedIds.length} · {entry.id}
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
        <div className="panel__actions" style={{ marginTop: 16 }}>
          <button type="button" className="ghost" onClick={() => setModal(null)}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
