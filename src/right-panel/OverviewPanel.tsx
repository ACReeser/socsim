import React from "react";
import { Trait } from "../World";
import { keyToName } from "../i18n/text";
import { Bean } from "../simulation/Bean";
import { NeedReadout } from "../widgets/NeedReadout";
import { reportIdeals, reportCommunity, reportEthno, City } from "../simulation/City";
import { Party } from "../simulation/Politics";
import { PrimaryBeliefData, SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { LiveList } from "../events/Events";
import { CardButton } from "../widgets/CardButton";
import { Player } from "../simulation/Player";

interface OverviewPanelP {
    city?: City,
    beans: LiveList<Bean>,
    utopia: Party,
    alien: Player,
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
        return (
            <div>
                {header}
                {/* <div className="header"><b>Demographics</b></div> */}
                <div className="header"><b>👥 Subjects</b></div>
                <div>
                    <b>Population</b>&nbsp;
                    <span>{this.props.beans.get.length}</span>
                </div>
                {/* <AxisReadout report={reportEthno(this.props.beans.get)}>Ethnicity</AxisReadout> */}
                <NeedReadout beans={this.props.beans.get} need={(b) => b.food} dire="starving" abundant="stuffed">Food Security</NeedReadout>
                <NeedReadout beans={this.props.beans.get} need={(b) => b.stamina} dire="homeless" abundant="rested">Housing</NeedReadout>
                <NeedReadout beans={this.props.beans.get} need={(b) => b.health} dire="sick" abundant="fresh">Healthcare</NeedReadout>
                <b>Avg. Money</b> ${avg_cash.toFixed(2)} &nbsp;
                <b>Avg. Happiness</b> {Math.round(avg_happy)}%
                {
                    this.props.city ? <>
                        <div className="header"><b>🧠 Traits</b></div>
                        <div className="max-w-300">
                            { 
                                this.props.city.getPopulationTraitsList(this.props.alien.scanned_bean).map((v) => 
                                    <span key={v.noun} className="overview-belief">
                                        {v.icon}&nbsp;{v.noun}&nbsp;x{v.count}
                                    </span>)
                            }
                        </div>
                    </> : null
                }
                {
                    this.props.city?.beans.get?.length || 0 > 7 ? <div className="card-parent">
                        <CardButton icon="🛰️" name="Scan All" disabled={true} subtext="-Energy +Info" onClick={() => {}}></CardButton>
                    </div> : null
                }
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