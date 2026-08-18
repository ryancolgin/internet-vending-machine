import { useMachine } from "../../state/MachineContext"

export function FirstVisit() {
  const { introDismissed, introOpen, dismissIntro, setModal } = useMachine()
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
        <p>The machine is still being stocked. Help decide what deserves a slot.</p>
        <p>
          Browse the stock and hit <b>VEND</b> on anything you&apos;d genuinely want.
        </p>
        <p>
          Use <b>ALREADY OWN</b> if something already has your vote.
        </p>
        <p>
          Hit <b>RESTOCK MACHINE</b> for another batch.
        </p>
        <p>Build a haul and share it if you find a few things worth taking.</p>
        <p>
          <button
            type="button"
            className="intro__inline"
            onClick={() => {
              dismissIntro()
              setModal("suggest")
            }}
          >
            SUGGEST SOMETHING
          </button>{" "}
          you think belongs in the Internet Vending Machine.
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
