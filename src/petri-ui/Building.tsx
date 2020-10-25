
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, Geography, getBuildingTransform, hex_directions, transformPoint, hex_to_pixel, origin_point, HexPoint } from "../simulation/Geography";
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

export class PetriBuilding extends React.Component<{
    city: Geography,
    building: IBuilding
}> {
    slots() {
        return hex_directions.map((d, i) => {
            return <span key={i} className="slot" style={transformPoint(getSlotOffset(d))}>

            </span>
        });
    }
    render() {
        return <div key={this.props.building.type+this.props.building.key} style={getBuildingTransform(this.props.city, this.props.building.type, this.props.building.key)} 
        className={"building "+this.props.building.type}>
        {BuildingIcon[this.props.building.type]}
        {this.slots()}
        </div>
    }
}