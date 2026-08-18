import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react"
import { INITIAL_SLOT_PRODUCT_IDS, getProduct } from "../data/products"
import { track } from "../lib/analytics"
import { createId, unique } from "../lib/ids"
import { restockMachine } from "../lib/restock"
import { getSessionId } from "../lib/session"
import {
  haulShareUrl,
  productShareUrl,
  sharePayload,
} from "../lib/share"
import { assignToSlots, slotForProduct, slotProductIds } from "../lib/slots"
import { recordHaulShareSnapshot } from "../lib/haulHistory"
import { readJson, writeJson } from "../lib/storage"
import type { HaulItem, ModalId, Notice, RestockLogEntry } from "../types/machine"
import type { ProductMetrics, SlotCode } from "../types/product"

type Reactions = Record<string, { keep?: boolean; own?: boolean }>

export type MachineState = {
  sessionId: string
  restockId: string
  restockCount: number
  restockLog: RestockLogEntry[]
  slots: Record<SlotCode, string>
  selectedSlot: SlotCode | null
  inspectProductId: string | null
  inspectorOpen: boolean
  haul: HaulItem[]
  seenIds: string[]
  introDismissed: boolean
  introOpen: boolean
  haulOpen: boolean
  shareOpen: boolean
  modal: ModalId | null
  dispensingId: string | null
  notice: Notice | null
  metrics: Record<string, ProductMetrics>
  reactions: Reactions
}

type Action =
  | { type: "HYDRATE"; state: MachineState }
  | { type: "SELECT_SLOT"; slot: SlotCode }
  | { type: "INSPECT_PRODUCT"; productId: string }
  | { type: "VEND" }
  | { type: "KEEP"; productId?: string }
  | { type: "OWN"; productId?: string }
  | { type: "REMOVE_HAUL"; productId: string }
  | { type: "APPLY_RESTOCK"; slots: Record<SlotCode, string>; log: RestockLogEntry }
  | { type: "DISMISS_INTRO" }
  | { type: "OPEN_INTRO" }
  | { type: "SET_HAUL_OPEN"; open: boolean }
  | { type: "SET_SHARE_OPEN"; open: boolean }
  | { type: "SET_MODAL"; modal: ModalId | null }
  | { type: "CLEAR_DISPENSE" }
  | { type: "SET_INSPECTOR_OPEN"; open: boolean }
  | { type: "SET_NOTICE"; notice: Notice | null }
  | { type: "MARK_SHARED"; productId?: string }

const emptyMetrics = (): ProductMetrics => ({
  timesShown: 0,
  timesSelected: 0,
  timesVended: 0,
  keepVotes: 0,
  alreadyOwned: 0,
  shares: 0,
})

function bump(
  metrics: Record<string, ProductMetrics>,
  productId: string,
  key: keyof ProductMetrics,
  delta = 1,
): Record<string, ProductMetrics> {
  const current = metrics[productId] ?? emptyMetrics()
  return {
    ...metrics,
    [productId]: { ...current, [key]: Math.max(0, current[key] + delta) },
  }
}

function bumpShown(
  metrics: Record<string, ProductMetrics>,
  productIds: string[],
): Record<string, ProductMetrics> {
  return productIds.reduce((acc, id) => bump(acc, id, "timesShown"), metrics)
}

function createInitialState(): MachineState {
  const slots = assignToSlots([...INITIAL_SLOT_PRODUCT_IDS])
  const shown = slotProductIds(slots)
  return {
    sessionId: getSessionId(),
    restockId: createId("rst"),
    restockCount: 0,
    restockLog: [],
    slots,
    selectedSlot: "B3",
    inspectProductId: slots.B3,
    inspectorOpen: false,
    haul: [],
    seenIds: shown,
    introDismissed: false,
    introOpen: false,
    haulOpen: false,
    shareOpen: false,
    modal: null,
    dispensingId: null,
    notice: null,
    metrics: bumpShown({}, shown),
    reactions: {},
  }
}

function persistable(state: MachineState) {
  return {
    restockId: state.restockId,
    restockCount: state.restockCount,
    restockLog: state.restockLog,
    slots: state.slots,
    selectedSlot: state.selectedSlot,
    haul: state.haul,
    seenIds: state.seenIds,
    introDismissed: state.introDismissed,
    metrics: state.metrics,
    reactions: state.reactions,
  }
}

