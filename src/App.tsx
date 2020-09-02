import React from 'react';
import logo from './logo.svg';
import './App.css';
import { World, Tile, City, Season, TraitGood } from './World';
import { GenerateWorld } from './WorldGen';
import { Modal } from './Modal';
import { OverviewPanel } from './OverviewPanel';
import { Bean } from './Bean';
import { AnimatedBean } from './AnimatedBean';
import { WorldTile } from './WorldTile';
import { EconomyReport } from './EconomyReport';
import { CharityPanel } from './CharityPanel';
import { PoliticalEffect, Policy } from './Politics';
import { EventsPanel } from './right-panel/Events';
import { BeanPanel } from './BeanPanel';



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

export type ModalView = 'policy'|'economy'|'campaign'|'party_creation';
interface AppPs{
}
interface AppState{
  world: World,
  activeCityID: number|null;
  activeBeanID: number|null;
  activeModal: ModalView|null;
  activeRightPanel: 'events'|'overview'|'goals';
}

class App extends React.Component<AppPs, AppState>{
  constructor(props: AppPs) {
    super(props);
    this.state = {
      world: GenerateWorld(),
      activeCityID: null,
      activeBeanID: null,
      activeModal: 'party_creation',
      activeRightPanel: 'overview'
    };
    this.state.world.calculateComputedState();
  }
  endTurn() {
    this.state.world.next();
    this.setState({world: this.state.world});
  }
  foundCharity = (good: TraitGood, name: string, budget: number) => {
    this.state.world.addCharity(good, name, budget);
    this.setState({world: this.state.world});
  }
  getPanel(){
    switch(this.state.activeRightPanel){
      case 'overview':
        if (this.state.activeCityID == null) {
          return <OverviewPanel beans={this.state.world.beans} clearCity={() => this.setState({activeCityID: null})}></OverviewPanel>
        } else {
          const city = this.state.world.cities.find((x) => x.key == this.state.activeCityID);
          if (city) {
            if (this.state.activeBeanID != null) {
              const bean = city.beans.find((y) => y.key == this.state.activeBeanID);
              if (bean)
                return <BeanPanel bean={bean} city={city} clearCity={() => this.setState({activeCityID: null, activeBeanID: null})}></BeanPanel>
            }

            return <OverviewPanel beans={city?.beans} city={city} clearCity={() => this.setState({activeCityID: null})}></OverviewPanel>            
          }
          else
            return <div>
            </div>
        }
      case 'goals':
        return <div>
          <div><b>Goals</b></div>
          <ul>
            <li>
              Review Finances
            </li>
            <li>
              Found a Charity
            </li>
            <li>
              Create Propaganda
            </li>
            <li>
              Pass Legislation
            </li>
          </ul>
        </div>
      case 'events':
        return <EventsPanel events={this.state.world.yearsEvents}></EventsPanel>
    }
  }
  render() {
    const season = Season[this.state.world.season];
    const COL = this.state.world.economy.getCostOfLiving();
    const tiles = this.state.world.cities.map((t) => {
      return (
        <WorldTile tile={t} city={t} costOfLiving={COL} key={t.key}
          onClick={() => this.setState({activeCityID: t.key, activeRightPanel: 'overview', activeBeanID: null})} 
          onBeanClick={(b) => this.setState({activeCityID: t.key, activeRightPanel: 'overview', activeBeanID: b.key})} 
          ></WorldTile>
      )
    });
    const seasonalCost = this.state.world.party.activeCampaigns.reduce((sum, x) => sum +x.seasonalCost, 0);
    return (
    <div className="canvas">
      <div className="world">
        {tiles}
      </div>
      <div className="overlay">
        <Modal show={this.state.activeModal == 'party_creation'} onClick={() => this.setState({activeModal: null})}>
          <h2>Found your Political Party</h2>
          <div className="col-2">
            <div>
              My fellow party members believe the
              <div>
                <label>
                  <input type="radio" name="community" value="state" /> <b>Government</b>
                </label>
                &nbsp;&nbsp;or&nbsp;&nbsp;
                <label>
                  <input type="radio" name="community" value="ego" /> <b>Individual</b>
                </label>
              </div>
              &nbsp;
              is responsible for well-being.
            </div>
            <div>
              My fellow party members believe in
              <div>
                <label>
                  <input type="radio" name="ideal" value="trad" /> <b>Traditional</b>
                </label>
                &nbsp;&nbsp;or&nbsp;&nbsp;
                <label>
                  <input type="radio" name="ideal" value="prog" /> <b>Progressive</b>
                </label>
              </div>
              &nbsp;
              social values.
            </div>
          </div>
          <hr />
          <div className="col-2">
            <div>
              My party's first members are mostly <b>Low-Income</b>
            </div>
            <div>
              My party's first major legislative goal is to pass <b>Food Welfare</b>
            </div>
          </div>
          <hr />
          <div className="col-2">
            <div>
              My party is named <input type="text" />
            </div>
            <div>
              My party's slogan is <input type="text" />
            </div>
          </div>
        </Modal>
        <Modal show={this.state.activeModal == 'policy'} onClick={() => this.setState({activeModal: null})}>
          <b>Active Policies</b>
          <div className="policies">
            {this.state.world.party.availablePolicies.map((p) => policy(p))}
          </div>
        </Modal>
        <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({activeModal: null})}>
          <div className="policies">
            <div className="subheader">
                <h3>Propaganda</h3>
                <button type="button" className="callout" onClick={() => void(0)} >🎙️ Create New Propaganda</button>
            </div>
            <span>
              Propaganda slightly changes beans' feelings on a wide variety of topics.
            </span>
            <CharityPanel world={this.state.world} onFoundCharity={this.foundCharity}></CharityPanel>
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
              &nbsp;
              Year {this.state.world.year}, 
              &nbsp;
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
              <b>Physical Capital</b> {this.state.world.party.materialCapital.toFixed(0)}
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
          <div className="full-width-tabs">
            <button onClick={() => this.setState({activeRightPanel: 'overview'})}>📈 Overview</button>
            <button onClick={() => this.setState({activeRightPanel: 'events'})}>📣 Events</button>
            <button onClick={() => this.setState({activeRightPanel: 'goals'})}>🏆 Goals</button>
          </div>
          {this.getPanel()}
        </div>
      </div>
    </div>
  )}
}

export default App;
