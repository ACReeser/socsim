import React from "react";
import { City, Trait, IHappinessModifier } from "./World";
import { keyToName } from "./App";
import { Bean } from "./Bean";
import { NeedReadout } from "./widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno } from "./simulation/City";
import { Economy } from "./Economy";
import { Party } from "./Politics";
import { IEvent, EventBus } from "./events/Events";
import { withinLastYear } from "./simulation/Time";
import { Government } from "./simulation/Government";

interface BeanPanelP{
    city: City,
    bean: Bean,
    economy: Economy,
    law: Government,
    party: Party,
    clearCity: () => void;
    bus: EventBus
    solicit: (bean: Bean) => boolean;
    insult: (bean: Bean) => void;
    support: (bean: Bean) => void;
}

interface BeanPanelS{
    faceOverride?: string;
}

export class BeanPanel extends React.Component<BeanPanelP, BeanPanelS> {
    constructor(props: BeanPanelP) {
        super(props);
        this.state = {
        }
    }
    solicit = () => {
        if (this.props.solicit(this.props.bean)){
            this.setState({faceOverride: '😇'});
            this._resetFace();
        }
    }
    insult = () => {
        this.props.insult(this.props.bean);
        this.setState({faceOverride: '😡'});
        this._resetFace();
    }
    support = () => {
        this.props.support(this.props.bean);
        this.setState({faceOverride: '🤩'});
        this._resetFace();
    }
    _resetFace(){
        setTimeout(() => {
            this.setState({faceOverride: undefined})
        }, 5000);
    }
    happyTable(mods: IHappinessModifier[]){
        return mods.filter((y) => y.mod != 0).map((x, i) => {
            return <tr key={i}>
                <td className="small text-right">{x.reason}</td>
                <td className="small">{Math.round(x.mod * 100)}%</td>
            </tr>
        });
    }
    render(){
        const classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
        const chance = this.props.bean.chanceToDonate(this.props.economy, true);
        const chanceText = (chance * 100).toFixed(0) + '% to gain Cash';
        const actionLimit = this.props.party.activeHQs.length + 2;
        return (                
        <div>
            <div>
                <b>{this.props.bean.name}&nbsp;
                <small>
                    of {this.props.city.name}
                </small>
                </b>
                <button type="button" className="pull-r" onClick={() => this.props.clearCity()} >❌</button>
            </div>
            <div className="bean-view">                
                <span className={classes+" bean"}>
                    {
                        this.state.faceOverride === undefined ? this.props.bean.getFace() : this.state.faceOverride
                    }
                </span>
            </div>
            <table className="width-100p"><tbody>
                <tr>
                    <td>
                        <b>Ethnicity</b> 
                    </td>
                    <td>
                        {keyToName[this.props.bean.ethnicity]}
                    </td>
                </tr>
                <tr>
                    <td colSpan={2} className="header">
                        <b>Situation</b>
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Food Security</b> 
                    </td>
                    <td>
                        {keyToName[this.props.bean.food]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Shelter</b>
                    </td>
                    <td>
                        {keyToName[this.props.bean.shelter]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Healthcare</b>
                    </td>
                    <td>
                        {keyToName[this.props.bean.health]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Money</b>
                    </td>
                    <td>
                        ${this.props.bean.cash.toFixed(2)}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Happiness</b>
                    </td>
                    <td>
                        {Math.round(this.props.bean.lastHappiness)}%
                    </td>
                </tr>
                {this.happyTable(this.props.bean.getHappinessModifiers(this.props.economy, this.props.city, this.props.law))}
                <tr>
                    <td>
                        <b>Community</b>
                    </td>
                    <td>
                        {keyToName[this.props.bean.community]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Ideal</b>
                    </td>
                    <td>
                        {keyToName[this.props.bean.ideals]}
                    </td>
                </tr>
                <tr>
                    <td colSpan={2} className="header">
                        <b>Party</b>
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Approval</b>
                    </td>
                    <td>
                        {Math.round(this.props.bean.lastPartySentiment)}%
                    </td>
                </tr>
                {this.happyTable(this.props.bean.getSentimentModifiers(this.props.economy, this.props.city, this.props.law, this.props.party).party)}
                {/* <tr>
                    <td>
                        <b>Party Loyalty</b>
                    </td>
                    <td>
                        <span>{Math.round(this.props.bean.partyLoyalty * 100)}%</span>
                    </td>
                </tr> */}
                </tbody>
            </table>
            <div className="card-parent">
                <button type="button" className="button card" onClick={this.support} disabled={!this.props.bean.canSupport()}
                    title="Rewrite one of this being's beliefs"
                >🛰️ Scan
                    <small>-Energy +Info</small>
                </button>
            </div>
            <div className="card-parent">
                <button type="button" className="button card" onClick={this.support} disabled={!this.props.bean.canSupport()}
                    title="Rewrite one of this being's beliefs"
                >😵 Brainwash
                    <small>-Psi -Sanity +Belief</small>
                </button>
            </div>
            <div className="card-parent">
                <button type="button" disabled={this.props.party.materialCapital < 1} className="button card" onClick={this.solicit} 
                    title="Increase this being's influence">
                    🧐 Empower
                    <small>-Psi +Influence</small>
                </button>
                <button type="button" className="button card" onClick={this.solicit} 
                    title="Increase this being's wealth">
                    🤑 Gift
                    <small>-Energy +Money</small>
                </button>
            </div>
            <div className="card-parent">
                <button type="button" className="button card" onClick={this.solicit} 
                    title="Drain a bit of this being's brain">
                    🤪 Siphon
                    <small>-Energy -Sanity +Psi</small>
                </button>
                <button type="button" className="button card" onClick={this.insult}
                    title="Delete this being from the experiment"
                >
                    ☠️ Disappear
                    <small>-Bots -Energy</small>
                </button>
            </div>
            <div className="card-parent">
                <button type="button" className="button card" onClick={this.insult}
                    title="Remove this being for study"
                >
                    👾 Abduct
                    <small>-Bots -Sanity +Tech</small>
                </button>
            </div>
        </div>
        )
    }
}