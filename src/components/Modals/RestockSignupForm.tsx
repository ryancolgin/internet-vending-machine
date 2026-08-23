import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { track } from "../../lib/analytics"
import { isPlausibleEmail, subscribeRestockEmail } from "../../lib/kit"

type SignupStatus = "idle" | "submitting" | "success" | "error" | "invalid"

export function RestockSignupForm() {
  const emailId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLParagraphElement>(null)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<SignupStatus>("idle")

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (status === "success") successRef.current?.focus()
  }, [status])

  const errorMessage =
    status === "invalid"
      ? "Enter a valid email."
      : status === "error"
        ? "Could not send. Try again."
        : null

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "submitting") return

    const nextEmail = email.trim()
    if (!isPlausibleEmail(nextEmail)) {
      setStatus("invalid")
      inputRef.current?.focus()
      return
    }

    setStatus("submitting")
    track({ name: "restock_signup_submitted" })

    const result = await subscribeRestockEmail(nextEmail)
    if (result.ok) {
      track({ name: "restock_signup_succeeded" })
      setStatus("success")
      return
    }

    track({ name: "restock_signup_failed" })
    setStatus(result.reason === "invalid" ? "invalid" : "error")
    inputRef.current?.focus()
  }

  if (status === "success") {
    return (
      <div className="signup-success">
        <p className="signup-success__title" ref={successRef} tabIndex={-1}>
          YOU&apos;RE ON THE RESTOCK LIST.
        </p>
        <p>
          Check your email to confirm, then we&apos;ll let you know when there&apos;s
          something worth coming back for.
        </p>
      </div>
    )
  }

  return (
    <form
      className="suggest-form signup-form"
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-busy={status === "submitting"}
    >
      <p>
        New finds, free tools, and fresh stock from around the internet. Sent when the
        machine has something worth coming back for.
      </p>
      <label className="suggest-form__field" htmlFor={emailId}>
        YOUR EMAIL
        <input
          ref={inputRef}
          id={emailId}
          type="email"
          name="email_address"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="email"
          value={email}
          required
          disabled={status === "submitting"}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status === "invalid" || status === "error") setStatus("idle")
          }}
        />
      </label>
      {errorMessage ? (
        <p className="notice" id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button type="submit" className="vend" disabled={status === "submitting"}>
        {status === "submitting" ? "POSTING…" : "KEEP ME POSTED →"}
      </button>
      <p className="signup-form__support">Unsubscribe anytime.</p>
    </form>
  )
}
