import { MACHINE_NAME, MACHINE_NUMBER, MACHINE_STATUS_TAIL, MACHINE_TAGLINE } from "../../types/machine"
import { useMachine } from "../../state/MachineContext"

export function MachineHeader() {
  const { stockedCount, newCount, openIntro } = useMachine()

  return (
    <header className="machine-header">
      <div className="machine-header__top">
        <div className="machine-header__brand">
          <h1 className="machine-header__title">{MACHINE_NAME}</h1>
          <p className="machine-header__tagline">{MACHINE_TAGLINE}</p>
        </div>
        <div className="machine-header__meta">
          <p className="machine-header__number">№ {MACHINE_NUMBER}</p>
          <button
            type="button"
            className="machine-header__help"
            onClick={openIntro}
            aria-label="What is this?"
          >
            WHAT&apos;S THIS?
          </button>
        </div>
      </div>
      <div className="machine-header__rule" />
      <p className="machine-header__status">
        <span>
          <b>{stockedCount}</b> STOCKED
        </span>
        <span>
          <b>{newCount}</b> NEW
        </span>
        <span>{MACHINE_STATUS_TAIL}</span>
      </p>
    </header>
  )
}
