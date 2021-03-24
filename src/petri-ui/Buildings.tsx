import React, { useEffect, useState } from "react";
import { LiveMap } from "../events/Events";
import { City } from "../simulation/City";
import { CityBook, IBuilding } from "../simulation/Geography";
import { PetriBuilding } from "./Building";


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