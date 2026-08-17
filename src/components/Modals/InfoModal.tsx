import { useState, type FormEvent } from "react"
import { getSessionId } from "../../lib/session"
import { normalizeSuggestionUrl, sendProductSuggestion } from "../../lib/suggestions"
import { useMachine } from "../../state/MachineContext"
import { NEXT_RESTOCK_LABEL } from "../../types/machine"

function SuggestForm() {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "received" | "failed">("idle")

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedUrl = url.trim()
    setError(null)

    if (!trimmedName && !trimmedUrl) {
      setError("Add a product name or a URL.")
      return
    }

    let normalizedUrl: string | null = null
    if (trimmedUrl) {
      normalizedUrl = normalizeSuggestionUrl(trimmedUrl)
      if (!normalizedUrl) {
        setError("Enter a valid URL, like leatherman.com")
        return
      }
    }

    setStatus("sending")
    const sent = await sendProductSuggestion({
      sessionId: getSessionId(),
      name: trimmedName || undefined,
      url: normalizedUrl || undefined,
      note: note.trim() || undefined,
    })
    setStatus(sent ? "received" : "failed")
  }

  if (status === "received") {
    return <p className="notice">SUGGESTION RECEIVED</p>
  }

  return (
    <form className="suggest-form" onSubmit={(event) => void onSubmit(event)}>
      <p>Found something that belongs in the machine?</p>
      <label className="suggest-form__field">
        Product Name
        <input
          type="text"
          name="product-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          placeholder="What is it?"
          autoComplete="off"
        />
      </label>
      <label className="suggest-form__field">
        Product URL
        <input
          type="text"
          name="product-url"
          inputMode="url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
            setError(null)
          }}
          placeholder="Where can we find it?"
          autoComplete="off"
        />
      </label>
      <label className="suggest-form__field">
        Why should we stock it?
        <textarea
          name="note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What makes it worth a slot?"
          autoComplete="off"
        />
      </label>
      {error ? <p className="notice">{error}</p> : null}
      {status === "failed" ? (
        <p className="notice">COULD NOT SEND · TRY AGAIN</p>
      ) : null}
      <button type="submit" className="vend" disabled={status === "sending"}>
        SUBMIT →
      </button>
    </form>
  )
}

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
          {modal === "suggest" ? <SuggestForm /> : null}
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
