
import React from "react";
import { City } from "../simulation/City";
import { IBuilding, BuildingIcon, hex_directions, transformPoint, hex_to_pixel, origin_point, HexPoint, BuildingJobIcon, UpgradedBuildingIcon } from "../simulation/Geography";
import { BuildingJobSlot } from "../simulation/Occupation";
import { GetRandom } from "../WorldGen";
import './Building.css';
import { Magnet } from "./Magnet";

const slot_size = {
    x: 25,
    y: 25
}
export function getSlotOffset(direction: HexPoint){
    return hex_to_pixel(slot_size, origin_point, direction);
}
export function getRandomSlotOffset(){
    return getSlotOffset(GetRandom(hex_directions));
}
const hexDirectionToJobSlot: {[key: number]: BuildingJobSlot} = {
    2: BuildingJobSlot.first,
    0: BuildingJobSlot.second,
    4: BuildingJobSlot.third,
    1: BuildingJobSlot.fourth,
    5: BuildingJobSlot.fifth,
    3: BuildingJobSlot.sixth,
}

export class PetriBuilding extends React.Component<{
    city: City,
    building: IBuilding
}> {
    slots() {
        return hex_directions.map((d, i: number) => {
            const jobSlot: BuildingJobSlot = hexDirectionToJobSlot[i];
            const hasJob = this.props.building.job_slots[jobSlot] != null;
            return <span key={i} className="slot" style={transformPoint(getSlotOffset(d))}>
                {hasJob ? BuildingJobIcon[this.props.building.type] : null}
            </span>
        });
    }
    render() {
        const buildingHex = this.props.building.address;
        const p = hex_to_pixel(this.props.city.hex_size, this.props.city.petriOrigin, buildingHex);
        const sty = transformPoint(p);
        return <div key={this.props.building.type+this.props.building.key} style={sty} 
        className={"building "+this.props.building.type}>
        {this.props.building.upgraded ? UpgradedBuildingIcon[this.props.building.type] : BuildingIcon[this.props.building.type]}
        {this.slots()}
        {this.props.building.type === 'courthouse' ? <span className="tile-label">{this.props.city.name}</span> : null}
        </div>
    }
}