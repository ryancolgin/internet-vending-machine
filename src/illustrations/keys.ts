export const ILLUSTRATION_KEYS = [
  "driver",
  "book",
  "ruler",
  "notebook",
  "sewing-kit",
  "flashlight",
  "kit",
  "clip",
  "scissors",
  "eraser",
  "pencil",
  "pouch",
  "carabiner",
  "shard",
  "pen",
  "charger",
  "hook",
  "cloth",
  "tape",
  "tray",
  "cutter",
  "window",
  "spark",
  "timer",
  "bottle",
  "drain",
  "patch",
  "cable",
  "brush",
  "towel",
  "globe",
  "transfer",
  "document",
  "browser",
  "menu-bar",
  "calendar",
  "type",
  "kiosk",
] as const

export type IllustrationKey = (typeof ILLUSTRATION_KEYS)[number]

const ALIASES: Record<string, IllustrationKey> = {
  sewing: "sewing-kit",
  light: "flashlight",
  flashlight: "flashlight",
  "sewing-kit": "sewing-kit",
}

export function resolveIllustrationKey(key: string): IllustrationKey {
  if (ALIASES[key]) return ALIASES[key]
  if ((ILLUSTRATION_KEYS as readonly string[]).includes(key)) {
    return key as IllustrationKey
  }
  return "kit"
}
