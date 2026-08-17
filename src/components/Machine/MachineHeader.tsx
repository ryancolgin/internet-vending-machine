import { MACHINE_NUMBER, MACHINE_TAGLINE, NEXT_RESTOCK_LABEL } from "../../types/machine"
import { useMachine } from "../../state/MachineContext"

export function MachineHeader() {
  const { stockedCount, newCount, openIntro } = useMachine()

  return (
    <header className="machine-header">
      <div className="machine-header__top">
        <div className="machine-header__brand">
          <h1 className="machine-header__title">INTERNET VENDING MACHINE</h1>
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
        <span>RESTOCK · {NEXT_RESTOCK_LABEL}</span>
      </p>
    </header>
  )
}
