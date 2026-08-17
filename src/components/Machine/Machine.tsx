import { MachineHeader } from "./MachineHeader"
import { SlotGrid } from "./SlotGrid"
import { InspectionPanel } from "./InspectionPanel"
import { RestockControl } from "./RestockControl"
import { UtilityBar } from "./UtilityBar"
import {
  MOBILE_MACHINE_QUERY,
  TABLET_MACHINE_QUERY,
  useMediaQuery,
} from "../../lib/media"
import { useMachine } from "../../state/MachineContext"

export function Machine() {
  const isMobile = useMediaQuery(MOBILE_MACHINE_QUERY)
  const isTablet = useMediaQuery(TABLET_MACHINE_QUERY)
  const { inspectorOpen } = useMachine()
  const overlayLayout = isMobile || isTablet

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
              <div className="machine__dock">
                <RestockControl />
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
