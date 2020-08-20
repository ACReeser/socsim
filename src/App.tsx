import React from 'react';
import logo from './logo.svg';
import './App.css';
import { World, Tile, Policy, PoliticalEffect, City, Season } from './World';
import { GenerateWorld } from './WorldGen';
import { Modal } from './Modal';
import { CityPanel } from './CityPanel';
import { Bean } from './Bean';
import { AnimatedBean } from './AnimatedBean';
import { EconomyReport } from './EconomyReport';


interface WorldTilePs {
  tile: Tile;
  city: City;
  onClick: () => void;
}
class WorldTile extends React.Component<WorldTilePs> {
  constructor(props: WorldTilePs) {
    super(props);
    this.state = {
      tile: null,
      city: null,
      activeTileID: null,
    }
  }
  render() {
    const beans = this.props.city.beans.map((b: Bean) => {
      return (
        <AnimatedBean bean={b} key={b.key}></AnimatedBean>
      )
    })
    return (
      <div className="tile" onClick={() => this.props.onClick()}>
        <span>{this.props.tile.name}</span>
        {beans}
        <img src={this.props.tile.url} alt={this.props.tile.type} />
      </div>
    )
  }
}
export const keyToName = {state: 'Statist', ego: 'Egoist', trad: 'Traditionalist', prog: 'Progressive', circle: 'Circle', square: 'Square', triangle: 'Triangle', book: 'Book', heart: 'Heart', music: 'Music', noFaith: 'Faithless'};
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
  render() {
    const season = Season[this.state.world.season];
    const tiles = this.state.world.cities.map((t) => {
      return (
        <WorldTile tile={t} city={t} onClick={() => this.setState({activeCityID: t.key})} key={t.key}></WorldTile>
      )
    })
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
          <b>Active Campaigns</b>
          <div className="policies">
            <div>
              <b>Propaganda</b>

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
              <button type="button" onClick={() => this.endTurn()}>Go to next Season</button>
            </span>
          </div>
          <div className="bottom">
            <span>
              <b>Material Capital</b> {this.state.world.party.materialCapital}
            </span>
            <span>
              <b>Political Capital</b> {this.state.world.party.politicalCapital}
            </span>
            <span>
              <button type="button" onClick={() => this.setState({activeModal:'economy'})}>National Overview</button>
              <button type="button" onClick={() => this.setState({activeModal:'campaign'})}>Campaigns</button>
              <button type="button" onClick={() => this.setState({activeModal:'policy'})}>Policies</button>
            </span>
          </div>
        </div>
        <div className="right">
          <CityPanel cities={this.state.world.cities} activeCityKey={this.state.activeCityID}></CityPanel>
        </div>
      </div>
    </div>
  )}
}

export default App;
