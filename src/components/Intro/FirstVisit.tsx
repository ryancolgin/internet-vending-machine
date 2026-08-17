import { useMachine } from "../../state/MachineContext"

export function FirstVisit() {
  const { introDismissed, dismissIntro } = useMachine()
  if (introDismissed) return null

  return (
    <div
      className="intro"
      role="dialog"
      aria-labelledby="intro-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismissIntro()
      }}
    >
      <div className="panel">
        <h2 id="intro-title">TEST THE MACHINE</h2>
        <p>We&apos;re figuring out what belongs in here.</p>
        <p>
          Browse the stock and hit <b>VEND</b> on anything you&apos;d genuinely consider buying.
        </p>
        <p>
          Use <b>ALREADY OWN</b> if you already have something you think belongs here.
        </p>
        <p>
          Hit <b>RESTOCK MACHINE</b> when you want another batch.
        </p>
        <p>
          <b>Nothing will actually be purchased.</b>
        </p>
        <div className="panel__actions" style={{ marginTop: 16 }}>
          <button type="button" className="vend" onClick={dismissIntro}>
            OPEN THE MACHINE
          </button>
        </div>
      </div>
    </div>
  )
}
