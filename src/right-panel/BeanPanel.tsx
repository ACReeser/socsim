import React from "react";
import { EmoteIcon, IHappinessModifier, TraitIcon } from "../World";
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
import { Act, ActivityIcon, GetPriorities } from "../simulation/Agent";
import { IsBeliefDivergent, SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { CostSmall } from "../widgets/CostSmall";

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
    vaporize: (bean: Bean) => void;
    abduct: (bean: Bean) => void;
    brainwash: () => void;
    gift: () => void;
}

interface BeanPanelS{
    faceOverride?: string;
    innerView: 'priorities'|'feelings'|'beliefs';
}

export class BeanPanel extends React.Component<BeanPanelP, BeanPanelS> {
    constructor(props: BeanPanelP) {
        super(props);
        this.state = {
            innerView: 'beliefs'
        }
    }
    scan = () => {
        if (this.props.scan(this.props.bean)){
            this.setState({faceOverride: '🤨'});
            this._resetFace();
        }
    }
    vaporize = () => {
        this.props.vaporize(this.props.bean);
        this.setState({faceOverride: '💀'});
        this._resetFace();
    }
    support = () => {
        this.setState({faceOverride: '🤩'});
        this._resetFace();
    }
    abduct = () => {
        this.props.abduct(this.props.bean);
        this.setState({faceOverride: '😨'});
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
    hedonTable(){
        return Object.keys(this.props.bean.happiness.all).filter(
            (k) => k != this.props.bean.happiness.maxSource && k != this.props.bean.happiness.minSource
            ).map((x, i) => {
            return <tr key={i}>
                <td className="small text-right">{this.props.bean.happiness.all[x]} {this.props.bean.happiness.all[x] >= 0 ? EmoteIcon['happiness'] : EmoteIcon['unhappiness']} from </td>
                <td className="small">{x}</td>
            </tr>
        });
    }
    renderInner(){
        if (!this.scanned){
            return <div className="width-100p text-center">
                <small>
                    Subject needs a Scan to reveal their thoughts
                </small>
            </div>
        }
        switch(this.state.innerView){
            case 'beliefs':
                return this.scanned ? this.beliefTable(this.props.bean.beliefs) : null
            case 'feelings':
                return <table className="width-100p"><tbody>
                    {
                        this.props.bean.happiness.maxSource.length > 0 ?  <tr>
                            <td colSpan={2}>
                                {this.props.bean.happiness.all[this.props.bean.happiness.maxSource]} {EmoteIcon['happiness']} from {this.props.bean.happiness.maxSource}
                            </td>
                        </tr> : null
                    }
                    {
                        this.props.bean.happiness.minSource.length > 0 ?  
                        <tr>
                            <td colSpan={2}>
                                {this.props.bean.happiness.all[this.props.bean.happiness.minSource]} {EmoteIcon['unhappiness']} from {this.props.bean.happiness.minSource}
                            </td>
                        </tr> : null
                    }
                    {this.scanned ? this.hedonTable() : null}
                    </tbody>
                </table>
            case 'priorities':
                return <table className="width-100p">
                    <tbody>
                        <tr>
                            <td>
                                Currently {this.props.bean.state.display}
                            </td>
                        </tr>
                        {
                            GetPriorities(this.props.bean, this.props.alien.difficulty).values.map((x) => {
                                return <tr key={`p-${x.value.act}-${x.value.good}`}>
                                    <td>
                                    {x.priority.toFixed(1)} {ActivityIcon(x.value)}
                                    </td>
                                </tr>
                            })
                        }
                        {
                            this.actDurations().filter((x) => this.props.bean.activity_duration[x] > 0).map((x) => {
                                const act = x as Act;
                                return <tr key={act}>
                                    <td>{x}</td>
                                    <td>
                                        {
                                            (this.props.bean.activity_duration[act] / 1000).toFixed(1)
                                        }s
                                    </td>
                                </tr>
                                
                            })
                        }
                    </tbody>
                </table>
        }
    }
    actDurations(){
        const acts = Object.keys(this.props.bean.activity_duration).map((x) => x as Act);
        acts.sort((a, b) => this.props.bean.activity_duration[b] - this.props.bean.activity_duration[a]);
        return acts;
    }
    beliefTable(beliefs: TraitBelief[]): React.ReactNode {
        return beliefs.map((b, i) => {
            const classes = 'belief-name text-left '+SecondaryBeliefData[b].rarity;
            return <table className="width-100p" key={b+i}><tbody><tr>
            <th className={classes}>
                {SecondaryBeliefData[b].icon} {SecondaryBeliefData[b].adj}
            </th>
            <td className="text-right">
                {(SecondaryBeliefData[b].idealPro || []).map(y => <span key={y}>+{TraitIcon[y]}</span>)}
                {(SecondaryBeliefData[b].idealCon || []).map(y => <span key={y}>-{TraitIcon[y]}</span>)}
            </td>
        </tr><tr><td className="small text-center" colSpan={2}>{
            SecondaryBeliefData[b].description ? SecondaryBeliefData[b].description?.split(';').map((x, i) => <div key={i}>{x}</div>) : null
        }</td></tr></tbody></table>});
    }
    get scanned(){
        return this.props.alien.scanned_bean[this.props.bean.key];
    }
    renderTraits(){
        if (this.scanned){
            const brainwash = this.props.brainwash.bind(this);
            return <div>
                <div className="card-parent">
                    {TraitToCard(this.props.bean, this.props.bean.ethnicity, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.faith, brainwash)}
                </div>
                <div className="card-parent">
                    {TraitToCard(this.props.bean, this.props.bean.ideals, brainwash)}
                    {TraitToCard(this.props.bean, this.props.bean.community, brainwash)}
                </div>
                <div className="card-parent">
                    {TraitToCard(this.props.bean, this.props.bean.food, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.stamina, undefined)}
                    {TraitToCard(this.props.bean, this.props.bean.health, undefined)}
                </div>
            </div>
        } else {
            return <div className="card-parent">
                <CardButton icon="🛰️" name="Scan" subtext="-Energy +Info" onClick={this.scan} disabled={!this.props.alien.canAfford(this.props.alien.difficulty.cost.bean.scan)}></CardButton>
            </div>
        }
    }
    render(){
        const classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
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
                        {Math.round(this.props.bean.happiness.flatAverage)} {EmoteIcon['happiness']} /day
                    </span>
                </div>
                {this.renderTraits()}
            </div>
            <div className="grow-1 pad-4">
                <div className="cylinder blue-orange horizontal">
                    <button type="button" className={this.state.innerView=='beliefs'?'active':''} onClick={()=>this.setState({innerView:'beliefs'})}>
                        😇 Traits
                    </button>
                    <button type="button" className={this.state.innerView=='feelings'?'active':''} onClick={()=>this.setState({innerView:'feelings'})}>
                        😐 Feelings
                    </button>
                    <button type="button" className={this.state.innerView=='priorities'?'active':''} onClick={()=>this.setState({innerView:'priorities'})}>
                        💪 Priorities
                    </button>
                </div>
                {this.renderInner()}
            </div>
            <div className="bean-action-card-parent">
                <div className="card-parent">
                    <button type="button" className="button card" onClick={() => this.props.brainwash()}
                        title="Rewrite one of this being's traits"
                    >😵 Brainwash
                        <small>-Sanity +-Trait</small>
                    </button>
                </div>
                <div className="card-parent">
                    <button type="button" className="button card"  onClick={() => this.props.brainwash()}  disabled={true}
                        title="Give this being food or meds or cash">
                        🎁 Gift
                        <small>-Energy +Things</small>
                    </button>
                </div>
                <div className="card-parent">
                    <button type="button" className="button card" onClick={this.scan} disabled={true}
                        title="Steal a bit of this being's mind">
                        🤪 Braindrain
                        <small>-Energy -Sanity</small>
                    </button>
                    <button type="button" className="button card" onClick={this.vaporize}
                        disabled={!this.props.alien.canAfford(this.props.alien.difficulty.cost.bean.vaporize)}
                        title="Delete this being from the experiment"
                    >
                        ☠️ Vaporize
                        <CostSmall cost={this.props.alien.difficulty.cost.bean.vaporize}></CostSmall>
                    </button>
                </div>
                <div className="card-parent">
                    <button type="button" className="button card"
                        disabled={!this.props.alien.canAfford(this.props.alien.difficulty.cost.bean.abduct)}
                        onClick={() => this.abduct()}
                        title="Remove this being for study"
                    >
                        👾 Abduct for Research
                        <CostSmall cost={this.props.alien.difficulty.cost.bean.abduct} rider="+Tech"></CostSmall>
                    </button>
                </div>
            </div>
        </div>
        )
    }
}