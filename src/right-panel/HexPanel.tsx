import React from "react";
import { keyToName } from "../App";
import { Subtabs } from "../chrome/Subtab";
import { IDifficulty } from "../Game";
import { City } from "../simulation/City";
import { BuildingIcon, BuildingJobIcon, BuildingTypes, HexPoint, IBuilding } from "../simulation/Geography";
import { EnterpriseType, EnterpriseTypeIcon, EnterpriseTypes, isEnterprise } from "../simulation/Institutions";
import { CostSmall } from "../widgets/CostSmall";

export class HexPanel extends React.Component<{
    city: City,
    hex: HexPoint,
    difficulty: IDifficulty,
    clearHex: () => void,
    build: (where: HexPoint, what: BuildingTypes) => void,
    beam: (where: HexPoint) => void,
    upgrade: (what: IBuilding) => void,
    changeEnterprise: (what: IBuilding) => void,
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
            <CostSmall cost={this.props.difficulty.cost.hex.beam} rider="+Subject"></CostSmall>
        </button>
    </div>
    }
    buildingPanel(b: IBuilding){
        const slots = b.usedSlots();
        const free = b.openSlots();
        const hasJobs = b.type != 'park' && b.type != 'nature';
        return <div>
            <strong>{b.upgraded && hasJobs ? 'Dense ': 'Small '}{keyToName[b.type]}</strong> in <strong>{this.props.city.name}</strong>
            <button type="button" className="pull-r" onClick={() => this.props.clearHex()}>❌</button>
        {
            b.upgraded && hasJobs ? <div>
                {this.renderDensityWarning(b.type)}
            </div> : null
        }
        {
            <EnterpriseTypePicker building={b} changeEnterprise={this.props.changeEnterprise}></EnterpriseTypePicker>
        }
        {
            (slots.length === 0) ? null : <div>
                <strong>Workers:</strong>
                {
                    slots.map((x) => {
                        return {
                            key: x,
                            bean: this.props.city.beans.get.find((y) => y.key === b.job_slots[x])
                        }
                    }).map((x) => <div key={x.key}>
                        {BuildingJobIcon[b.type]} {x.bean?.name} {isEnterprise(b) && x.bean?.key === b.ownerBeanKey ? '🎩' : ''}
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
                {this.renderDensityWarning(b.type)}
            </div>
        }
        {this.renderBeamButton()}
        </div>
    }
    renderDensityWarning(typ: BuildingTypes){
        if (typ === 'house')
        return <>
            <div className="text-center">
            <small>
            🐮 Parochial subjects may emit 👎<br/>when living in dense buildings
            </small>
        </div> 
        <div className="text-center">
            <small>
            🍸 Cosmopolitan subjects may emit 👎<br/>when living in small buildings
            </small>
        </div>
        </>;
        else return <div>

        </div>
    }
    renderJobs(){

    }
    render(){
        const building: IBuilding|undefined = this.props.city.book.findBuildingByCoordinate(this.props.hex);
        if (building){
            return this.buildingPanel(building)
        } else {
            return this.emptyPanel();
        }
    }
}

export const EnterpriseTypePicker: React.FC<{
    building: IBuilding,
    changeEnterprise: (what: IBuilding) => void,
}> = (props) => {
    const b = props.building;
    if (isEnterprise(b)){
        const options = EnterpriseTypes.map((x) => {
            return {
                icon: EnterpriseTypeIcon[x],
                text: x[0].toUpperCase()+x.substring(1),
                value: x,
                onClick: () => {
                    b.enterpriseType = x;
                    props.changeEnterprise(b);
                }
            }
        })
        return <Subtabs active={b.enterpriseType} options={options}></Subtabs>
    } else {
        return null
    }
}