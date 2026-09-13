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
        <h2 id="intro-title">EDITION 001 IS COMING</h2>
        <p>
          The Internet Vending Machine officially launches Friday, September 18.
        </p>
        <p>
          Until then, browse the current stock and hit <b>VEND</b> on anything
          you&apos;d genuinely want.
        </p>
        <p>Build a Haul and help shape what makes the first edition.</p>
        <p>
          <button
            type="button"
            className="intro__inline"
            onClick={() => {
              dismissIntro()
              setModal("follow")
            }}
          >
            FOLLOW RESTOCKS
          </button>{" "}
          so you know when Edition 001 goes live.
        </p>
        <p>
          Hit <b>RESTOCK MACHINE</b> for another batch.
        </p>
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
          you think belongs in The Internet Vending Machine.
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
