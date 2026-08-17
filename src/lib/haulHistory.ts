import type { HaulSnapshot } from "../types/machine"
import { createId } from "./ids"
import { readJson, writeJson } from "./storage"

const HISTORY_KEY = "haulHistory"
const MAX_SNAPSHOTS = 40

function haulSignature(productIds: string[]): string {
  return [...productIds].sort().join("\0")
}

export function readHaulHistory(): HaulSnapshot[] {
  const items = readJson<HaulSnapshot[]>(HISTORY_KEY, [])
  return Array.isArray(items) ? items : []
}

export function recordHaulShareSnapshot(
  productIds: string[],
  restockId?: string,
): HaulSnapshot | null {
  if (productIds.length === 0) return null

  const history = readHaulHistory()
  const signature = haulSignature(productIds)
  const latest = history[0]
  if (latest && haulSignature(latest.productIds) === signature) {
    return null
  }

  const snapshot: HaulSnapshot = {
    id: createId("haul"),
    createdAt: new Date().toISOString(),
    productIds: [...productIds],
    restockId,
  }

  writeJson(HISTORY_KEY, [snapshot, ...history].slice(0, MAX_SNAPSHOTS))
  return snapshot
}
