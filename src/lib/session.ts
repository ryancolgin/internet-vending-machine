const SESSION_KEY = "ivm.v0.session"

export function getSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `ses_${crypto.randomUUID()}`
      : `ses_${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(SESSION_KEY, created)
  return created
}