function reducer(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "HYDRATE":
      return action.state
    case "SELECT_SLOT": {
      const productId = state.slots[action.slot]
      return {
        ...state,
        selectedSlot: action.slot,
        inspectProductId: productId || null,
        inspectorOpen: true,
        notice: null,
        metrics: productId
          ? bump(state.metrics, productId, "timesSelected")
          : state.metrics,
      }
    }
    case "INSPECT_PRODUCT": {
      if (!getProduct(action.productId)) return state
      const slot = slotForProduct(state.slots, action.productId)
      return {
        ...state,
        inspectProductId: action.productId,
        selectedSlot: slot ?? null,
        inspectorOpen: true,
        notice: null,
      }
    }
    case "VEND": {
      if (!state.selectedSlot) return state
      const productId = state.slots[state.selectedSlot]
      if (!productId) return state
      const already = state.haul.some((item) => item.productId === productId)
      const haul = already
        ? state.haul
        : [
            ...state.haul,
            {
              productId,
              slotCode: state.selectedSlot,
              vendedAt: new Date().toISOString(),
            },
          ]
      return {
        ...state,
        haul,
        dispensingId: productId,
        haulOpen: false,
        metrics: bump(state.metrics, productId, "timesVended"),
        notice: {
          kind: "vend",
          message: already ? "ALREADY IN YOUR HAUL" : "VENDED",
        },
      }
    }
    case "KEEP": {
      const productId =
        action.productId ??
        state.inspectProductId ??
        (state.selectedSlot ? state.slots[state.selectedSlot] : undefined)
      if (!productId) return state
      const active = Boolean(state.reactions[productId]?.keep)
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [productId]: { ...state.reactions[productId], keep: !active },
        },
        metrics: bump(state.metrics, productId, "keepVotes", active ? -1 : 1),
        notice: {
          kind: "keep",
          message: active ? "CLEARED · KEEP STOCKED" : "NOTED · KEEP STOCKED",
        },
      }
    }
    case "OWN": {
      const productId =
        action.productId ??
        state.inspectProductId ??
        (state.selectedSlot ? state.slots[state.selectedSlot] : undefined)
      if (!productId) return state
      const active = Boolean(state.reactions[productId]?.own)
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [productId]: { ...state.reactions[productId], own: !active },
        },
        metrics: bump(state.metrics, productId, "alreadyOwned", active ? -1 : 1),
        notice: {
          kind: "own",
          message: active ? "CLEARED · ALREADY OWN" : "NOTED · ALREADY OWN",
        },
      }
    }
    case "REMOVE_HAUL":
      return {
        ...state,
        haul: state.haul.filter((item) => item.productId !== action.productId),
      }
    case "APPLY_RESTOCK": {
      const shown = slotProductIds(action.slots)
      return {
        ...state,
        slots: action.slots,
        restockId: action.log.id,
        restockCount: state.restockCount + 1,
        restockLog: [action.log, ...state.restockLog].slice(0, 20),
        seenIds: unique([...state.seenIds, ...shown]),
        selectedSlot: "A1",
        inspectProductId: action.slots.A1 || null,
        metrics: bumpShown(state.metrics, shown),
        dispensingId: null,
        notice: { kind: "restock", message: "MACHINE RESTOCKED" },
      }
    }
    case "DISMISS_INTRO":
      return { ...state, introDismissed: true, introOpen: false }
    case "OPEN_INTRO":
      return { ...state, introOpen: true }
    case "SET_HAUL_OPEN":
      return { ...state, haulOpen: action.open, shareOpen: false }
    case "SET_SHARE_OPEN":
      return { ...state, shareOpen: action.open, haulOpen: action.open ? false : state.haulOpen }
    case "SET_MODAL":
      return { ...state, modal: action.modal }
    case "SET_INSPECTOR_OPEN":
      return { ...state, inspectorOpen: action.open }
    case "CLEAR_DISPENSE":
      return { ...state, dispensingId: null }
    case "SET_NOTICE":
      return { ...state, notice: action.notice }
    case "MARK_SHARED":
      if (!action.productId) return state
      return {
        ...state,
        metrics: bump(state.metrics, action.productId, "shares"),
      }
    default:
      return state
  }
}

