import React from "react";
import { Trait } from "../World";
import { keyToName } from "../App";
import { Bean } from "../simulation/Bean";
import { NeedReadout } from "../widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno, City } from "../simulation/City";
import { Party } from "../simulation/Politics";
import { PrimaryBeliefData } from "../simulation/Beliefs";
import { LiveList } from "../events/Events";

interface OverviewPanelP {
    city?: City,
    beans: LiveList<Bean>,
    utopia: Party,
    clearCity: () => void;
}

export class OverviewPanel extends React.Component<OverviewPanelP> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render() {
        let header = <div>
            Human Emotion Farm
            <div>
                <small>Part of the 🌌 Galactic Xenosensation Federation</small>
            </div>
        </div>;
        if (this.props.city) {
            header = <div>
                <div>
                    <b>{this.props.city.name}</b>
                    <button type="button" className="pull-r" onClick={() => this.props.clearCity()} >❌</button>
                </div>
            </div>;
        }
        const avg_happy = this.props.beans.get.reduce((sum, x) => sum + x.lastHappiness, 0) / (this.props.beans.get.length || 1);
        const avg_cash = this.props.beans.get.reduce((sum, x) => sum + x.cash, 0) / (this.props.beans.get.length || 1);
        const avg_approval = this.props.beans.get.reduce((sum, x) => sum + x.lastPartySentiment, 0) / (this.props.beans.get.length || 1);
        return (
            <div>
                {header}
                <div className="header"><b>Demographics</b></div>
                <div>
                    <b>Population</b>&nbsp;
                <span>{this.props.beans.get.length}</span>
                </div>
                <AxisReadout report={reportEthno(this.props.beans.get)}>Ethnicity</AxisReadout>
                <div className="header"><b>Situation</b></div>
                <NeedReadout beans={this.props.beans.get} need={(b) => b.food} dire="starving" abundant="stuffed">Food Security</NeedReadout>
                <NeedReadout beans={this.props.beans.get} need={(b) => b.stamina} dire="homeless" abundant="rested">Housing</NeedReadout>
                <NeedReadout beans={this.props.beans.get} need={(b) => b.health} dire="sick" abundant="fresh">Healthcare</NeedReadout>
                <b>Avg. Money</b> ${avg_cash.toFixed(2)} &nbsp;
                <b>Avg. Happiness</b> {Math.round(avg_happy)}%
                <div className="header"><b>Electorate</b></div>
                {/* <AxisReadout report={reportIdeals(this.props.beans.get)}>Sentiment</AxisReadout> */}
                <AxisReadout report={reportCommunity(this.props.beans.get)}>Community</AxisReadout>
                <AxisReadout report={reportIdeals(this.props.beans.get)}>Ideals</AxisReadout>
                <div>
                    <b>Approval</b>&nbsp;
                <span>{avg_approval.toFixed(0)}%</span>
                </div>
            </div>
        )
    }
}

export class AxisReadout extends React.Component<{ report: { avg: number, winner: Trait } }> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render() {
        let maj = 'Leaning';
        if (this.props.report.avg >= .51)
            maj = 'Major'
        if (this.props.report.avg >= .8)
            maj = 'Extreme'
        const percent = Math.floor(this.props.report.avg * 100);
        const style = {
            width: percent + '%'
        }
        return (
            <div>
                <b>
                    {this.props.children}
                </b>&nbsp;&nbsp;
                <span>{maj} {keyToName[this.props.report.winner]}</span>
                <div className="bar">
                    <div className="bar-inner" style={style}>
                        {percent}%
                </div>
                </div>
            </div>
        )
    }
}