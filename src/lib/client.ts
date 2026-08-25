const CLIENT_KEY = "ivm.v0.client"

export function getClientId(): string {
  const existing = window.localStorage.getItem(CLIENT_KEY)
  if (existing) return existing
  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `cli_${crypto.randomUUID()}`
      : `cli_${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(CLIENT_KEY, created)
  return created
}

export function installClientIdHelper(): void {
  const w = window as Window & { __ivmClientId?: () => string }
  w.__ivmClientId = () => {
    const id = getClientId()
    const origin = window.location.origin
    console.info("[ivm] origin", origin)
    console.info("[ivm] client_id", id)
    console.info(
      `[ivm] Each origin has its own localStorage (localhost, the custom domain, and *.vercel.app are different).\nRun __ivmClientId() on each browser/domain you test from, then map the exact client_id in Supabase:\n\ninsert into public.analytics_clients (client_id, label, actor_type, notes)\nvalues ('${id}', 'Ryan', 'owner', '${origin}');\n`,
    )
    return id
  }
}
