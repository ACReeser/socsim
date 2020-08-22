import React from "react";
import { City, Trait } from "./World";
import { keyToName } from "./App";
import { Bean } from "./Bean";
import { NeedReadout } from "./widgets/NeedRedout";
import { reportIdeals, reportCommunity, reportEthno } from "./simulation/City";

interface OverviewPanelIn{
    city?: City,
    beans: Bean[],
    clearCity: () => void;
}

export class OverviewPanel extends React.Component<OverviewPanelIn> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        let header = null;
        if (this.props.city){
            header = 
            <div><b>{this.props.city.name}</b>
            <button type="button" className="pull-r" onClick={() => this.props.clearCity()} >❌</button>
            </div>
        }
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
            <div className="header"><b>Electorate</b></div>
            <AxisReadout report={reportIdeals(this.props.beans)}>Sentiment</AxisReadout>
            <AxisReadout report={reportCommunity(this.props.beans)}>Community</AxisReadout>
            <AxisReadout report={reportIdeals(this.props.beans)}>Ideals</AxisReadout>
            {/* <div className="header"><b>Party</b></div>
            <div>
                <b>Approval</b>&nbsp;
                <span>Approve (60%)</span>
            </div>
            <div>
                <b>Representatives</b>&nbsp;
                <span>3/4</span>
            </div> */}
        </div>
        )
    }
}

export class AxisReadout extends React.Component<{report: {avg: number, winner: Trait}}> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        let maj = 'Leaning';
        if (this.props.report.avg >= .51)
            maj = 'Major'
        if (this.props.report.avg >= .8)
            maj = 'Extreme'
        const percent = Math.floor(this.props.report.avg * 100);
        const style = {
            width: percent+'%'
        }
        return (                
        <div>
            <b>
                { this.props.children }
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