import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { editionNewCount, editionSlotRecord, getCurrentEdition, getEditionById } from "../data/editions"
import { INITIAL_SLOT_PRODUCT_IDS, getProduct } from "../data/products"
import { track } from "../lib/analytics"
import {
  adjacentEditions,
  EDITION_VIEW_EVENT,
  editionPhaseLabel,
  getActiveEditionFace,
  getPublishedEditionSlots,
  getViewedEditionSlots,
  isSandboxRestockEnabled,
  provenanceEditionId,
  readEditionQuery,
  SANDBOX_SLOTS_KEY,
  showEditionInUrl,
} from "../lib/editionPreview"
import type { Edition } from "../types/edition"
import { createId, unique } from "../lib/ids"
import { restockMachine } from "../lib/restock"
import { getSessionId } from "../lib/session"
import { latestHaulCardIds, sharedHaulCardIds } from "../lib/haulCard"
import {
  haulShareUrl,
  productShareUrl,
  sharePayload,
} from "../lib/share"
import { assignToSlots, slotForProduct, slotProductIds } from "../lib/slots"
import { recordHaulShareSnapshot } from "../lib/haulHistory"
import { readJson, writeJson } from "../lib/storage"
import { isEditionLive, type HaulItem, type ModalId, type Notice, type RestockLogEntry } from "../types/machine"
import type { ProductMetrics, SlotCode } from "../types/product"

type Reactions = Record<string, { keep?: boolean; own?: boolean }>

type InspectionSource = "slot" | "shared" | null

export type MachineState = {
  sessionId: string
  restockId: string
  restockCount: number
  restockLog: RestockLogEntry[]
  slots: Record<SlotCode, string>
  selectedSlot: SlotCode | null
  inspectProductId: string | null
  inspectionSource: InspectionSource
  inspectorOpen: boolean
  haul: HaulItem[]
  seenIds: string[]
  introDismissed: boolean
  introOpen: boolean
  haulOpen: boolean
  shareOpen: boolean
  sharedHaulIds: string[] | null
  modal: ModalId | null
  dispensingId: string | null
  notice: Notice | null
  metrics: Record<string, ProductMetrics>
  reactions: Reactions
}

type Action =
  | { type: "HYDRATE"; state: MachineState }
  | { type: "SELECT_SLOT"; slot: SlotCode; productId?: string; skipMetrics?: boolean }
  | { type: "SYNC_FACE"; productId: string | null }
  | { type: "INSPECT_PRODUCT"; productId: string }
  | { type: "INSPECT_SHARED_PRODUCT"; productId: string }
  | { type: "VEND"; productId?: string; slotCode?: SlotCode; skipMetrics?: boolean; editionId?: string }
  | { type: "KEEP"; productId?: string }
  | { type: "OWN"; productId?: string }
  | { type: "REMOVE_HAUL"; productId: string }
  | { type: "APPLY_RESTOCK"; slots: Record<SlotCode, string>; log: RestockLogEntry }
  | { type: "DISMISS_INTRO" }
  | { type: "OPEN_INTRO" }
  | { type: "SET_HAUL_OPEN"; open: boolean }
  | { type: "SET_SHARE_OPEN"; open: boolean }
  | { type: "OPEN_SHARED_HAUL"; productIds: string[] }
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

function vendTarget(
  state: MachineState,
  slots: Record<SlotCode, string> = state.slots,
): { productId: string; slotCode?: SlotCode } | null {
  if (state.inspectionSource === "shared" && state.inspectProductId) {
    if (!getProduct(state.inspectProductId)) return null
    return { productId: state.inspectProductId }
  }
  if (state.selectedSlot) {
    const productId = slots[state.selectedSlot]
    if (!productId) return null
    return { productId, slotCode: state.selectedSlot }
  }
  return null
}

function createInitialState(): MachineState {
  const slots = getPublishedEditionSlots() ?? assignToSlots([...INITIAL_SLOT_PRODUCT_IDS])
  const shown = slotProductIds(slots)
  return {
    sessionId: getSessionId(),
    restockId: createId("rst"),
    restockCount: 0,
    restockLog: [],
    slots,
    selectedSlot: "B3",
    inspectProductId: slots.B3,
    inspectionSource: "slot",
    inspectorOpen: false,
    haul: [],
    seenIds: shown,
    introDismissed: false,
    introOpen: false,
    haulOpen: false,
    shareOpen: false,
    sharedHaulIds: null,
    modal: null,
    dispensingId: null,
    notice: null,
    metrics: bumpShown({}, shown),
    reactions: {},
  }
}

