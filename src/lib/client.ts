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
    console.info("[ivm] client_id", id)
    console.info(
      `[ivm] map this browser as owner in Supabase:\n\ninsert into public.analytics_clients (client_id, label, actor_type, notes)\nvalues ('${id}', 'Ryan Mac', 'owner', 'Ryan local Mac');\n`,
    )
    return id
  }
}
