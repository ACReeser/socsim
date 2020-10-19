
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, Geography, getBuildingTransform, hex_directions, transformPoint, hex_to_pixel, origin_point } from "../simulation/Geography";
import './Building.css';

const slot_size = {
    x: 25,
    y: 25
}

export class PetriBuilding extends React.Component<{
    geo: Geography,
    building: IBuilding
}> {
    slots() {
        return hex_directions.map((d, i) => {
            return <span key={i} className="slot" style={transformPoint(hex_to_pixel(slot_size, origin_point, d))}>

            </span>
        });
    }
    render() {
        return <div key={this.props.building.type+this.props.building.key} style={getBuildingTransform(this.props.geo, this.props.building.type, this.props.building.key)} 
        className={"building "+this.props.building.type}>
        {BuildingIcon[this.props.building.type]}
        {this.slots()}
        </div>
    }
}