type Persistable = {
  restockId: string
  restockCount: number
  restockLog: RestockLogEntry[]
  slots: Record<SlotCode, string>
  selectedSlot: SlotCode | null
  haul: HaulItem[]
  seenIds: string[]
  introDismissed: boolean
  metrics: Record<string, ProductMetrics>
  reactions: Reactions
}

function persistable(state: MachineState): Persistable {
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

function persistMachine(state: MachineState) {
  const saved = readJson<Partial<Persistable>>("machine", {})
  if (isEditionLive()) {
    writeJson("machine", {
      ...saved,
      restockId: state.restockId,
      selectedSlot: state.selectedSlot,
      haul: state.haul,
      seenIds: state.seenIds,
      introDismissed: state.introDismissed,
      metrics: state.metrics,
      reactions: state.reactions,
    })
    return
  }
  writeJson("machine", persistable(state))
}

function reducer(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "HYDRATE":
      return action.state
    case "SYNC_FACE":
      if (state.inspectionSource === "shared") return state
      if (state.inspectProductId === action.productId) return state
      return {
        ...state,
        inspectProductId: action.productId,
        inspectionSource: action.productId ? "slot" : state.inspectionSource,
      }
    case "SELECT_SLOT": {
      const productId = action.productId ?? state.slots[action.slot]
      return {
        ...state,
        selectedSlot: action.slot,
        inspectProductId: productId || null,
        inspectionSource: "slot",
        inspectorOpen: true,
        notice: null,
        metrics:
          action.skipMetrics || !productId
            ? state.metrics
            : bump(state.metrics, productId, "timesSelected"),
      }
    }
    case "INSPECT_PRODUCT": {
      if (!getProduct(action.productId)) return state
      const slot = slotForProduct(state.slots, action.productId)
      return {
        ...state,
        inspectProductId: action.productId,
        selectedSlot: slot ?? null,
        inspectionSource: slot ? "slot" : null,
        inspectorOpen: true,
        notice: null,
      }
    }
    case "INSPECT_SHARED_PRODUCT": {
      if (!getProduct(action.productId)) return state
      return {
        ...state,
        inspectProductId: action.productId,
        selectedSlot: null,
        inspectionSource: "shared",
        inspectorOpen: true,
        notice: null,
      }
    }
    case "VEND": {
      const target = action.productId
        ? { productId: action.productId, slotCode: action.slotCode }
        : vendTarget(state)
      if (!target) return state
      const already = state.haul.some((item) => item.productId === target.productId)
      const haul = already
        ? state.haul
        : [
            ...state.haul,
            {
              productId: target.productId,
              ...(target.slotCode ? { slotCode: target.slotCode } : {}),
              ...(action.editionId ? { editionId: action.editionId } : {}),
              vendedAt: new Date().toISOString(),
            },
          ]
      return {
        ...state,
        haul,
        dispensingId: target.productId,
        haulOpen: false,
        metrics: action.skipMetrics
          ? state.metrics
          : bump(state.metrics, target.productId, "timesVended"),
        notice: {
          kind: "vend",
          message: already ? "ALREADY IN YOUR HAUL" : "DISPENSED",
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
        inspectionSource: "slot",
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
      return { ...state, haulOpen: action.open, shareOpen: false, sharedHaulIds: null }
    case "SET_SHARE_OPEN":
      return {
        ...state,
        shareOpen: action.open,
        haulOpen: action.open ? false : state.haulOpen,
        sharedHaulIds: null,
      }
    case "OPEN_SHARED_HAUL":
      return {
        ...state,
        sharedHaulIds: action.productIds,
        shareOpen: true,
        haulOpen: false,
      }
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
  editionPreviewLabel: string | null
  editionPhase: "CURRENT" | "PREVIOUS" | "DRAFT" | null
  previousEdition: Edition | null
  nextEdition: Edition | null
  faceEdition: Edition | null
  showEdition: (id: string) => void
  selectSlot: (slot: SlotCode) => void
  inspectProduct: (productId: string) => void
  inspectSharedProduct: (productId: string) => void
  vend: (productId?: string) => void
  keepStocked: (productId?: string) => void
  alreadyOwn: (productId?: string) => void
  shareItem: (productId?: string) => Promise<void>
  shareHaul: () => Promise<void>
  removeFromHaul: (productId: string) => void
  restock: () => void
  dismissIntro: () => void
  openIntro: () => void
  setHaulOpen: (open: boolean) => void
  setShareOpen: (open: boolean) => void
  openSharedHaul: (productIds: string[]) => void
  setModal: (modal: ModalId | null) => void
  setInspectorOpen: (open: boolean) => void
}

const MachineContext = createContext<MachineContextValue | null>(null)

export function MachineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [ready, setReady] = useState(false)
  const [editionTick, setEditionTick] = useState(0)
  const [sandboxSlots, setSandboxSlots] = useState<Record<SlotCode, string> | null>(null)
  const faceEdition = useMemo(() => getActiveEditionFace(), [editionTick])
  const editionSlots = useMemo(
    () => (faceEdition ? editionSlotRecord(faceEdition) : getViewedEditionSlots()),
    [faceEdition],
  )
  const publishedSlots = getPublishedEditionSlots()
  const displaySlots = editionSlots ?? sandboxSlots ?? publishedSlots ?? state.slots
  const draftFace = faceEdition?.status === "draft"
  const faceRef = useRef(faceEdition)
  faceRef.current = faceEdition
  const draftRef = useRef(draftFace)
  draftRef.current = draftFace
  const displayRef = useRef(displaySlots)
  displayRef.current = displaySlots

  useEffect(() => {
    if (import.meta.env.DEV) return
    const requested = readEditionQuery()
    if (!requested) return
    const edition = getEditionById(requested)
    const current = getCurrentEdition()
    if (edition?.status === "draft" && current) showEditionInUrl(current.id)
  }, [editionTick])

  useEffect(() => {
    const sync = () => setEditionTick((tick) => tick + 1)
    window.addEventListener("popstate", sync)
    window.addEventListener(EDITION_VIEW_EVENT, sync)
    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener(EDITION_VIEW_EVENT, sync)
    }
  }, [])

  useEffect(() => {
    const saved = readJson<Partial<Persistable> | null>("machine", null)
    const published = getPublishedEditionSlots()
    const viewed = getViewedEditionSlots()
    const initial = createInitialState()

    if (published) {
      const selectedSlot = saved?.selectedSlot ?? initial.selectedSlot
      const faceSlots = viewed ?? published
      dispatch({
        type: "HYDRATE",
        state: {
          ...initial,
          restockId: saved?.restockId ?? initial.restockId,
          selectedSlot,
          haul: Array.isArray(saved?.haul) ? saved.haul : initial.haul,
          seenIds: saved?.seenIds ?? initial.seenIds,
          introDismissed: saved?.introDismissed ?? initial.introDismissed,
          metrics: saved?.metrics ?? initial.metrics,
          reactions: saved?.reactions ?? initial.reactions,
          slots: published,
          sessionId: getSessionId(),
          haulOpen: false,
          shareOpen: false,
          sharedHaulIds: null,
          modal: null,
          dispensingId: null,
          notice: null,
          inspectorOpen: false,
          introOpen: false,
          inspectProductId: selectedSlot ? faceSlots[selectedSlot] || null : null,
          inspectionSource: selectedSlot ? "slot" : null,
        },
      })
      if (isSandboxRestockEnabled()) {
        const sandbox = readJson<Record<SlotCode, string> | null>(SANDBOX_SLOTS_KEY, null)
        if (sandbox) setSandboxSlots(sandbox)
      }
    } else if (saved?.slots) {
      dispatch({
        type: "HYDRATE",
        state: {
          ...initial,
          ...saved,
          slots: saved.slots,
          sessionId: getSessionId(),
          haulOpen: false,
          shareOpen: false,
          sharedHaulIds: null,
          modal: null,
          dispensingId: null,
          notice: null,
          inspectorOpen: false,
          introOpen: false,
          inspectProductId: saved.selectedSlot
            ? saved.slots[saved.selectedSlot] || null
            : null,
          inspectionSource: saved.selectedSlot ? "slot" : null,
        },
      })
    } else {
      dispatch({ type: "HYDRATE", state: initial })
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    persistMachine(state)
  }, [ready, state])

  useEffect(() => {
    if (!ready || !editionSlots || !state.selectedSlot) return
    if (state.inspectionSource === "shared") return
    const productId = editionSlots[state.selectedSlot] || null
    if (productId === state.inspectProductId) return
    dispatch({ type: "SYNC_FACE", productId })
  }, [ready, editionSlots, state.inspectionSource, state.inspectProductId, state.selectedSlot])

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
      const productId = displaySlots[slot]
      const skipMetrics = draftRef.current
      dispatch({
        type: "SELECT_SLOT",
        slot,
        productId,
        skipMetrics,
      })
      if (productId && !skipMetrics) {
        track({
          name: "slot_selected",
          restockId: state.restockId,
          productId,
          slotCode: slot,
          editionId: faceRef.current?.id,
        })
      }
    },
    [displaySlots, state.restockId],
  )

  const vend = useCallback((productId?: string) => {
    const slots = displayRef.current
    const target = productId
      ? {
          productId,
          slotCode: slotForProduct(slots, productId) ?? state.selectedSlot ?? undefined,
        }
      : vendTarget(state, slots)
    if (!target) return
    const skipMetrics = draftRef.current
    const editionId = provenanceEditionId()
    dispatch({
      type: "VEND",
      productId: target.productId,
      slotCode: target.slotCode,
      skipMetrics,
      editionId,
    })
    if (skipMetrics) return
    track({
      name: "product_vended",
      restockId: state.restockId,
      productId: target.productId,
      editionId,
      ...(target.slotCode ? { slotCode: target.slotCode } : {}),
    })
  }, [state])

  const productFromFace = useCallback(
    (productId?: string) => {
      const slots = displayRef.current
      return (
        productId ??
        state.inspectProductId ??
        (state.selectedSlot ? slots[state.selectedSlot] : undefined)
      )
    },
    [state.inspectProductId, state.selectedSlot],
  )

  const keepStocked = useCallback(
    (productId?: string) => {
      const id = productFromFace(productId)
      if (!id) return
      const active = Boolean(state.reactions[id]?.keep)
      const slots = displayRef.current
      const slotCode =
        state.haul.find((item) => item.productId === id)?.slotCode ??
        (state.selectedSlot && slots[state.selectedSlot] === id
          ? state.selectedSlot
          : undefined)
      dispatch({ type: "KEEP", productId: id })
      if (draftRef.current) return
      track({
        name: active ? "keep_stocked_removed" : "keep_stocked",
        restockId: state.restockId,
        productId: id,
        slotCode,
        editionId: faceRef.current?.id,
      })
    },
    [productFromFace, state.haul, state.reactions, state.restockId, state.selectedSlot],
  )

  const alreadyOwn = useCallback(
    (productId?: string) => {
      const id = productFromFace(productId)
      if (!id) return
      const active = Boolean(state.reactions[id]?.own)
      const slots = displayRef.current
      const slotCode =
        state.haul.find((item) => item.productId === id)?.slotCode ??
        (state.selectedSlot && slots[state.selectedSlot] === id
          ? state.selectedSlot
          : undefined)
      dispatch({ type: "OWN", productId: id })
      if (draftRef.current) return
      track({
        name: active ? "already_own_removed" : "already_own",
        restockId: state.restockId,
        productId: id,
        slotCode,
        editionId: faceRef.current?.id,
      })
    },
    [productFromFace, state.haul, state.reactions, state.restockId, state.selectedSlot],
  )

  const shareItem = useCallback(async (productId?: string) => {
    const resolvedId = productFromFace(productId)
    const product = resolvedId ? getProduct(resolvedId) : undefined
    if (!product) return
    const url = productShareUrl(product.id)
    const result = await sharePayload(url)
    if (result === "failed") return
    const haulItem = state.haul.find((item) => item.productId === product.id)
    const slots = displayRef.current
    const slotCode =
      haulItem?.slotCode ??
      (state.selectedSlot && slots[state.selectedSlot] === product.id
        ? state.selectedSlot
        : undefined)
    dispatch({ type: "MARK_SHARED", productId: product.id })
    dispatch({
      type: "SET_NOTICE",
      notice: {
        kind: "share",
        message: result === "copied" ? "LINK COPIED" : "SHARED",
      },
    })
    if (!draftRef.current) {
      track({
        name: "share_item",
        restockId: state.restockId,
        productId: product.id,
        slotCode,
        editionId: haulItem?.editionId ?? faceRef.current?.id,
      })
    }
  }, [productFromFace, state.haul, state.restockId, state.selectedSlot])

  const shareHaul = useCallback(async () => {
    const ids = state.sharedHaulIds
      ? sharedHaulCardIds(state.sharedHaulIds)
      : latestHaulCardIds(state.haul)
    const url = haulShareUrl(ids)
    const result = await sharePayload(url)
    if (result === "failed") return
    dispatch({
      type: "SET_NOTICE",
      notice: {
        kind: "share",
        message: result === "copied" ? "HAUL LINK COPIED" : "HAUL SHARED",
      },
    })
    recordHaulShareSnapshot(ids, state.restockId)
    if (!draftRef.current) {
      track({
        name: "share_haul",
        restockId: state.restockId,
        editionId: faceRef.current?.id,
      })
    }
  }, [state.haul, state.restockId, state.sharedHaulIds])

  const restock = useCallback(() => {
    if (editionSlots) return
    if (isSandboxRestockEnabled()) {
      const current = sandboxSlots ?? publishedSlots ?? state.slots
      const { slots } = restockMachine(current, state.seenIds)
      setSandboxSlots(slots)
      writeJson(SANDBOX_SLOTS_KEY, slots)
      return
    }
    if (isEditionLive()) return
    const { slots, log } = restockMachine(state.slots, state.seenIds)
    dispatch({ type: "APPLY_RESTOCK", slots, log })
    track({
      name: "restock_triggered",
      restockId: log.id,
    })
  }, [editionSlots, publishedSlots, sandboxSlots, state.seenIds, state.slots])

  const openIntro = useCallback(() => {
    dispatch({ type: "OPEN_INTRO" })
    track({ name: "help_opened" })
  }, [])

  const inspectProduct = useCallback((productId: string) => {
    dispatch({ type: "INSPECT_PRODUCT", productId })
  }, [])

  const inspectSharedProduct = useCallback((productId: string) => {
    dispatch({ type: "INSPECT_SHARED_PRODUCT", productId })
  }, [])

  const selectedProduct = state.selectedSlot
    ? getProduct(displaySlots[state.selectedSlot])
    : state.inspectProductId
      ? getProduct(state.inspectProductId)
      : undefined

  const newCount = faceEdition
    ? editionNewCount(faceEdition)
    : slotProductIds(displaySlots).filter((id) =>
        getProduct(id)?.badges?.includes("new"),
      ).length
  const editionPreviewLabel = draftFace ? `DRAFT EDITION ${faceEdition.id}` : null
  const neighbors = adjacentEditions(faceEdition)
  const editionPhase = faceEdition ? editionPhaseLabel(faceEdition.status) : null
  const showEdition = useCallback((id: string) => {
    const next = getEditionById(id)
    const currentId = faceRef.current?.id
    showEditionInUrl(id)
    if (!next || next.id === currentId || next.status === "draft") return
    track({ name: "edition_viewed", editionId: next.id })
  }, [])

  const value = useMemo<MachineContextValue>(
    () => ({
      ...state,
      slots: displaySlots,
      ready,
      selectedProduct,
      newCount,
      stockedCount: 16,
      editionPreviewLabel,
      editionPhase,
      previousEdition: neighbors.previous,
      nextEdition: neighbors.next,
      faceEdition,
      showEdition,
      selectSlot,
      inspectProduct,
      inspectSharedProduct,
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
        if (open && !state.haulOpen && !draftFace) {
          track({ name: "haul_opened", editionId: faceEdition?.id })
        }
        dispatch({ type: "SET_HAUL_OPEN", open })
      },
      setShareOpen: (open: boolean) => {
        if (open && !state.shareOpen && !draftFace) {
          track({ name: "haul_card_viewed", editionId: faceEdition?.id })
        }
        dispatch({ type: "SET_SHARE_OPEN", open })
      },
      openSharedHaul: (productIds: string[]) => {
        const ids = unique(productIds.filter((id) => Boolean(getProduct(id))))
        if (ids.length === 0) return
        if (!state.shareOpen) track({ name: "haul_card_viewed" })
        dispatch({ type: "OPEN_SHARED_HAUL", productIds: ids })
      },
      setModal: (modal: ModalId | null) => {
        if (modal === "suggest") track({ name: "suggest_opened" })
        if (modal === "stock") track({ name: "stock_product_opened" })
        if (modal === "follow") {
          track({ name: "follow_restocks_opened" })
          track({ name: "restock_signup_opened" })
        }
        dispatch({ type: "SET_MODAL", modal })
      },
      setInspectorOpen: (open: boolean) =>
        dispatch({ type: "SET_INSPECTOR_OPEN", open }),
    }),
    [
      alreadyOwn,
      displaySlots,
      draftFace,
      editionPhase,
      editionPreviewLabel,
      faceEdition,
      neighbors.next,
      neighbors.previous,
      showEdition,
      keepStocked,
      newCount,
      openIntro,
      inspectProduct,
      inspectSharedProduct,
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
