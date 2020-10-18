
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, Geography, transformMatter } from "../simulation/Geography";
import './Building.css';

export class PetriBuilding extends React.Component<{
    geo: Geography,
    building: IBuilding
}> {

    render() {
        return <div key={this.props.building.type+this.props.building.key} style={transformMatter(this.props.geo, this.props.building.type, this.props.building.key)} 
        className={"building "+this.props.building.type}>
        {BuildingIcon[this.props.building.type]}
        {/* {[1,2,3,4,5,6].map((i) => <span className={"spot s"+i}></span>)} */}
        </div>
    }
}