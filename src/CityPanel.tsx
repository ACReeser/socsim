import React from "react";
import { City, Trait } from "./World";
import { keyToName } from "./App";
import { Bean } from "./Bean";

interface CityPanelIn{
    cities: City[],
    activeCityKey: number|null;
}

export class CityPanel extends React.Component<CityPanelIn> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        let city = this.props.cities.find((x) => x.key == this.props.activeCityKey);
        if (!city) {
            return null;
        }
        return (                
        <div>
            <div><b>{city.name}</b></div>
            <div className="header"><b>Demographics</b></div>
            <div>
                <b>Population</b>&nbsp;
                <span>{city.beans.length}</span>
            </div>
            <AxisReadout report={city.reportEthno()}>Ethnicity</AxisReadout>
            <div className="header"><b>Situation</b></div>
            <NeedReadout beans={city.beans} need={(b) => b.food} dire="hungry" abundant="stuffed">Food Security</NeedReadout>
            <NeedReadout beans={city.beans} need={(b) => b.shelter} dire="podless" abundant="homeowner">Housing</NeedReadout>
            <NeedReadout beans={city.beans} need={(b) => b.health} dire="sick" abundant="fresh">Healthcare</NeedReadout>
            <div className="header"><b>Electorate</b></div>
            <AxisReadout report={city.reportIdeals()}>Sentiment</AxisReadout>
            <AxisReadout report={city.reportCommunity()}>Community</AxisReadout>
            <AxisReadout report={city.reportIdeals()}>Ideals</AxisReadout>
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

export class NeedReadout extends React.Component<{beans: Bean[], need: (b: Bean) => Trait, dire: Trait, abundant: Trait}> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        const dire = this.props.beans.filter(b => this.props.need(b) == this.props.dire).length;
        const dire_style = {
            width: Math.floor((dire / this.props.beans.length)*100)+'%'
        }
        const full = this.props.beans.filter(b => this.props.need(b) == this.props.abundant).length;
        const full_style = {
            width: Math.floor((full / this.props.beans.length)*100)+'%'
        }
        return (                
        <div>
            <b>
                { this.props.children }
            </b>&nbsp;&nbsp;
            {/* <span>{keyToName[this.props.report.winner]}</span> */}
            <div className="bar">
                <div className="bar-inner dire" style={dire_style} title={full+' '+keyToName[this.props.dire]}>
                    {dire}
                </div>
                <div className="bar-inner abundant" style={full_style} title={full+' '+keyToName[this.props.abundant]}>
                    {full}
                </div>
            </div>
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