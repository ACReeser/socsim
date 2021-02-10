import React from "react";
import { keyToName } from "../App";
import { IDifficulty } from "../Game";
import { City } from "../simulation/City";
import { BuildingIcon, BuildingJobIcon, BuildingTypes, HexPoint, IBuilding } from "../simulation/Geography";
import { CostSmall } from "../widgets/CostSmall";

export class HexPanel extends React.Component<{
    city: City,
    hex: HexPoint,
    difficulty: IDifficulty,
    clearHex: () => void,
    build: (where: HexPoint, what: BuildingTypes) => void,
    beam: (where: HexPoint) => void,
    upgrade: (what: IBuilding) => void,
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
            </div>
            <div className="card-parent">
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'farm')}>
                    {BuildingIcon['farm']} Farm
                    <CostSmall cost={eHex.build.farm}></CostSmall>
                </button>
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'hospital')}>
                    {BuildingIcon['hospital']} Hospital
                    <CostSmall cost={eHex.build.hospital}></CostSmall>
                </button>
            </div>
            <div className="card-parent">
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'theater')}>
                    {BuildingIcon['theater']} Theater
                    <CostSmall cost={eHex.build.theater}></CostSmall>
                </button>
                <button className="card button" type="button" onClick={() => this.props.build(this.props.hex, 'park')}>
                    {BuildingIcon['park']} Park
                    <CostSmall cost={eHex.build.park}></CostSmall>
                </button>
            </div>
            <h3>Beings:</h3>
            {this.renderBeamButton()}
        </div>

    }
    renderBeamButton(){
        return <div className="card-parent">
        <button className="card button" type="button" onClick={() => this.props.beam(this.props.hex)}>
            🛸 Beam In New Subject
            <CostSmall cost={this.props.difficulty.cost.hex.beam}></CostSmall>
        </button>
    </div>
    }
    buildingPanel(b: IBuilding){
        const slots = b.usedSlots();
        const free = b.openSlots();
        const hasJobs = b.type != 'park' && b.type != 'nature';
        return <div>
            <strong>{b.upgraded && hasJobs ? 'Upgraded ':null}{keyToName[b.type]}</strong> in <strong>{this.props.city.name}</strong>
        {
            b.upgraded && hasJobs ? <div>
                {this.renderDensityWarning()}
            </div> : null
        }
        {
            (slots.length === 0) ? null : <div>
                <strong>Workers:</strong>
                {
                    slots.map((x) => <div>
                        {BuildingJobIcon[b.type]} {this.props.city.beans.find((y) => y.key === b.job_slots[x])?.name}
                    </div>)
                }
            </div>
        }
        {
            !hasJobs ? null : <div>
                This {keyToName[b.type]} can support {free.length} more jobs.
                {
                    b.upgraded ? null : <span><br/>Upgrade it to add 3 more job slots.</span>
                }
            </div>
        }
        {
            b.upgraded || !hasJobs ? null : <div><div className="card-parent">
                    <button className="card button" type="button" onClick={() => this.props.upgrade(b)}>
                        🛠️ Upgrade
                        <CostSmall cost={this.props.difficulty.cost.hex.upgrade}></CostSmall>
                    </button>
                </div>
                {this.renderDensityWarning()}
            </div>
        }
        {this.renderBeamButton()}
        </div>
    }
    renderDensityWarning(){
        return <div className="text-center">
            <small>
                🦅 Independent subjects lose 🙂<br/>working in upgraded buildings
            </small>
        </div>;
    }
    renderJobs(){

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