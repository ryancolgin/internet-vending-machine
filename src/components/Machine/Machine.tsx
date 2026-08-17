import { MachineHeader } from "./MachineHeader"
import { SlotGrid } from "./SlotGrid"
import { InspectionPanel } from "./InspectionPanel"
import { DispenseTray } from "./DispenseTray"
import { RestockControl } from "./RestockControl"
import { UtilityBar } from "./UtilityBar"

export function Machine() {
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
            <DispenseTray />
            <RestockControl />
          </div>
          <InspectionPanel />
        </div>
        <UtilityBar />
      </div>
    </div>
  )
}
