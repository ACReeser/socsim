
import React, { ReactElement } from "react";
import { ICity } from "../simulation/City";
import { IBuilding, BuildingIcon, hex_directions, transformPoint, hex_to_pixel, origin_point, HexPoint, BuildingJobIcon, UpgradedBuildingIcon, ILot, BuildingTypes, BuildingToGood } from "../simulation/Geography";
import { BuildingJobSlot } from "../simulation/Occupation";
import { build } from "../state/features/world.reducer";
import { useAppSelector } from "../state/hooks";
import { GoodIcon, TraitGood } from "../World";
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
const hexDirectionToJobSlot: {[key: number]: number} = {
    2: 0,
    0: 1,
    4: 2,
    1: 3,
    5: 4,
    3: 5,
}

export const BuildingToJobIcon: {[type in BuildingTypes]: string} = {
    'farm':'🪕',
    'house':'🧹',
    'hospital':'🩺',
    'church':'',
    'theater':'👘',
    'courthouse':'💼',
    'park':'🎒',
    'nature': '🎒'
};

export const PetriGoods: React.FC<{
    goodType: TraitGood,
    enterpriseKey: number
}> = (props) => {
    const quantity = useAppSelector(state => state.world.economy.market.listings[props.goodType].filter(
        x => x.sellerEnterpriseKey === props.enterpriseKey).reduce(
        (sum, l) => sum + l.quantity, 0)
    );
    if (quantity < 1)
        return null;
    else {
        const is: {row: number, col: number}[] = [];
        for (let i = 0; i < quantity; i++) {
            is.push({
                row: Math.floor(i/2),
                col: i % 2
            });
        }
        return <>
            {
                is.map((i, ii) => <text x={270+(i.col*-12)+"px"} y={(85+(i.row*-12))+"px"} style={{fontSize:'11px'}} key={ii}>{GoodIcon[props.goodType]}</text>)
            }
        </>;
    }
}
export const PetriBuilding: React.FC<{
    lotKey: number
}> = (props) => {
    const lot: ILot = useAppSelector(state => state.world.lots.byID[props.lotKey]);
    const building: IBuilding|undefined = useAppSelector(state => lot.buildingKey != null ? state.world.buildings.byID[lot.buildingKey]: undefined);
    if (building)
        return <>
            <text x="280px" y="77.859px" style={{fontSize:'36px'}}>{building.upgraded ? UpgradedBuildingIcon[building.type] : BuildingIcon[building.type]}</text>
            {
                building.jobs.filter(x => x != null).map((y,i) => <text x="325px" y={(85+(i*-14))+"px"} style={{fontSize:'11px'}} key={y}>{BuildingToJobIcon[building.type]}</text>)
            }
            {(building.enterpriseKey != null) ? <PetriGoods enterpriseKey={building.enterpriseKey} goodType={BuildingToGood[building.type]}></PetriGoods> : null}
        </>
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