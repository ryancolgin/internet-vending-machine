import { getLiveProducts, getProduct } from "../data/products"
import type { RestockLogEntry } from "../types/machine"
import type { SlotCode } from "../types/product"
import { createId, shuffle, unique } from "./ids"
import { assignToSlots, slotProductIds } from "./slots"

function isHouseStock(productId: string): boolean {
  const product = getProduct(productId)
  if (!product) return false
  return (
    product.status === "house-stock" ||
    Boolean(product.badges?.includes("house-stock"))
  )
}

function sameAssortment(a: string[], b: string[]): boolean {
  const left = [...a].sort().join("|")
  const right = [...b].sort().join("|")
  return left === right
}

export function restockMachine(
  currentSlots: Record<SlotCode, string>,
  seenIds: string[],
): { slots: Record<SlotCode, string>; log: RestockLogEntry } {
  const current = slotProductIds(currentSlots)
  const live = getLiveProducts()
  const liveIds = live.map((product) => product.id)
  const seen = new Set(seenIds)

  const retainTarget = 7
  const houseInCurrent = current.filter(isHouseStock)
  const othersInCurrent = shuffle(current.filter((id) => !isHouseStock(id)))
  const retained = unique([...houseInCurrent, ...othersInCurrent]).slice(
    0,
    retainTarget,
  )

  const pool = liveIds.filter((id) => !retained.includes(id))
  const unseen = shuffle(pool.filter((id) => !seen.has(id)))
  const rest = shuffle(pool.filter((id) => seen.has(id)))
  const needed = 16 - retained.length
  let incoming = unique([...unseen, ...rest]).slice(0, needed)

  if (incoming.length < needed) {
    incoming = unique([...incoming, ...shuffle(liveIds)]).slice(0, needed)
  }

  let nextIds = shuffle([...retained, ...incoming]).slice(0, 16)

  if (sameAssortment(nextIds, current) && liveIds.length > 16) {
    const replacement = liveIds.find((id) => !current.includes(id))
    const droppable = nextIds.find((id) => !isHouseStock(id))
    if (replacement && droppable) {
      nextIds = nextIds.map((id) => (id === droppable ? replacement : id))
      nextIds = shuffle(nextIds)
    }
  }

  const slots = assignToSlots(nextIds)
  return {
    slots,
    log: {
      id: createId("rst"),
      at: new Date().toISOString(),
      productIds: nextIds,
      retainedIds: retained,
    },
  }
}
