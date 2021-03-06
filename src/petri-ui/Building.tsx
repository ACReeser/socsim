
import React from "react";
import { City } from "../simulation/City";
import { IBuilding, BuildingIcon, hex_directions, transformPoint, hex_to_pixel, origin_point, HexPoint, BuildingJobIcon, UpgradedBuildingIcon } from "../simulation/Geography";
import { BuildingJobSlot } from "../simulation/Occupation";
import { GetRandom } from "../WorldGen";
import './Building.css';

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
function hexToTransform(direction: HexPoint){
    return transformPoint(getSlotOffset(direction))
}
const hexDirectionToJobSlot: {[key: number]: BuildingJobSlot} = {
    2: BuildingJobSlot.first,
    0: BuildingJobSlot.second,
    4: BuildingJobSlot.third,
    1: BuildingJobSlot.fourth,
    5: BuildingJobSlot.fifth,
    3: BuildingJobSlot.sixth,
}

export const PetriBuilding: React.FC<{
    city: City,
    building: IBuilding
}> = (props) => {
    // const buildingHex = props.building.address;
    // const p = hex_to_pixel(props.city.hex_size, props.city.petriOrigin, buildingHex);
    const sty = {}; //transformPoint(p);
    return <UIBuilding building={props.building} style={sty} cityName={props.city.name} getStyle={hexToTransform}></UIBuilding>;
}

export const UIBuilding: React.FC<{
    building: IBuilding,
    cityName: string,
    style: React.CSSProperties,
    getStyle: (h: HexPoint) => React.CSSProperties
}> = (props) => {
    
    return <div key={props.building.type+props.building.key} style={props.style} 
    className={"building "+props.building.type}>
    {props.building.upgraded ? UpgradedBuildingIcon[props.building.type] : BuildingIcon[props.building.type]}
    <UIBuildingSlots building={props.building} getStyle={props.getStyle}></UIBuildingSlots>
    {props.building.type === 'courthouse' ? <span className="tile-label">{props.cityName}</span> : null}
    </div>
}
export const UIBuildingSlots: React.FC<{
    building: IBuilding,
    getStyle: (h: HexPoint) => React.CSSProperties
}> = (props) => {
    return <>{hex_directions.map((d, i: number) => {
        const jobSlot: BuildingJobSlot = hexDirectionToJobSlot[i];
        const hasJob = props.building.job_slots[jobSlot] != null;
        return <span key={i} className="slot" style={props.getStyle(d)}>
            {hasJob ? BuildingJobIcon[props.building.type] : null}
        </span>
    })}</>
}