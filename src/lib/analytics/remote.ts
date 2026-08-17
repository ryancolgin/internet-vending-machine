import type { AnalyticsEvent } from "../../types/analytics"
import { supabaseConfig } from "../env"

type RemoteRow = {
  session_id: string
  event_name: string
  timestamp: string
  product_id: string | null
  slot_code: string | null
  restock_id: string | null
}

function toRow(event: AnalyticsEvent): RemoteRow {
  return {
    session_id: event.sessionId,
    event_name: event.name,
    timestamp: event.timestamp,
    product_id: event.productId ?? null,
    slot_code: event.slotCode ?? null,
    restock_id: event.restockId ?? null,
  }
}

function fromRow(row: RemoteRow): AnalyticsEvent {
  return {
    sessionId: row.session_id,
    name: row.event_name as AnalyticsEvent["name"],
    timestamp: row.timestamp,
    productId: row.product_id ?? undefined,
    slotCode: row.slot_code ?? undefined,
    restockId: row.restock_id ?? undefined,
  }
}

async function rest<T>(
  path: string,
  init: RequestInit,
): Promise<T | null> {
  const config = supabaseConfig()
  if (!config) return null

  try {
    const response = await fetch(`${config.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    })
    if (!response.ok) return null
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function sendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  await rest("analytics_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(toRow(event)),
  })
}

export async function fetchRemoteEvents(): Promise<AnalyticsEvent[] | null> {
  const rows = await rest<RemoteRow[]>(
    "analytics_events?select=session_id,event_name,timestamp,product_id,slot_code,restock_id&order=timestamp.asc",
    { method: "GET" },
  )
  if (!rows) return null
  return rows.map(fromRow)
}
