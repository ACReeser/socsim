import React from "react";
import { City, Trait } from "./World";
import { keyToName } from "./App";
import { Bean } from "./Bean";
import { NeedReadout } from "./widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno } from "./simulation/City";
import { Economy } from "./Economy";
import { Party } from "./Politics";

interface BeanPanelP{
    city: City,
    bean: Bean,
    economy: Economy,
    party: Party,
    clearCity: () => void;
}

export class BeanPanel extends React.Component<BeanPanelP> {
    constructor(props: BeanPanelP) {
        super(props);
        this.state = {
        }
    }
    solicit(){

    }
    insult(){

    }
    support(){

    }
    render(){
        const classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
        const chanceText = (this.props.bean.chanceToDonate(this.props.economy) * 100).toFixed(0) + '% to gain Physical Capital';
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
                    {this.props.bean.getFace()}
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
                        {Math.round(this.props.bean.lastHappiness * 100)}%
                    </td>
                </tr>
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
                        {Math.round(this.props.bean.lastSentiment * 100)}%
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Party Loyalty</b>
                    </td>
                    <td>
                        <span>{Math.round(this.props.bean.partyLoyalty * 100)}%</span>
                    </td>
                </tr></tbody>
            </table>
            <div className="text-center">
                <button type="button" className="important" title={chanceText}>🤲 Solicit Donation</button>
            </div>
            <div className="text-center">
                <button type="button" className="callout" title="Decrease this bean's party approval to gain Political Capital">😈 Publically Insult</button>
                <button type="button" className="callout" title="Spend Political Capital to increase this bean's party approval">🤩 Publically Support</button>
            </div>
        </div>
        )
    }
}