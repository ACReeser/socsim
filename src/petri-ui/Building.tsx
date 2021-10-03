
import React from "react";
import { ICity } from "../simulation/City";
import { IBuilding, BuildingIcon, hex_directions, transformPoint, hex_to_pixel, origin_point, HexPoint, BuildingJobIcon, UpgradedBuildingIcon, ILot } from "../simulation/Geography";
import { BuildingJobSlot } from "../simulation/Occupation";
import { useAppSelector } from "../state/hooks";
import { GetRandom } from "../WorldGen";
import './Building.css';

const slot_size = {
    x: 25,
    y: 25
}
export function getSlotOffset(direction: HexPoint){
    return hex_to_pixel(slot_size, origin_point, direction);
}
export function getRandomSlotOffset(seed: string){
    return getSlotOffset(GetRandom(seed, hex_directions));
}
function hexToTransform(direction: HexPoint){
    return transformPoint(getSlotOffset(direction))
}
const hexDirectionToJobSlot: {[key: number]: number} = {
    2: 0,
    0: 1,
    4: 2,
    1: 3,
    5: 4,
    3: 5,
}

export const PetriBuilding: React.FC<{
    lotKey: number
}> = (props) => {
    const lot: ILot = useAppSelector(state => state.world.lots.byID[props.lotKey]);
    const building: IBuilding|undefined = useAppSelector(state => lot.buildingKey != null ? state.world.buildings.byID[lot.buildingKey]: undefined);
    if (building)
        return <text x="280.931px" y="77.859px" style={{fontSize:'36px'}}>{building.upgraded ? UpgradedBuildingIcon[building.type] : BuildingIcon[building.type]}</text>
    else 
        return <text x="280.931px" y="77.859px" style={{fontSize:'36px'}}>{lot.kind === 'rural' ? '🌼' : '🚏'}</text>
}

export const UIBuilding: React.FC<{
    building: IBuilding,
    style: React.CSSProperties,
    getStyle: (h: HexPoint) => React.CSSProperties
}> = (props) => {
    return <div key={props.building.type+props.building.key} style={props.style} 
    className={"building "+props.building.type}>
    {props.building.upgraded ? UpgradedBuildingIcon[props.building.type] : BuildingIcon[props.building.type]}
    <UIBuildingSlots building={props.building} getStyle={props.getStyle}></UIBuildingSlots>
    {props.children}
    </div>
}
export const UIBuildingSlots: React.FC<{
    building: IBuilding,
    getStyle: (h: HexPoint) => React.CSSProperties
}> = (props) => {
    return <>{hex_directions.map((d, i: number) => {
        const jobSlot: BuildingJobSlot = hexDirectionToJobSlot[i];
        const hasJob = props.building.jobs[jobSlot] != null;
        return <span key={i} className="slot" style={props.getStyle(d)}>
            {hasJob ? BuildingJobIcon[props.building.type] : null}
        </span>
    })}</>
}