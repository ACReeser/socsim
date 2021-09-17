import React, { useEffect, useState } from "react";
import { ICity } from "../simulation/City";
import { CityBook, HexPoint, hex_to_pixel, IBuilding, Point, transformPoint } from "../simulation/Geography";
import { doSelectBuilding, doSelectHex } from "../state/features/selected.reducer";
import { magnetChange, selectBuildingsByCity, selectCity, selectCityBuildingByHex } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { PetriBuilding, UIBuilding } from "./Building";
import { hex_style } from "./WorldTile";

/**
 * redux building selector
 * @param props 
 * @returns 
 */
export const HexPetriBuilding2: React.FC<{
    cityKey: number,
    hex: HexPoint
}> = (props) => {
    const building = useAppSelector(state => selectCityBuildingByHex(state.world, props.cityKey, `${props.hex.q},${props.hex.r}`));
    const city = useAppSelector(state => selectCity(state.world, props.cityKey));
    if (building)
        return <PetriBuilding city={city} building={building}></PetriBuilding>
    else return null;
}

export const PetriHex: React.FC<{
    cityKey: number,
    buildingKey: number|undefined,
    hex: HexPoint,
    hexString: string,
    xy: Point,
    i: number
}> = (props) => {
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => state.selected.selectedHexKey === props.hexString);
    const extraClasses = selected ? 'hex-selected' : ''; 
    return <div className={"hex "+extraClasses}
        key={props.i}
        style={{ ...hex_style, ...transformPoint(props.xy) }}
        onMouseEnter={(e) => { dispatch(magnetChange({cityKey: props.cityKey, px: props.xy})) }}
        onClick={(e) => {
            if (props.buildingKey != null)
                dispatch(doSelectBuilding({cityKey: props.cityKey, buildingKey: props.buildingKey, hex: props.hex}));
            else 
                dispatch(doSelectHex({cityKey: props.cityKey, hex: props.hex})); 
            e.stopPropagation(); 
            return false; }}>
            {props.children}
    </div>

}

export const PetriHexes2: React.FC<{
    cityKey: number
}> = (props) => {
    const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
    const hexes = useAppSelector(state => state.world.cities.byID[props.cityKey]?.hexes);
    return <>{hexes.map((hex, i) => {
        const xy = hex_to_pixel(city.hex_size, city.petriOrigin, hex);
        const hexStr = hex.q+','+hex.r;
        const buildingKey: number|undefined = city.buildingMap[hexStr];
        return <PetriHex i={i} hex={hex} xy={xy} hexString={hexStr} cityKey={props.cityKey} buildingKey={buildingKey} key={hexStr}>
            <HexPetriBuilding2 cityKey={props.cityKey} hex={hex}></HexPetriBuilding2>
        </PetriHex>
    })}</>
}
export const SocialBuildings: React.FC<{
    city: ICity,
    onClickBuilding: (b: IBuilding) => void;
}> = (props) => {
    const buildings = useAppSelector(state => selectBuildingsByCity(state.world, props.city.key));
    return <>
        {
            buildings.map((x) => <div key={x.key} className="building-node" onClick={() => props.onClickBuilding(x)}>
                <UIBuilding cityName={props.city.name} building={x} style={{}} getStyle={() => {return{}}}></UIBuilding>
            </div> )
        }
    </>
}