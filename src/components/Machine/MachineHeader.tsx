import { editionStamp } from "../../data/editions"
import { useMachine } from "../../state/MachineContext"
import type { Edition } from "../../types/edition"
import {
  MACHINE_NAME,
  MACHINE_NUMBER,
  MACHINE_TAGLINE,
  machineStatusTail,
} from "../../types/machine"

function EditionDial({
  edition,
  phase,
  previousEdition,
  nextEdition,
  showEdition,
}: {
  edition: Edition
  phase: string
  previousEdition: Edition | null
  nextEdition: Edition | null
  showEdition: (id: string) => void
}) {
  return (
    <div className="edition-dial" role="group" aria-label="Choose an edition">
      <button
        type="button"
        className="edition-dial__step"
        aria-label={
          previousEdition ? `Edition ${previousEdition.id}` : "No earlier edition"
        }
        disabled={!previousEdition}
        onClick={() => previousEdition && showEdition(previousEdition.id)}
      >
        ‹
      </button>
      <div className="edition-dial__face" aria-live="polite">
        <span className="edition-dial__number" key={edition.id}>
          {edition.id}
        </span>
        <span className="edition-dial__meta">
          <span className={`edition-dial__phase edition-dial__phase--${phase.toLowerCase()}`}>
            {phase}
          </span>
          <span className="edition-dial__date">{editionStamp(edition)}</span>
        </span>
      </div>
      <button
        type="button"
        className="edition-dial__step"
        aria-label={nextEdition ? `Edition ${nextEdition.id}` : "No later edition"}
        disabled={!nextEdition}
        onClick={() => nextEdition && showEdition(nextEdition.id)}
      >
        ›
      </button>
    </div>
  )
}

export function MachineHeader() {
  const {
    stockedCount,
    newCount,
    openIntro,
    faceEdition,
    editionPhase,
    previousEdition,
    nextEdition,
    showEdition,
  } = useMachine()

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
      <div className="machine-header__status">
        {faceEdition && editionPhase ? (
          <EditionDial
            edition={faceEdition}
            phase={editionPhase}
            previousEdition={previousEdition}
            nextEdition={nextEdition}
            showEdition={showEdition}
          />
        ) : (
          <span>{machineStatusTail()}</span>
        )}
        <div className="machine-header__counts">
          <span>
            <b>{stockedCount}</b> STOCKED
          </span>
          <span>
            <b>{newCount}</b> NEW
          </span>
        </div>
      </div>
    </header>
  )
}
