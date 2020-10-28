import React from 'react';
import './App.css';
import './chrome/chrome.css';
import { World, TraitGood, Axis, Trait } from './World';
import { GenerateWorld, GeneratePartyHQ, GenerateBuilding } from './WorldGen';
import { Modal } from './widgets/Modal';
import { OverviewPanel } from './right-panel/OverviewPanel';
import { Bean } from './simulation/Bean';
import { AnimatedBean } from './petri-ui/AnimatedBean';
import { WorldTile } from './petri-ui/WorldTile';
import { EconomyReport } from './modal-content/EconomyReport';
import { CharityPanel } from './modal-content/CharityPanel';
import { PoliticalEffect, Policy, CityPartyHQ, IPolicy } from './simulation/Politics';
import { EventsPanel } from './right-panel/Events';
import { BeanPanel } from './right-panel/BeanPanel';
import { FoundParty, FoundPartyS } from './modal-content/FoundParty';
import { PartyOverview } from './modal-content/PartyOverview';
import { BubbleText } from './widgets/BubbleText';
import { Season, Now } from './simulation/Time';
import { SocialGraph } from './widgets/SocialGraph';
import { CapsuleLabel } from './widgets/CapsuleLabel';


import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { GoalsPanel } from './right-panel/Goals';
import { CampaignsPanel } from './modal-content/Campaigns';
import { GovernmentPanel } from './modal-content/Gov';
import { ResearchPanel } from './modal-content/Research';
import { StopPlayFastButtons } from './widgets/StopPlayFast';
import { BuildingTypes, HexPoint } from './simulation/Geography';
import { HexPanel } from './right-panel/HexPanel';
import { City } from './simulation/City';


