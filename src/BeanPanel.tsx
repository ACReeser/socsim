import React from "react";
import { City, Trait } from "./World";
import { keyToName } from "./App";
import { Bean } from "./Bean";
import { NeedReadout } from "./widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno } from "./simulation/City";

interface BeanPanelP{
    city: City,
    bean: Bean,
    clearCity: () => void;
}

export class BeanPanel extends React.Component<BeanPanelP> {
    constructor(props: BeanPanelP) {
        super(props);
        this.state = {
        }
    }
    render(){
        return (                
        <div>
            <div>
                <b>Citizen of {this.props.city.name}</b>
                <button type="button" className="pull-r" onClick={() => this.props.clearCity()} >❌</button>
            </div>
            <table>
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
                </tr>
            </table>
        </div>
        )
    }
}