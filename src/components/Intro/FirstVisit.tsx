import { useMachine } from "../../state/MachineContext"

export function FirstVisit() {
  const { introDismissed, introOpen, dismissIntro } = useMachine()
  if (introDismissed && !introOpen) return null

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
        <p>We&apos;re stocking the machine. Help decide what deserves a slot.</p>
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
        <p className="intro__credit">
          Built by Ryan Colgin ·{" "}
          <a
            href="https://x.com/ryancolgin"
            target="_blank"
            rel="noopener noreferrer"
          >
            @ryancolgin
          </a>
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
