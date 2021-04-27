import React, { useEffect, useState } from "react";
import { LiveMap } from "../events/Events";
import { City } from "../simulation/City";
import { CityBook, HexPoint, hex_to_pixel, IBuilding, transformPoint } from "../simulation/Geography";
import { magnetChange, selectHex } from "../state/features/world";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { PetriBuilding, UIBuilding } from "./Building";
import { hex_style } from "./WorldTile";


export const PetriBuildings: React.FC<{
    city: City
}> = (props) => {
    const [buildings, setBuildings] = useState<IBuilding[]>(props.city.book.getBuildings());
    const getBuildings = () => {
        setBuildings(props.city.book.getBuildings())
    }
    useEffect(() => {
        props.city.book.db.onChange.subscribe(getBuildings);
        return () => props.city.book.db.onChange.unsubscribe(getBuildings);
    });
    return <>
        {
            buildings.map((x) => <PetriBuilding city={props.city} key={x.key} building={x}></PetriBuilding>)
        }
    </>
}
export const HexPetriBuilding: React.FC<{
    city: City,
    hex: HexPoint
}> = (props) => {
    const [building, setBuilding] = useState<IBuilding|undefined>(props.city.book.findBuildingByCoordinate(props.hex));
    const getBuildings= () => {
        setBuilding(props.city.book.findBuildingByCoordinate(props.hex))
    }
    useEffect(() => {
        props.city.book.db.onChange.subscribe(getBuildings);
        return () => props.city.book.db.onChange.unsubscribe(getBuildings);
    });
    if (building)
        return <PetriBuilding city={props.city} key={building.key} building={building}></PetriBuilding>
    else 
        return null;
}

export const PetriHexes: React.FC<{
    city: City,
    hexes: HexPoint[],
    onHexClick: (hex: HexPoint) => void
}> = (props) => {
    return <>{props.hexes.map((hex, i) => {
      const xy = hex_to_pixel(props.city.hex_size, props.city.petriOrigin, hex);
      return <div className="hex" 
        key={i} 
        style={{...hex_style, ...transformPoint(xy)}} 
        onMouseEnter={(e) => { props.city.pickupMagnetPoint.set(xy); }}
        onClick={(e) => { props.onHexClick(hex); e.stopPropagation(); return false; }}>
          <HexPetriBuilding city={props.city} hex={hex}></HexPetriBuilding>
      </div>
    })}</>
  }
export const PetriHexes2: React.FC<{
    cityKey: number
}> = (props) => {
    const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
    const hexes = useAppSelector(state => state.world.cities.byID[props.cityKey]?.hexes);
    const dispatch = useAppDispatch();
    return <>{hexes.map((hex, i) => {
        const xy = hex_to_pixel(city.hex_size, city.petriOrigin, hex);
        return <div className="hex"
            key={i}
            style={{ ...hex_style, ...transformPoint(xy) }}
            onMouseEnter={(e) => { dispatch(magnetChange({cityKey: props.cityKey, px: xy})) }}
            onClick={(e) => { dispatch(selectHex({cityKey: props.cityKey, hex: hex})); e.stopPropagation(); return false; }}>
            {/* <HexPetriBuilding cityKey={props.cityKey} hex={hex}></HexPetriBuilding> */}
        </div>
    })}</>
}
export const SocialBuildings: React.FC<{
    city: City,
    onClickBuilding: (b: IBuilding) => void;
}> = (props) => {
    const [buildings, setBuildings] = useState<IBuilding[]>(props.city.book.getBuildings());
    const getBuildings = () => {
        setBuildings(props.city.book.getBuildings())
    }
    useEffect(() => {
        props.city.book.db.onChange.subscribe(getBuildings);
        return () => props.city.book.db.onChange.unsubscribe(getBuildings);
    });
    return <>
        {
            buildings.map((x) => <div key={x.key} className="building-node" onClick={() => props.onClickBuilding(x)}>
                <UIBuilding cityName={props.city.name} building={x} style={{}} getStyle={() => {return{}}}></UIBuilding>
            </div> )
        }
    </>
}