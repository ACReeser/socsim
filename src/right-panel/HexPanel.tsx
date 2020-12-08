import React from "react";
import { keyToName } from "../App";
import { IDifficulty } from "../Game";
import { City } from "../simulation/City";
import { BuildingIcon, BuildingTypes, HexPoint, IBuilding } from "../simulation/Geography";
import { CostSmall } from "../widgets/CostSmall";

export class HexPanel extends React.Component<{
    city: City,
    hex: HexPoint,
    difficulty: IDifficulty,
    clearHex: () => void,
    build: (where: HexPoint, what: BuildingTypes) => void,
    beam: (where: HexPoint) => void,
}, {

}> {
    emptyPanel(){
        const eHex = this.props.difficulty.cost.emptyHex;
        return <div>
            <div>
                <strong>Empty Lot</strong> in <strong>{this.props.city.name}</strong>
                <button type="button" className="pull-r" onClick={() => this.props.clearHex()} >❌</button>
            </div>
            <h3>Build:</h3>
            <div className="card-parent">
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'house')}>
                    {BuildingIcon['house']} House
                    <CostSmall cost={eHex.build.house}></CostSmall>
                </button>
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'farm')}>
                    {BuildingIcon['farm']} Farm
                    <CostSmall cost={eHex.build.farm}></CostSmall>
                </button>
            </div>
            <div className="card-parent">
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'hospital')}>
                    {BuildingIcon['hospital']} Hospital
                    <CostSmall cost={eHex.build.hospital}></CostSmall>
                </button>
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'theater')}>
                    {BuildingIcon['theater']} Theater
                    <CostSmall cost={eHex.build.theater}></CostSmall>
                </button>
            </div>
            <h3>Beings:</h3>
            <div className="card-parent">
                <button className="card button" type="button" onClick={() => this.props.beam(this.props.hex)}>
                    🛸 Beam In New Subject
                    <CostSmall cost={this.props.difficulty.cost.hex.beam}></CostSmall>
                </button>
            </div>
        </div>

    }
    buildingPanel(b: IBuilding){
        return <div>
            <strong>{keyToName[b.type]}</strong> in <strong>{this.props.city.name}</strong>
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