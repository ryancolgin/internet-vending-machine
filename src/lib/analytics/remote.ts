import type { AnalyticsEvent } from "../../types/analytics"
import { supabaseConfig } from "../env"

type RemoteRow = {
  session_id: string
  event_name: string
  timestamp: string
  product_id: string | null
  slot_code: string | null
  restock_id: string | null
  client_id?: string | null
  referrer?: string | null
  page_path?: string | null
}

function toRow(event: AnalyticsEvent): RemoteRow {
  const row: RemoteRow = {
    session_id: event.sessionId,
    event_name: event.name,
    timestamp: event.timestamp,
    product_id: event.productId ?? null,
    slot_code: event.slotCode ?? null,
    restock_id: event.restockId ?? null,
    client_id: event.clientId ?? null,
  }
  if (event.referrer) row.referrer = event.referrer
  if (event.pagePath) row.page_path = event.pagePath
  return row
}

function fromRow(row: RemoteRow): AnalyticsEvent {
  return {
    sessionId: row.session_id,
    name: row.event_name as AnalyticsEvent["name"],
    timestamp: row.timestamp,
    productId: row.product_id ?? undefined,
    slotCode: row.slot_code ?? undefined,
    restockId: row.restock_id ?? undefined,
    clientId: row.client_id ?? undefined,
    referrer: row.referrer ?? undefined,
    pagePath: row.page_path ?? undefined,
  }
}

function coreRow(row: RemoteRow): Omit<RemoteRow, "referrer" | "page_path"> {
  return {
    session_id: row.session_id,
    event_name: row.event_name,
    timestamp: row.timestamp,
    product_id: row.product_id,
    slot_code: row.slot_code,
    restock_id: row.restock_id,
    client_id: row.client_id,
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

async function postEvent(row: object): Promise<boolean> {
  const config = supabaseConfig()
  if (!config) return false

  try {
    const response = await fetch(`${config.url}/rest/v1/analytics_events`, {
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

export async function sendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const row = toRow(event)
  if (await postEvent(row)) return
  await postEvent(coreRow(row))
}

export async function fetchRemoteEvents(): Promise<AnalyticsEvent[] | null> {
  const withContext = await rest<RemoteRow[]>(
    "analytics_events?select=session_id,event_name,timestamp,product_id,slot_code,restock_id,client_id,referrer,page_path&order=timestamp.asc",
    { method: "GET" },
  )
  if (withContext) return withContext.map(fromRow)

  const withClient = await rest<RemoteRow[]>(
    "analytics_events?select=session_id,event_name,timestamp,product_id,slot_code,restock_id,client_id&order=timestamp.asc",
    { method: "GET" },
  )
  if (withClient) return withClient.map(fromRow)

  const rows = await rest<RemoteRow[]>(
    "analytics_events?select=session_id,event_name,timestamp,product_id,slot_code,restock_id&order=timestamp.asc",
    { method: "GET" },
  )
  if (!rows) return null
  return rows.map(fromRow)
}
