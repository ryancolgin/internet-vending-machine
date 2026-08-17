import { supabaseConfig } from "./env"

const HAS_PROTOCOL = /^[a-zA-Z][a-zA-Z+.-]*:/

export function normalizeSuggestionUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const candidate = HAS_PROTOCOL.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    const host = parsed.hostname
    if (!host) return null
    if (host !== "localhost" && !host.includes(".")) return null
    return candidate
  } catch {
    return null
  }
}

function isOwner(): boolean {
  try {
    return window.localStorage.getItem("ivm.v0.owner") === "true"
  } catch {
    return false
  }
}

export async function sendProductSuggestion(input: {
  sessionId: string
  name?: string
  url?: string
  note?: string
}): Promise<boolean> {
  const config = supabaseConfig()
  if (!config) return false

  const row: Record<string, string> = {
    session_id: input.sessionId,
    submitter_type: isOwner() ? "owner" : "tester",
  }
  if (input.name) row.name = input.name
  if (input.url) row.url = input.url
  if (input.note) row.note = input.note

  try {
    const response = await fetch(`${config.url}/rest/v1/product_suggestions`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    })
    return response.ok
  } catch {
    return false
  }
}
