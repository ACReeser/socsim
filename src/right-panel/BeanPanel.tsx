import React from "react";
import { IHappinessModifier } from "../World";
import { keyToName } from "../App";
import { Bean } from "../simulation/Bean";
import { NeedReadout } from "../widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno, City } from "../simulation/City";
import { Economy } from "../simulation/Economy";
import { Party } from "../simulation/Politics";
import { IEvent, EventBus } from "../events/Events";
import { withinLastYear } from "../simulation/Time";
import { Government } from "../simulation/Government";
import { Player } from "../simulation/Player";
import { CardButton, TraitToCard } from "../widgets/CardButton";

import './BeanPanel.css';
import { ActivityIcon, GetPriorities } from "../simulation/Agent";

interface BeanPanelP{
    city: City,
    bean: Bean,
    economy: Economy,
    law: Government,
    party: Party,
    alien: Player,
    clearCity: () => void;
    bus: EventBus
    scan: (bean: Bean) => boolean;
    insult: (bean: Bean) => void;
    support: (bean: Bean) => void;
    brainwash: () => void;
}

interface BeanPanelS{
    faceOverride?: string;
    innerView: 'priorities'|'feelings'|'beliefs';
}

export class BeanPanel extends React.Component<BeanPanelP, BeanPanelS> {
    constructor(props: BeanPanelP) {
        super(props);
        this.state = {
            innerView: 'feelings'
        }
    }
    scan = () => {
        if (this.props.scan(this.props.bean)){
            this.setState({faceOverride: '🤨'});
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
    renderInner(){
        if (!this.scanned){
            return <div className="width-100p text-center">
                <small>
                    Subject need a Scan to reveal their thoughts
                </small>
            </div>
        }
        switch(this.state.innerView){
            case 'feelings':
                return <table className="width-100p"><tbody>
                    {this.scanned ? this.happyTable(this.props.bean.getHappinessModifiers(this.props.economy, this.props.city, this.props.law)) : null}
                    {/* {this.scanned ? this.happyTable(this.props.bean.getSentimentModifiers(this.props.economy, this.props.city, this.props.law, this.props.party).party) : null} */}

                    </tbody>
                </table>
            case 'priorities':
                return <table className="width-100p">
                    <tbody>
                        {
                            GetPriorities(this.props.bean, this.props.alien.difficulty).values.map((x) => {
                                return <div>
                                    {x.priority.toFixed(1)} {ActivityIcon(x.value)}
                                </div>
                            })
                        }
                    </tbody>
                </table>
        }
    }
    get scanned(){
        return this.props.alien.scanned_bean[this.props.bean.key];
    }
    renderTraits(){
        if (this.scanned){
            return <div>
                <div className="card-parent">
                    {TraitToCard(this.props.bean, this.props.bean.ethnicity, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.sanity, undefined)}
                </div>
                <div className="card-parent">
                    {TraitToCard(this.props.bean, this.props.bean.ideals, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.community, undefined)}
                </div>
                <div className="card-parent">
                    {TraitToCard(this.props.bean, this.props.bean.food, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.shelter, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.health, undefined)}
                </div>
            </div>
        } else {
            return <div className="card-parent">
                <CardButton icon="🛰️" name="Scan" subtext="-Energy +Info" onClick={this.scan}></CardButton>
            </div>
        }
    }
    render(){
        const classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
        const chance = this.props.bean.chanceToDonate(this.props.economy, true);
        return (                
        <div className="vertical bean-panel">
            <div className="bean-panel-header">
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
                <div className="horizontal">
                    <span className="text-center">
                        💰 ${this.props.bean.cash.toFixed(2)}
                    </span>
                    <span className="text-center">
                        🙂 {Math.round(this.props.bean.lastHappiness)}%
                    </span>
                    <span className="text-center">
                        👍 {Math.round(this.props.bean.lastPartySentiment)}%
                    </span>
                </div>
                {this.renderTraits()}
            </div>
            <div className="grow-1 pad-4">
                <div className="cylinder blue-orange horizontal">
                    <button type="button" className={this.state.innerView=='priorities'?'active':''} onClick={()=>this.setState({innerView:'priorities'})}>
                        💪 Priorities
                    </button>
                    <button type="button" className={this.state.innerView=='feelings'?'active':''} onClick={()=>this.setState({innerView:'feelings'})}>
                        😐 Feelings
                    </button>
                    <button type="button" className={this.state.innerView=='beliefs'?'active':''} onClick={()=>this.setState({innerView:'beliefs'})}>
                        😇 Beliefs
                    </button>
                </div>
                {this.renderInner()}
            </div>
            <div className="bean-action-card-parent">
                <div className="card-parent">
                    <button type="button" className="button card" onClick={() => this.props.brainwash()} disabled={!this.props.bean.canSupport()}
                        title="Rewrite one of this being's beliefs"
                    >😵 Brainwash
                        <small>-Psi -Sanity +Belief</small>
                    </button>
                </div>
                <div className="card-parent">
                    <button type="button" disabled={this.props.party.materialCapital < 1} className="button card" onClick={this.scan} 
                        title="Increase this being's influence">
                        🧐 Empower
                        <small>-Psi +Influence</small>
                    </button>
                    <button type="button" className="button card" onClick={this.scan} 
                        title="Increase this being's wealth">
                        🤑 Gift
                        <small>-Energy +Money</small>
                    </button>
                </div>
                <div className="card-parent">
                    <button type="button" className="button card" onClick={this.scan} 
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
                        👾 Abduct for Research
                        <small>-Bots -Sanity +Tech</small>
                    </button>
                </div>
            </div>
        </div>
        )
    }
}