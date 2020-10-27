import React from "react";
import { City } from "../simulation/City";
import { BuildingTypes, HexPoint, IBuilding } from "../simulation/Geography";

export class HexPanel extends React.Component<{
    city: City,
    hex: HexPoint
}, {

}> {
    emptyPanel(){
        return <div>
            <div>
                <strong>Empty Lot</strong> in <strong>{this.props.city.name}</strong>
            </div>
        </div>

    }
    buildingPanel(b: IBuilding){
        return <div>

        </div>
    }
    render(){
        const building: IBuilding|null = this.props.city.lookupBuilding(this.props.hex);
        if (building){
            return this.buildingPanel(building)
        } else {
            return this.emptyPanel();
        }
    }

}