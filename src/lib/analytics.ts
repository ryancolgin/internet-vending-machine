import type { AnalyticsEvent, AnalyticsEventName } from "../types/analytics"
import { isRemoteAnalyticsConfigured } from "./env"
import { sendAnalyticsEvent } from "./analytics/remote"
import { getClientId } from "./client"
import { getSessionId } from "./session"
import { readJson, writeJson } from "./storage"

export type TrackInput = {
  name: AnalyticsEventName
  restockId?: string
  productId?: string
  slotCode?: string
  referrer?: string
  pagePath?: string
}

type AnalyticsSink = (event: AnalyticsEvent) => void

const sinks: AnalyticsSink[] = []
const HUMAN_SESSION_KEY = "human_session"
const INTERACTION_EVENTS = [
  "pointerdown",
  "click",
  "touchstart",
  "keydown",
  "scroll",
  "wheel",
] as const
const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta"])

let visitOpened = false
let humanTrackingInstalled = false
let humanRecordedForSession: string | null = null

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
    clientId: getClientId(),
    restockId: input.restockId,
    productId: input.productId,
    slotCode: input.slotCode,
    referrer: input.referrer,
    pagePath: input.pagePath,
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

/** One machine-open event per page load, plus first trusted human interaction per session. */
export function startVisitTracking(): void {
  trackMachineOpenedOnce()
  installHumanInteractionTracking()
}

function trackMachineOpenedOnce(): void {
  if (visitOpened) return
  visitOpened = true

  const saved = readJson<{ restockId?: string } | null>("machine", null)
  track({
    name: "machine_opened",
    restockId: saved?.restockId,
    referrer: readReferrer(),
    pagePath: readPagePath(),
  })
}

function installHumanInteractionTracking(): void {
  if (humanTrackingInstalled) return
  humanTrackingInstalled = true

  const onInteraction = (event: Event) => {
    if (!event.isTrusted) return
    if (event.type === "keydown") {
      const keyEvent = event as KeyboardEvent
      if (keyEvent.repeat || MODIFIER_KEYS.has(keyEvent.key)) return
    }
    if (event.type === "scroll" || event.type === "wheel") {
      if (!isMeaningfulScroll(event)) return
    }
    recordHumanInteraction()
  }

  for (const name of INTERACTION_EVENTS) {
    window.addEventListener(name, onInteraction, { capture: true, passive: true })
  }
}

function recordHumanInteraction(): void {
  const sessionId = getSessionId()
  if (humanRecordedForSession === sessionId) return
  const recordedFor = readJson<string | null>(HUMAN_SESSION_KEY, null)
  if (recordedFor === sessionId) {
    humanRecordedForSession = sessionId
    return
  }
  humanRecordedForSession = sessionId
  writeJson(HUMAN_SESSION_KEY, sessionId)
  track({ name: "human_interaction" })
}

function isMeaningfulScroll(event: Event): boolean {
  if (event.type === "wheel") {
    const wheel = event as WheelEvent
    return Math.abs(wheel.deltaY) + Math.abs(wheel.deltaX) >= 40
  }
  return true
}

function readReferrer(): string | undefined {
  try {
    const value = document.referrer.trim()
    return value ? value.slice(0, 500) : undefined
  } catch {
    return undefined
  }
}

function readPagePath(): string | undefined {
  try {
    const value = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`
    return value.slice(0, 300)
  } catch {
    return undefined
  }
}
