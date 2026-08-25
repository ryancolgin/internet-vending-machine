const SESSION_KEY = "ivm.v0.session"
const SESSION_ACTIVE_KEY = "ivm.v0.session.active"

/** A new session starts when activity resumes after this much idle time. */
export const SESSION_INACTIVITY_MS = 30 * 60 * 1000

function createSessionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `ses_${crypto.randomUUID()}`
    : `ses_${Math.random().toString(36).slice(2)}`
}

function readLastActive(): number | null {
  try {
    const raw = window.localStorage.getItem(SESSION_ACTIVE_KEY)
    if (!raw) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeLastActive(at: number): void {
  try {
    window.localStorage.setItem(SESSION_ACTIVE_KEY, String(at))
  } catch {
    // Private mode / quota — ignore.
  }
}

function writeSessionId(id: string): void {
  try {
    window.localStorage.setItem(SESSION_KEY, id)
  } catch {
    // Private mode / quota — ignore.
  }
}

function readSessionId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

/**
 * One usage period for analytics.
 *
 * - `client_id` stays forever and identifies the browser.
 * - `session_id` is reused while events keep arriving.
 * - After ~30 minutes with no tracked activity, the next activity
 *   (page load, click, etc.) mints a new session_id.
 * - Idle tabs do not rotate on a timer. A tab that sits unused keeps
 *   its current session_id until something actually happens again.
 *
 * Calling this both resolves the current session and marks activity.
 */
export function getSessionId(): string {
  const now = Date.now()
  const existing = readSessionId()
  const lastActive = readLastActive()

  if (
    existing &&
    lastActive !== null &&
    now - lastActive > SESSION_INACTIVITY_MS
  ) {
    const created = createSessionId()
    writeSessionId(created)
    writeLastActive(now)
    return created
  }

  if (existing) {
    writeLastActive(now)
    return existing
  }

  const created = createSessionId()
  writeSessionId(created)
  writeLastActive(now)
  return created
}
