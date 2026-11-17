import { useMachine } from "../../state/MachineContext"
import { isEditionLive } from "../../types/machine"

function PrelaunchIntro({
  dismissIntro,
  setModal,
}: {
  dismissIntro: () => void
  setModal: ReturnType<typeof useMachine>["setModal"]
}) {
  return (
    <>
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
    </>
  )
}

function Edition002Intro({
  dismissIntro,
  setModal,
}: {
  dismissIntro: () => void
  setModal: ReturnType<typeof useMachine>["setModal"]
}) {
  return (
    <>
      <h2 id="intro-title">EDITION 002 IS STOCKED</h2>
      <p>
        The machine is stocked with 16 good little things. Field Notes, Pocket
        Ref, Excalidraw, and Emotion Explorers are still in the window.
      </p>
      <p>
        Hit <b>VEND</b> on anything you&apos;d take with you.
      </p>
      <p>
        Build a Haul, share what you found, and{" "}
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
        for the next edition.
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
        you think belongs in a future machine.
      </p>
      <p>
        <b>Nothing will actually be purchased.</b>
      </p>
    </>
  )
}

function LiveIntro({
  dismissIntro,
  setModal,
}: {
  dismissIntro: () => void
  setModal: ReturnType<typeof useMachine>["setModal"]
}) {
  return (
    <>
      <h2 id="intro-title">EDITION 001 IS STOCKED</h2>
      <p>
        The first Internet Vending Machine is stocked with 16 good little things
        from around the internet.
      </p>
      <p>
        Hit <b>VEND</b> on anything you&apos;d take with you.
      </p>
      <p>
        Build a Haul, share what you found, and{" "}
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
        for the next edition.
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
        you think belongs in a future machine.
      </p>
      <p>
        <b>Nothing will actually be purchased.</b>
      </p>
    </>
  )
}

export function FirstVisit() {
  const { introDismissed, introOpen, dismissIntro, setModal, faceEdition } = useMachine()
  if (introDismissed && !introOpen) return null
  const showEdition002 = faceEdition?.id === "002"

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
        {showEdition002 ? (
          <Edition002Intro dismissIntro={dismissIntro} setModal={setModal} />
        ) : isEditionLive() ? (
          <LiveIntro dismissIntro={dismissIntro} setModal={setModal} />
        ) : (
          <PrelaunchIntro dismissIntro={dismissIntro} setModal={setModal} />
        )}
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
