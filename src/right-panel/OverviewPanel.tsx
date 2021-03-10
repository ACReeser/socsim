import React from "react";
import { Trait } from "../World";
import { keyToName } from "../App";
import { Bean } from "../simulation/Bean";
import { NeedReadout } from "../widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno, City } from "../simulation/City";
import { Party } from "../simulation/Politics";
import { PrimaryBeliefData } from "../simulation/Beliefs";

interface OverviewPanelP {
    city?: City,
    beans: Bean[],
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
        let header = null;
        if (this.props.city) {
            header = <div><div><b>{this.props.city.name}</b> {PrimaryBeliefData[this.props.utopia.community].icon} {PrimaryBeliefData[this.props.utopia.ideals].icon}
                <button type="button" className="pull-r" onClick={() => this.props.clearCity()} >❌</button>
            </div>
                <div> {PrimaryBeliefData[this.props.utopia.community].adj} {PrimaryBeliefData[this.props.utopia.ideals].adj} Utopia</div>
            </div>;
        }
        const avg_happy = this.props.beans.reduce((sum, x) => sum + x.lastHappiness, 0) / (this.props.beans.length || 1);
        const avg_cash = this.props.beans.reduce((sum, x) => sum + x.cash, 0) / (this.props.beans.length || 1);
        const avg_approval = this.props.beans.reduce((sum, x) => sum + x.lastPartySentiment, 0) / (this.props.beans.length || 1);
        return (
            <div>
                {header}
                <div className="header"><b>Demographics</b></div>
                <div>
                    <b>Population</b>&nbsp;
                <span>{this.props.beans.length}</span>
                </div>
                <AxisReadout report={reportEthno(this.props.beans)}>Ethnicity</AxisReadout>
                <div className="header"><b>Situation</b></div>
                <NeedReadout beans={this.props.beans} need={(b) => b.food} dire="hungry" abundant="stuffed">Food Security</NeedReadout>
                <NeedReadout beans={this.props.beans} need={(b) => b.shelter} dire="podless" abundant="homeowner">Housing</NeedReadout>
                <NeedReadout beans={this.props.beans} need={(b) => b.health} dire="sick" abundant="fresh">Healthcare</NeedReadout>
                <b>Avg. Money</b> ${avg_cash.toFixed(2)} &nbsp;
                <b>Avg. Happiness</b> {Math.round(avg_happy)}%
                <div className="header"><b>Electorate</b></div>
                {/* <AxisReadout report={reportIdeals(this.props.beans)}>Sentiment</AxisReadout> */}
                <AxisReadout report={reportCommunity(this.props.beans)}>Community</AxisReadout>
                <AxisReadout report={reportIdeals(this.props.beans)}>Ideals</AxisReadout>
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