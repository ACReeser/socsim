import React from "react";
import { City } from "../simulation/City";
import { BuildingIcon, BuildingTypes, HexPoint, IBuilding } from "../simulation/Geography";

export class HexPanel extends React.Component<{
    city: City,
    hex: HexPoint,
    clearHex: () => void
}, {

}> {
    emptyPanel(){
        return <div>
            <div>
                <strong>Empty Lot</strong> in <strong>{this.props.city.name}</strong>
                <button type="button" className="pull-r" onClick={() => this.props.clearHex()} >❌</button>
            </div>
            <h3>Build:</h3>
            <div className="card-parent">
                <button className="card button" type="button">
                    {BuildingIcon['house']} House
                    <small>-3 Energy -3 Bots</small>
                </button>
                <button className="card button" type="button">
                    {BuildingIcon['farm']} Farm
                    <small>-3 Energy -3 Bots</small>
                </button>
            </div>
            <div className="card-parent">
                <button className="card button" type="button">
                    {BuildingIcon['hospital']} Hospital
                    <small>-4 Energy -4 Bots</small>
                </button>
                <button className="card button" type="button">
                    {BuildingIcon['theater']} Theater
                    <small>-4 Energy -4 Bots</small>
                </button>
            </div>
            <h3>Beings:</h3>
            <div className="card-parent">
                <button className="card button" type="button">
                    🛸 Kidnap New Subject
                    <small>-4 Energy</small>
                </button>
            </div>
        </div>

    }
    buildingPanel(b: IBuilding){
        return <div>

        </div>
    }
    render(){
        const building: IBuilding|undefined = this.props.city.lookupBuilding(this.props.hex);
        if (building){
            return this.buildingPanel(building)
        } else {
            return this.emptyPanel();
        }
    }

}