type MachineContextValue = MachineState & {
  ready: boolean
  selectedProduct: ReturnType<typeof getProduct>
  newCount: number
  stockedCount: number
  selectSlot: (slot: SlotCode) => void
  inspectProduct: (productId: string) => void
  vend: () => void
  keepStocked: (productId?: string) => void
  alreadyOwn: (productId?: string) => void
  shareItem: () => Promise<void>
  shareHaul: () => Promise<void>
  removeFromHaul: (productId: string) => void
  restock: () => void
  dismissIntro: () => void
  openIntro: () => void
  setHaulOpen: (open: boolean) => void
  setShareOpen: (open: boolean) => void
  setModal: (modal: ModalId | null) => void
  setInspectorOpen: (open: boolean) => void
}

const MachineContext = createContext<MachineContextValue | null>(null)

export function MachineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = readJson<ReturnType<typeof persistable> | null>("machine", null)
    if (saved?.slots) {
      dispatch({
        type: "HYDRATE",
        state: {
          ...createInitialState(),
          ...saved,
          sessionId: getSessionId(),
          haulOpen: false,
          shareOpen: false,
          modal: null,
          dispensingId: null,
          notice: null,
          inspectorOpen: false,
          introOpen: false,
          inspectProductId: saved.selectedSlot
            ? saved.slots[saved.selectedSlot] || null
            : null,
        },
      })
    } else {
      const initial = createInitialState()
      dispatch({ type: "HYDRATE", state: initial })
      for (const id of slotProductIds(initial.slots)) {
        track({
          name: "product_shown",
          restockId: initial.restockId,
          productId: id,
        })
      }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    writeJson("machine", persistable(state))
  }, [ready, state])

  useEffect(() => {
    if (!state.dispensingId) return
    const timer = window.setTimeout(() => dispatch({ type: "CLEAR_DISPENSE" }), 2400)
    return () => window.clearTimeout(timer)
  }, [state.dispensingId])

  useEffect(() => {
    if (!state.notice) return
    const timer = window.setTimeout(() => dispatch({ type: "SET_NOTICE", notice: null }), 2200)
    return () => window.clearTimeout(timer)
  }, [state.notice])

  const selectSlot = useCallback(
    (slot: SlotCode) => {
      const productId = state.slots[slot]
      dispatch({ type: "SELECT_SLOT", slot })
      if (productId) {
        track({
          name: "slot_selected",
          restockId: state.restockId,
          productId,
          slotCode: slot,
        })
      }
    },
    [state.restockId, state.slots],
  )

  const vend = useCallback(() => {
    if (!state.selectedSlot) return
    const productId = state.slots[state.selectedSlot]
    dispatch({ type: "VEND" })
    track({
      name: "product_vended",
      restockId: state.restockId,
      productId,
      slotCode: state.selectedSlot,
    })
  }, [state.restockId, state.selectedSlot, state.slots])

  const keepStocked = useCallback(
    (productId?: string) => {
      const id =
        productId ??
        state.inspectProductId ??
        (state.selectedSlot ? state.slots[state.selectedSlot] : undefined)
      if (!id) return
      const active = Boolean(state.reactions[id]?.keep)
      const slotCode =
        state.haul.find((item) => item.productId === id)?.slotCode ??
        (state.selectedSlot && state.slots[state.selectedSlot] === id
          ? state.selectedSlot
          : undefined)
      dispatch({ type: "KEEP", productId: id })
      track({
        name: active ? "keep_stocked_removed" : "keep_stocked",
        restockId: state.restockId,
        productId: id,
        slotCode,
      })
    },
    [state.haul, state.inspectProductId, state.reactions, state.restockId, state.selectedSlot, state.slots],
  )

  const alreadyOwn = useCallback(
    (productId?: string) => {
      const id =
        productId ??
        state.inspectProductId ??
        (state.selectedSlot ? state.slots[state.selectedSlot] : undefined)
      if (!id) return
      const active = Boolean(state.reactions[id]?.own)
      const slotCode =
        state.haul.find((item) => item.productId === id)?.slotCode ??
        (state.selectedSlot && state.slots[state.selectedSlot] === id
          ? state.selectedSlot
          : undefined)
      dispatch({ type: "OWN", productId: id })
      track({
        name: active ? "already_own_removed" : "already_own",
        restockId: state.restockId,
        productId: id,
        slotCode,
      })
    },
    [state.haul, state.inspectProductId, state.reactions, state.restockId, state.selectedSlot, state.slots],
  )

  const shareItem = useCallback(async () => {
    const productId =
      state.inspectProductId ??
      (state.selectedSlot ? state.slots[state.selectedSlot] : undefined)
    const product = productId ? getProduct(productId) : undefined
    if (!product) return
    const title = `${product.name} · Internet Vending Machine`
    const text = `${product.name} · ${product.priceLabel}`
    const url = productShareUrl(product.id)
    const result = await sharePayload({
      title,
      text,
      url,
      clipboardText: `${text}\n\n${url}`,
    })
    if (result === "failed") return
    dispatch({ type: "MARK_SHARED", productId: product.id })
    dispatch({
      type: "SET_NOTICE",
      notice: {
        kind: "share",
        message: result === "copied" ? "LINK COPIED" : "SHARED",
      },
    })
    track({
      name: "share_item",
      restockId: state.restockId,
      productId: product.id,
      slotCode: state.selectedSlot ?? undefined,
    })
  }, [state.inspectProductId, state.restockId, state.selectedSlot, state.slots])

  const shareHaul = useCallback(async () => {
    const ids = state.haul.map((item) => item.productId)
    const count = state.haul.length
    const title = "Internet Vending Machine · Your Haul"
    const text = `My Internet Vending Machine haul · ${count} ${count === 1 ? "thing" : "things"}`
    const url = haulShareUrl(ids)
    const result = await sharePayload({
      title,
      text,
      url,
      clipboardText: `${text}\n\n${url}`,
    })
    if (result === "failed") return
    dispatch({
      type: "SET_NOTICE",
      notice: {
        kind: "share",
        message: result === "copied" ? "HAUL LINK COPIED" : "HAUL SHARED",
      },
    })
    recordHaulShareSnapshot(ids, state.restockId)
    track({
      name: "share_haul",
      restockId: state.restockId,
    })
  }, [state.haul, state.restockId])

  const restock = useCallback(() => {
    const { slots, log } = restockMachine(state.slots, state.seenIds)
    dispatch({ type: "APPLY_RESTOCK", slots, log })
    track({
      name: "restock_triggered",
      restockId: log.id,
    })
    for (const id of slotProductIds(slots)) {
      track({
        name: "product_shown",
        restockId: log.id,
        productId: id,
      })
    }
  }, [state.seenIds, state.slots])

  const openIntro = useCallback(() => {
    dispatch({ type: "OPEN_INTRO" })
    track({ name: "help_opened" })
  }, [])

  const inspectProduct = useCallback((productId: string) => {
    dispatch({ type: "INSPECT_PRODUCT", productId })
  }, [])

  const selectedProduct = state.inspectProductId
    ? getProduct(state.inspectProductId)
    : state.selectedSlot
      ? getProduct(state.slots[state.selectedSlot])
      : undefined

  const newCount = slotProductIds(state.slots).filter((id) =>
    getProduct(id)?.badges?.includes("new"),
  ).length

  const value = useMemo<MachineContextValue>(
    () => ({
      ...state,
      ready,
      selectedProduct,
      newCount,
      stockedCount: 16,
      selectSlot,
      inspectProduct,
      vend,
      keepStocked,
      alreadyOwn,
      shareItem,
      shareHaul,
      removeFromHaul: (productId: string) =>
        dispatch({ type: "REMOVE_HAUL", productId }),
      restock,
      dismissIntro: () => dispatch({ type: "DISMISS_INTRO" }),
      openIntro,
      setHaulOpen: (open: boolean) => {
        if (open && !state.haulOpen) track({ name: "haul_opened" })
        dispatch({ type: "SET_HAUL_OPEN", open })
      },
      setShareOpen: (open: boolean) => {
        if (open && !state.shareOpen) track({ name: "haul_card_viewed" })
        dispatch({ type: "SET_SHARE_OPEN", open })
      },
      setModal: (modal: ModalId | null) => {
        if (modal === "suggest") track({ name: "suggest_opened" })
        if (modal === "stock") track({ name: "stock_product_opened" })
        if (modal === "follow") track({ name: "follow_restocks_opened" })
        dispatch({ type: "SET_MODAL", modal })
      },
      setInspectorOpen: (open: boolean) =>
        dispatch({ type: "SET_INSPECTOR_OPEN", open }),
    }),
    [
      alreadyOwn,
      keepStocked,
      newCount,
      openIntro,
      inspectProduct,
      ready,
      restock,
      selectSlot,
      selectedProduct,
      shareHaul,
      shareItem,
      state,
      vend,
    ],
  )

  return <MachineContext.Provider value={value}>{children}</MachineContext.Provider>
}

export function useMachine(): MachineContextValue {
  const value = useContext(MachineContext)
  if (!value) throw new Error("useMachine must be used within MachineProvider")
  return value
}
