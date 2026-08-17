import type { AnalyticsEvent, AnalyticsEventName } from "../types/analytics"
import { isRemoteAnalyticsConfigured } from "./env"
import { sendAnalyticsEvent } from "./analytics/remote"
import { getSessionId } from "./session"
import { readJson, writeJson } from "./storage"

export type TrackInput = {
  name: AnalyticsEventName
  restockId?: string
  productId?: string
  slotCode?: string
}

type AnalyticsSink = (event: AnalyticsEvent) => void

const sinks: AnalyticsSink[] = []

if (import.meta.env.DEV) {
  sinks.push((event) => {
    console.info("[ivm]", event.name, event)
  })
}

sinks.push((event) => {
  if (!isRemoteAnalyticsConfigured()) return
  void sendAnalyticsEvent(event)
})

export function addAnalyticsSink(sink: AnalyticsSink): void {
  sinks.push(sink)
}

export function track(input: TrackInput): AnalyticsEvent {
  const event: AnalyticsEvent = {
    name: input.name,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    restockId: input.restockId,
    productId: input.productId,
    slotCode: input.slotCode,
  }

  const events = readJson<AnalyticsEvent[]>("events", [])
  events.push(event)
  writeJson("events", events.slice(-500))

  for (const sink of sinks) {
    try {
      sink(event)
    } catch {
      // Sinks must never break the machine.
    }
  }
  return event
}

export function getStoredEvents(): AnalyticsEvent[] {
  return readJson<AnalyticsEvent[]>("events", [])
}
