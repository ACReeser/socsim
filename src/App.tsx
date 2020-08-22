import React from 'react';
import logo from './logo.svg';
import './App.css';
import { World, Tile, City, Season, TraitGood } from './World';
import { GenerateWorld } from './WorldGen';
import { Modal } from './Modal';
import { CityPanel } from './CityPanel';
import { Bean } from './Bean';
import { AnimatedBean } from './AnimatedBean';
import { WorldTile } from './WorldTile';
import { EconomyReport } from './EconomyReport';
import { Charity } from './CharityPanel';
import { PoliticalEffect, Policy } from './Politics';
import { EventsPanel } from './right-panel/Events';



export const keyToName = {
  state: 'Statist', ego: 'Egoist', 
  trad: 'Traditionalist', prog: 'Progressive', 
  circle: 'Circle', square: 'Square', triangle: 'Triangle', 
  book: 'Book', heart: 'Heart', music: 'Music', noFaith: 'Faithless',
  hungry: 'Hungry', sated: 'Sated', stuffed: 'Stuffed',
  podless: 'Homeless', crowded: 'Crowded', homeowner: 'Homeowner',
  sick: 'Sick', bruised: 'Bruised', fresh: 'Fresh'
};
export const magToText = {'-3':'---', '-2':'--', '-1':'-', '1':'+', '2':'++', '3':'+++' };
function magToTextSw(magnitude: number){
  switch(magnitude) {
    case -3:
      return '---';
    case -2:
      return '--';
    case -1:
      return '-';
    case 1:
      return '+';
    case 2:
      return '++';
    case 3:
      return '+++';
    default:
      return '/';
  }
}
function compass(p: PoliticalEffect){
  return (
    <span className="badge">
      { keyToName[p.key] }
      { magToTextSw(p.mag) }
    </span>
  )
}
function policy(p: Policy){
  return (
    <div className="policy" key={p.key}>
      <b>{p.key}</b>
      <p>
        {p.fx.map((x) => compass(x))}
      </p>
    </div>
  )
}

export type ModalView = 'policy'|'economy'|'campaign';
interface AppPs{
}
interface AppState{
  world: World,
  activeCityID: number|null;
  activeModal: ModalView|null;
}

class App extends React.Component<AppPs, AppState>{
  constructor(props: AppPs) {
    super(props);
    this.state = {
      world: GenerateWorld(),
      activeCityID: null,
      activeModal: null
    };
    this.state.world.calculateComputedState();
  }
  endTurn() {
    this.state.world.next();
    this.setState({world: this.state.world});
  }
  foundCharity = (good: TraitGood, budget: number) => {
    this.state.world.addCharity(good, budget);
    this.setState({world: this.state.world});
  }
  getPanel(){
    if (this.state.activeCityID == null) {
      return <EventsPanel events={this.state.world.yearsEvents}></EventsPanel>
    } else {
      return <CityPanel cities={this.state.world.cities} activeCityKey={this.state.activeCityID} clearCity={() => this.setState({activeCityID: null})}></CityPanel>
    }
  }
  render() {
    const season = Season[this.state.world.season];
    const tiles = this.state.world.cities.map((t) => {
      return (
        <WorldTile tile={t} city={t} onClick={() => this.setState({activeCityID: t.key})} key={t.key}></WorldTile>
      )
    });
    const seasonalCost = this.state.world.party.activeCampaigns.reduce((sum, x) => sum +x.seasonalCost, 0);
    return (
    <div className="canvas">
      <div className="world">
        {tiles}
      </div>
      <div className="overlay">
        <Modal show={this.state.activeModal == 'policy'} onClick={() => this.setState({activeModal: null})}>
          <b>Active Policies</b>
          <div className="policies">
            {this.state.world.party.availablePolicies.map((p) => policy(p))}
          </div>
        </Modal>
        <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({activeModal: null})}>
          <div className="policies">
            <div>
              <b>Propaganda</b>

            </div>
            <Charity world={this.state.world} onFoundCharity={this.foundCharity}></Charity>
            <div>
              <b>Campaign Finances</b> <br/>
              <b>Expenses</b> ${seasonalCost} <b>Surplus</b> ${this.state.world.party.seasonalIncome - seasonalCost}
            </div>
          </div>
        </Modal>
        <Modal show={this.state.activeModal == 'economy'} onClick={() => this.setState({activeModal: null})}>
          {(this.state.activeModal == 'economy'? <EconomyReport world={this.state.world}></EconomyReport> : '')}
        </Modal>
        <div className="left">
          <div className="top">
            <span>
              Year {this.state.world.year}, 
              {season}
            </span>
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            <span>
              Budget
            </span>
            <span className="pull-r" style={{marginRight: 2+'em'}}>
              election in {this.state.world.electionIn} seasons
              &nbsp;
              <button type="button" className="important" onClick={() => this.endTurn()}>End Turn</button>
            </span>
          </div>
          <div className="bottom">
            <span>
              <b>Physical Capital</b> {this.state.world.party.materialCapital}
            </span>
            <span>
              <b>Political Capital</b> {this.state.world.party.politicalCapital}
            </span>
            <span>
              <button type="button" className="callout" onClick={() => this.setState({activeModal:'economy'})}>Situation Report</button>
              <button type="button" onClick={() => this.setState({activeModal:'campaign'})}>Campaigns</button>
              <button type="button" onClick={() => this.setState({activeModal:'policy'})}>Law</button>
            </span>
          </div>
        </div>
        <div className="right">
          {this.getPanel()}
        </div>
      </div>
    </div>
  )}
}

export default App;
