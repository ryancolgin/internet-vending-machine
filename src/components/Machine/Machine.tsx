import { MachineHeader } from "./MachineHeader"
import { SlotGrid } from "./SlotGrid"
import { InspectionPanel, InspectorBody } from "./InspectionPanel"
import { DispenseTray } from "./DispenseTray"
import { RestockControl } from "./RestockControl"
import { UtilityBar } from "./UtilityBar"
import {
  MOBILE_MACHINE_QUERY,
  TABLET_MACHINE_QUERY,
  useMediaQuery,
} from "../../lib/media"
import { slotForProduct } from "../../lib/slots"
import { useMachine } from "../../state/MachineContext"

export function Machine() {
  const isMobile = useMediaQuery(MOBILE_MACHINE_QUERY)
  const isTablet = useMediaQuery(TABLET_MACHINE_QUERY)
  const { inspectorOpen, selectedSlot, selectedProduct, slots } = useMachine()
  const overlayLayout = isMobile || isTablet
  const inMachine = Boolean(
    selectedProduct && slotForProduct(slots, selectedProduct.id),
  )

  return (
    <div className="machine">
      <span className="machine__screw machine__screw--tl" aria-hidden="true" />
      <span className="machine__screw machine__screw--tr" aria-hidden="true" />
      <span className="machine__screw machine__screw--bl" aria-hidden="true" />
      <span className="machine__screw machine__screw--br" aria-hidden="true" />
      <div className="machine__face">
        <MachineHeader />
        <div className="machine__body">
          <div className="machine__column">
            <SlotGrid />
            {overlayLayout && !inspectorOpen ? (
              <div
                className={`machine__dock${isTablet ? " machine__dock--tablet" : ""}`}
                id="inspection"
              >
                {selectedProduct ? (
                  <div className="inspector__card machine__dock-select">
                    <InspectorBody
                      selectedSlot={selectedSlot}
                      selectedProduct={selectedProduct}
                      inMachine={inMachine}
                      compact
                      visual="illustration"
                    />
                  </div>
                ) : null}
                <div className="machine__dock-output">
                  <div className="inspector__mechanism">
                    <DispenseTray />
                  </div>
                  <div className="inspector__controls">
                    <RestockControl />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <InspectionPanel />
        </div>
        <UtilityBar />
      </div>
    </div>
  )
}