export const keyToName: {[key in Trait|BuildingTypes]: string} = {
  state: 'Statist', ego: 'Egoist', 
  trad: 'Traditionalist', prog: 'Progressive', 
  circle: 'Brunette', square: 'Blonde', triangle: 'Redhead', 
  book: 'Book', heart: 'Heart', music: 'Music', noFaith: 'Faithless',
  hungry: 'Hungry', sated: 'Sated', stuffed: 'Stuffed',
  podless: 'Homeless', crowded: 'Crowded', homeowner: 'Homeowner',
  sick: 'Sick', bruised: 'Bruised', fresh: 'Robust',
  sane: 'Sane', confused: 'Confused', mad: 'Mad',
  house:'House', hospital:'Hospital', farm: 'Farm', theater: 'Theater', church: 'Church', courthouse: 'Courthouse'
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
export function policy(p: Policy){
  return (
    <div className="policy" key={p.key}>
      <b>{p.key}</b>
      <p>
        {p.fx.map((x) => compass(x))}
      </p>
    </div>
  )
}

export type ModalView = 'policy'|'economy'|'campaign'|'party_creation'|'party'|'polisci';
interface AppPs{
}
interface AppState{
  world: World,
  activeCityID: number|null;
  activeBeanID: number|null;
  activeHex: HexPoint|null;
  activeModal: ModalView|null;
  activeMain: 'geo'|'network';
  activeRightPanel: 'events'|'overview'|'goals';
  timeScale: number;
}

const LogicTickMS = 1000;
class App extends React.Component<AppPs, AppState>{
  constructor(props: AppPs) {
    super(props);
    this.state = {
      world: GenerateWorld(),
      activeCityID: null,
      activeBeanID: null,
      activeHex: null,
      activeMain: 'geo',
      activeModal: 'party_creation',
      activeRightPanel: 'overview',
      timeScale: 1
    };
    this.state.world.calculateComputedState();
  }
  private previousTimeMS: DOMHighResTimeStamp = 0;
  private logicTickAccumulatorMS: number = 0;
  componentDidMount(){
    document.addEventListener("keyup", this.keyupHandler, false);
    window.requestAnimationFrame((time: DOMHighResTimeStamp) => {
      this.previousTimeMS = time;
      window.requestAnimationFrame(this.tick);
    });
  }
  componentWillUnmount(){
    document.removeEventListener("keyup", this.keyupHandler);
  }
  tick = (timeMS: DOMHighResTimeStamp) => {
    // Compute the delta-time against the previous time
    const deltaTimeMS = (timeMS - this.previousTimeMS) * this.state.timeScale;
  
    // Update the previous time
    this.previousTimeMS = timeMS;
    if (deltaTimeMS > 0){
      this.logicTickAccumulatorMS += deltaTimeMS;
      this.state.world.beans.forEach((x) => {
        x.animate.publish(deltaTimeMS);
      });
      
      if (this.logicTickAccumulatorMS > LogicTickMS){
        this.state.world.next();
        this.setState({world: this.state.world});
        this.logicTickAccumulatorMS = 0;
      }
    }
    window.requestAnimationFrame(this.tick);
  }
  keyupHandler = (event: KeyboardEvent) => {
    if(event.key === ' ') {
      if (this.state.timeScale > 0){
        this.setState({timeScale: 0});
      } else {
        this.setState({timeScale: 1});
      }
    }
  }
  foundParty = (state: FoundPartyS) => {
    this.state.world.party.name = state.name;
    this.state.world.party.slogan = state.slogan;
    if (state.community)
      this.state.world.party.community = state.community;
    if (state.ideal)
      this.state.world.party.ideals = state.ideal;
    const city = this.state.world.cities.find((x) => x.key == state.cityKey);
    if (city) {
      GeneratePartyHQ(city, this.state.world.party);
    }
    this.state.world.calculateComputedState();
    this.setState({
      world: this.state.world,
      activeModal: null});
  }
  get difficulty(){
    return this.state.world.alien.difficulty;
  }
  build = (city: City, where: HexPoint, what: BuildingTypes) => {
    const cost = this.difficulty.cost.emptyHex.build[what];
    if (this.state.world.alien.canAfford(cost)){
      this.state.world.alien.purchase(cost);
      GenerateBuilding(city, what, where);
    }
    
    this.setState({world: this.state.world});
  }
  foundCharity = (good: TraitGood, name: string, budget: number) => {
    this.state.world.addCharity(good, name, budget);
    this.setState({world: this.state.world});
  }
  insult = (bean: Bean) => {
    this.state.world.party.politicalCapital += 1;
    bean.lastInsultDate = Now(this.state.world);
    if (bean.city)
      bean.calculateBeliefs(this.state.world.economy, bean.city, this.state.world.law, this.state.world.party);
    this.setState({world: this.state.world});
    this.state.world.bus.politicalCapital.publish({change: 1});
  }
  support = (bean: Bean) => {
    this.state.world.party.politicalCapital -= 1;
    bean.lastApprovalDate = Now(this.state.world);
    if (bean.city)
      bean.calculateBeliefs(this.state.world.economy, bean.city, this.state.world.law, this.state.world.party);
    this.setState({world: this.state.world});
    this.state.world.bus.politicalCapital.publish({change: -1});
  }
  scan = (bean: Bean) => {
    if (this.state.world.alien.canAfford(this.state.world.alien.difficulty.cost.bean.scan)){
      this.state.world.alien.purchase(this.state.world.alien.difficulty.cost.bean.scan);
      this.state.world.alien.scanned_bean[bean.key] = true;
      this.setState({world: this.state.world});
      return true;
    } else {
      return false;
    }
  }
  setPolicy = (axis: Axis, policy: IPolicy) => {
    this.state.world.party.platform[axis] = policy;
    this.state.world.calculateComputedState();
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
            
            if (this.state.activeHex != null){
              return <HexPanel city={city} hex={this.state.activeHex} difficulty={this.state.world.alien.difficulty}
                clearHex={() => this.setState({activeHex: null})} 
                build={(where, what) => {this.build(city, where, what)}}></HexPanel>
            }
            else if (this.state.activeBeanID != null) {
              const bean = city.beans.find((y) => y.key == this.state.activeBeanID);
              if (bean)
                return <BeanPanel bean={bean} city={city} alien={this.state.world.alien} 
                economy={this.state.world.economy} party={this.state.world.party} bus={this.state.world.bus} law={this.state.world.law}
                scan={this.scan} insult={this.insult} support={this.support}
                clearCity={() => this.setState({activeCityID: null, activeBeanID: null})}></BeanPanel>
            }

            return <OverviewPanel beans={city?.beans} city={city} clearCity={() => this.setState({activeCityID: null})}></OverviewPanel>            
          }
          else
            return <div>
            </div>
        }
      case 'goals':
        return <GoalsPanel></GoalsPanel>
      case 'events':
        return <EventsPanel events={this.state.world.yearsEvents}></EventsPanel>
    }
  }
  renderGeo() {
    const COL = this.state.world.economy.getCostOfLiving();
    return this.state.world.cities.map((t) => {
        return (
          <WorldTile tile={t} city={t} costOfLiving={COL} key={t.key}
            onClick={() => this.setState({activeCityID: t.key, activeRightPanel: 'overview', activeHex: null, activeBeanID: null})} 
            onBeanClick={(b) => this.setState({activeCityID: t.key, activeRightPanel: 'overview', activeHex: null, activeBeanID: b.key})} 
            onHexClick={(hex) => {this.setState({activeCityID: t.key, activeHex: hex, activeBeanID: null, activeRightPanel: 'overview'})}}
            ></WorldTile>
        )
      });
  }
  renderNetwork(){
    return <div>
      <div className="horizontal max-w-500 m-t-2em">
        <button type="button">
        😎 Influence
        </button>
        <button type="button">
        🚩 Party Preference
        </button>
        <button type="button">
        📈 Demographics
        </button>
      </div>
      <SocialGraph costOfLiving={this.state.world.economy.getCostOfLiving()} 
        beans={this.state.world.beans}
        onClick={(b) => this.setState({activeCityID: b.cityKey, activeRightPanel: 'overview', activeBeanID: b.key})} ></SocialGraph>
    </div>
  }
  main(){
    switch(this.state.activeMain){
      case 'network':
        return this.renderNetwork();
      default:
        return this.renderGeo();
    }
  }
  render() {
    const season = Season[this.state.world.date.season];
    return (
    <div className="canvas">
      <TransformWrapper 
        defaultScale={1}
        wheel={{step: 48}}>
        <TransformComponent>
          <div className="world">
            {this.main()}
          </div>
        </TransformComponent>
      </TransformWrapper>
      <div className="overlay">
        <Modal show={this.state.activeModal == 'party_creation'} onClick={() => this.setState({activeModal: null})} hideCloseButton={true}>
          <FoundParty cities={this.state.world.cities} onFound={this.foundParty}></FoundParty>
        </Modal>
        <Modal show={this.state.activeModal == 'party'} onClick={() => this.setState({activeModal: null})}>
          <PartyOverview world={this.state.world} setPolicy={this.setPolicy}></PartyOverview>
        </Modal>
        <Modal show={this.state.activeModal == 'polisci'} onClick={() => this.setState({activeModal: null})} hideCloseButton={true}>
          <ResearchPanel></ResearchPanel>
        </Modal>
        <Modal show={this.state.activeModal == 'policy'} onClick={() => this.setState({activeModal: null})}>
          <GovernmentPanel world={this.state.world}></GovernmentPanel>
        </Modal>
        <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({activeModal: null})}>
          <CampaignsPanel></CampaignsPanel>
        </Modal>
        <Modal show={this.state.activeModal == 'economy'} onClick={() => this.setState({activeModal: null})}>
          {(this.state.activeModal == 'economy'? <EconomyReport world={this.state.world}></EconomyReport> : '')}
        </Modal>
        <div className="left">
          <div className="top">
            <span>
            👽 Alien 🌍 Utopia 🔬 Lab
            </span>
            <span>
              &nbsp;
              Year {this.state.world.date.year}, 
              &nbsp;
              {season} {this.state.world.date.day}
            </span>
            <span>
              6 mo 5 days til Grade
            </span>
            <button type="button" onClick={() => this.setState({activeMain: 'network'})}>🌐</button>
            <button type="button" onClick={() => this.setState({activeMain: 'geo'})}>🌎</button>
            
            <StopPlayFastButtons timeScale={this.state.timeScale} setTimeScale={(n: number) => {this.setState({timeScale: n})}}></StopPlayFastButtons>
          </div>
          <div className="bottom">
            <BubbleText changeEvent={this.state.world.alien.energy.change} icon="⚡️">
              <CapsuleLabel icon="⚡️" label="Energy">
                {this.state.world.alien.energy.amount.toFixed(1)}
              </CapsuleLabel>
            </BubbleText>
            <BubbleText changeEvent={this.state.world.alien.psi.change} icon="🧠">
              <CapsuleLabel icon="🧠" label="Psi">
                {this.state.world.alien.psi.amount.toFixed(1)}
              </CapsuleLabel>
            </BubbleText>
            <BubbleText changeEvent={this.state.world.alien.bots.change} icon="🤖">
              <CapsuleLabel icon="🤖" label="Bots">
                {this.state.world.alien.bots.amount.toFixed(1)}
              </CapsuleLabel>
            </BubbleText>
            <span>
              <button type="button" className="callout" onClick={() => this.setState({activeModal:'economy'})}>State of the Utopia</button>
              <button type="button" className="callout" onClick={() => this.setState({activeModal:'party'})}>Gov</button>
              <button type="button" onClick={() => this.setState({activeModal:'polisci'})}>Research</button>
              <button type="button" onClick={() => this.setState({activeModal:'campaign'})}>Campaigns</button>
            </span>
          </div>
        </div>
        <div className="right">
          <div className="full-width-tabs">
            <button onClick={() => this.setState({activeRightPanel: 'overview'})}>📈 Overview</button>
            <button onClick={() => this.setState({activeRightPanel: 'events'})}>📣 Events</button>
            <button onClick={() => this.setState({activeRightPanel: 'goals'})}>🏆 Goals</button>
          </div>
          <div className="right-panel">
            {this.getPanel()}
          </div>
        </div>
      </div>
    </div>
  )}
}

export default App;
