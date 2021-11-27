
import React from "react";
import { BuildingIcon, hex_directions, hex_to_pixel, origin_point, HexPoint, BuildingJobIcon, UpgradedBuildingIcon, ILot, BuildingTypes, BuildingToGood, polarToPoint } from "../simulation/Geography";
import { BuildingJobSlot } from "../simulation/Occupation";
import { IBuilding } from "../simulation/RealEstate";
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
    'church':'📿',
    'theater':'👘',
    'jail':'🚨',
    'graveyard':'📿',
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
    if (building){
        const good = BuildingToGood[building.type];
        const upgraded = building.upgradedJobs || building.upgradedStorage;
        const center = {x: 280, y: 77.859};
        return <>
        <text x={center.x} y={center.y} style={{fontSize:'36px'}}>{upgraded ? UpgradedBuildingIcon[building.type] : BuildingIcon[building.type]}</text>
        {
            building.employeeBeanKeys.map((y,i) => <text x="325px" y={(85+(i*-14))+"px"} style={{fontSize:'11px'}} key={y}>{BuildingToJobIcon[building.type]}</text>)
        }
        {(building.enterpriseKey != null && good) ? <PetriGoods enterpriseKey={building.enterpriseKey} goodType={good}></PetriGoods> : null}
        {
            building.interredBeanKeys != null ? building.interredBeanKeys.map((x,i) => {
                const p = polarToPoint({r: 40, az: (Math.PI/2) + (Math.PI*2*i/6)})
                return <text x={center.x+p.x+10} y={center.y+p.y-10} style={{fontSize:'11px'}} key={x}><span role="img" aria-label="coffin">⚰️</span></text>
            }) : null
        }
    </>
    }
    else 
        return <text x="280.931px" y="77.859px" style={{fontSize:'36px'}}>{lot.kind === 'rural' ? '🌼' : '🚏'}</text>
}

export const UIBuilding: React.FC<{
    building: IBuilding,
    style: React.CSSProperties,
    getStyle: (h: HexPoint) => React.CSSProperties
}> = (props) => {
    const upgraded = props.building.upgradedJobs || props.building.upgradedStorage;
    return <div key={props.building.type+props.building.key} style={props.style} 
    className={"building "+props.building.type}>
    {upgraded ? UpgradedBuildingIcon[props.building.type] : BuildingIcon[props.building.type]}
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
        const hasJob = props.building.employeeBeanKeys[jobSlot] != null;
        return <span key={i} className="slot" style={props.getStyle(d)}>
            {hasJob ? BuildingJobIcon[props.building.type] : null}
        </span>
    })}</>
}