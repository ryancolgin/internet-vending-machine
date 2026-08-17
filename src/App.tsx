import { useEffect } from "react"
import { Machine } from "./components/Machine/Machine"
import { HaulDrawer } from "./components/Haul/HaulDrawer"
import { HaulShareCard } from "./components/Haul/HaulShareCard"
import { FirstVisit } from "./components/Intro/FirstVisit"
import { InfoModal } from "./components/Modals/InfoModal"
import { parseShareHash } from "./lib/share"
import { useMachine } from "./state/MachineContext"

function HashBridge() {
  const { setShareOpen, selectSlot, slots } = useMachine()

  useEffect(() => {
    const apply = () => {
      const parsed = parseShareHash(window.location.hash)
      if (parsed.haulIds?.length) {
        setShareOpen(true)
        return
      }
      if (parsed.productId) {
        const match = (Object.keys(slots) as Array<keyof typeof slots>).find(
          (code) => slots[code] === parsed.productId,
        )
        if (match) selectSlot(match)
      }
    }
    apply()
    window.addEventListener("hashchange", apply)
    return () => window.removeEventListener("hashchange", apply)
  }, [selectSlot, setShareOpen, slots])

  return null
}

export default function App() {
  const {
    setHaulOpen,
    setShareOpen,
    setModal,
    setInspectorOpen,
    haulOpen,
    shareOpen,
    modal,
    inspectorOpen,
  } = useMachine()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (modal) setModal(null)
      else if (shareOpen) setShareOpen(false)
      else if (haulOpen) setHaulOpen(false)
      else if (inspectorOpen) setInspectorOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    haulOpen,
    inspectorOpen,
    modal,
    setHaulOpen,
    setInspectorOpen,
    setModal,
    setShareOpen,
    shareOpen,
  ])

  return (
    <div className="room">
      <a className="skip-link" href="#slots">
        Skip to machine
      </a>
      <div className="room__inner">
        <Machine />
      </div>
      <HaulDrawer />
      <HaulShareCard />
      <FirstVisit />
      <InfoModal />
      <HashBridge />
    </div>
  )
}
