import React from 'react';
import './App.css';
import './chrome/chrome.css';
import { World, Tile, City, TraitGood, Axis } from './World';
import { GenerateWorld, GeneratePartyHQ } from './WorldGen';
import { Modal } from './Modal';
import { OverviewPanel } from './OverviewPanel';
import { Bean } from './Bean';
import { AnimatedBean } from './AnimatedBean';
import { WorldTile } from './WorldTile';
import { EconomyReport } from './EconomyReport';
import { CharityPanel } from './CharityPanel';
import { PoliticalEffect, Policy, CityPartyHQ, IPolicy } from './Politics';
import { EventsPanel } from './right-panel/Events';
import { BeanPanel } from './BeanPanel';
import { FoundParty, FoundPartyS } from './modal-content/FoundParty';
import { PartyOverview } from './modal-content/PartyOverview';
import { BubbleText } from './widgets/BubbleText';
import { Season, Now } from './simulation/Time';
import { SocialGraph } from './widgets/SocialGraph';
import { CapsuleLabel } from './widgets/CapsuleLabel';


import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


export const keyToName = {
  state: 'Statist', ego: 'Egoist', 
  trad: 'Traditionalist', prog: 'Progressive', 
  circle: 'Brunette', square: 'Blonde', triangle: 'Redhead', 
  book: 'Book', heart: 'Heart', music: 'Music', noFaith: 'Faithless',
  hungry: 'Hungry', sated: 'Sated', stuffed: 'Stuffed',
  podless: 'Homeless', crowded: 'Crowded', homeowner: 'Homeowner',
  sick: 'Sick', bruised: 'Bruised', fresh: 'Robust'
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
  activeModal: ModalView|null;
  activeMain: 'geo'|'network';
  activeRightPanel: 'events'|'overview'|'goals';
}

class App extends React.Component<AppPs, AppState>{
  constructor(props: AppPs) {
    super(props);
    this.state = {
      world: GenerateWorld(),
      activeCityID: null,
      activeBeanID: null,
      activeMain: 'geo',
      activeModal: 'party_creation',
      activeRightPanel: 'overview'
    };
    this.state.world.calculateComputedState();
  }
  componentDidMount(){
    document.addEventListener("keyup", this.escFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keyup", this.escFunction);
  }
  escFunction = (event: KeyboardEvent) => {
    if(event.keyCode === 13) {
      this.endTurn();
    }
  }
  endTurn() {
    this.state.world.next();
    this.setState({world: this.state.world});
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
    if (this.state.world.alien.energy.amount >= 2){
      this.state.world.alien.energy.amount -= 2;
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
            if (this.state.activeBeanID != null) {
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
        return <div className="goals">
          <div><b>Goals</b></div>
          <ul>
            <li>
            ☑️ Found Utopia
            </li>
            <li>
            ⭕️ Scan a Subject
              <small title="Select a single earthling and Scan it">❔</small>
            </li>
            <li>
            ⭕️ Brainwash a Subject
            </li>
            <li>
            ⭕️ Set Government Policy
            </li>
            <li>
            ⭕️ Get a C+ Utopia Grade
            </li>
          </ul>
          <div><b>Report Card</b></div>
          <p>
            Last Grade: <b>D</b>
          </p>
          <p>
            6 mo s til next grade.
          </p>
          <table style={{margin: 'auto'}}>
            <tbody>
              <tr>
                <th>Happiness
                </th>
                <td>
                  D
                </td>
                <td>
                  <small title="Are your subjects happy?">❔</small>
                </td>
              </tr>
              <tr>
                <th>Prosperity</th>
                <td>
                  D
                </td>
                <td>
                  <small title="Are your subjects fed and healthy?">❔</small>
                </td>
              </tr>
              <tr>
                <th>Stability
                </th>
                <td>
                  D
                </td>
                <td>
                  <small title="Are your subjects sane and civil?">❔</small>
                </td>
              </tr>
              <tr>
                <th>Dogma
                </th>
                <td>
                  B
                </td>
                <td>
                  <small title="Do your society's rules match your utopian ideals?">❔</small>
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <hr />
                </td>
              </tr>
              <tr>
                <th>
                </th>
                <td>
                  C
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <p>
            Receive an "A" in "Prosperity" <br/> to receive 3 Psi
          </p>
        </div>
      case 'events':
        return <EventsPanel events={this.state.world.yearsEvents}></EventsPanel>
    }
  }
  renderGeo() {
    const COL = this.state.world.economy.getCostOfLiving();
    return this.state.world.cities.map((t) => {
        return (
          <WorldTile tile={t} city={t} costOfLiving={COL} key={t.key}
            onClick={() => this.setState({activeCityID: t.key, activeRightPanel: 'overview', activeBeanID: null})} 
            onBeanClick={(b) => this.setState({activeCityID: t.key, activeRightPanel: 'overview', activeBeanID: b.key})} 
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
    const seasonalCost = this.state.world.party.activeCampaigns.reduce((sum, x) => sum +x.seasonalCost, 0);
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
          <div className="col-2">
            <h2>Political Science</h2>
            <div>

            </div>
          </div>
        </Modal>
        <Modal show={this.state.activeModal == 'policy'} onClick={() => this.setState({activeModal: null})}>
          <div className="col-2">
            <h2>Government</h2>
            <div>

            </div>
          </div>
          <div className="pad-4p">
            <h3>Policy</h3>
            <div className="horizontal">
              <div className="vertical">
                <strong>Welfare</strong>
                <div>Nutrition: {this.state.world.law.policyTree.wel_food.name}</div>
                <div>Housing: {this.state.world.law.policyTree.wel_house.name}</div>
                <div>Healthcare: {this.state.world.law.policyTree.wel_health.name}</div>
              </div>
              <div className="vertical">
                <strong>Taxation</strong>
                <div>{this.state.world.law.policyTree.tax_basic.name}</div>
                <div>{this.state.world.law.policyTree.tax_second.name}</div>
              </div>
              <div className="vertical">
                <strong>Economics</strong>
                <div>External: {this.state.world.law.policyTree.econ_ex.name}</div>
                <div>Labor: {this.state.world.law.policyTree.econ_labor.name}</div>
                <div>Subsidies: {this.state.world.law.policyTree.econ_sub.name}</div>
              </div>
              <div className="vertical">
                <strong>Culture</strong>
                <div>Religion: {this.state.world.law.policyTree.cul_rel.name}</div>
                {this.state.world.law.policyTree.cul_rel.key == '20' ? <div>Theocracy: {this.state.world.law.policyTree.cul_theo.name}</div>: null}
                <div>Education: {this.state.world.law.policyTree.cul_ed.name}</div>
              </div>
              <div className="vertical">
                <strong>Law</strong>
                <div>Voting: {this.state.world.law.policyTree.law_vote.name}</div>
                <div>Corruption: {this.state.world.law.policyTree.law_bribe.name}</div>
                <div>Immigration: {this.state.world.law.policyTree.law_imm.name}</div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({activeModal: null})}>
          <div className="pad-4p">
            <div className="subheader">
                <h3>Propaganda</h3>
                <button type="button" className="callout" onClick={() => void(0)} >🎙️ Buy Propaganda</button>
            </div>
            <span>
              Propaganda changes beans' feelings on a wide variety of topics.
            </span>
            <div className="card-parent">
              <button type="button" className="card button">
                <span className="h">
                  📺 Broadcast Campaign
                </span>
                <small>Approval+ Cash-</small>
                <span className="p">
                  Small chance to increase Approval among all beans
                </span>
              </button>
              <button type="button" className="card button">
                <span className="h">
                  👋 Canvassing
                </span>
                <small>Approval+ Labor-</small>
                <span className="p">
                  Chance to increase Approval on a few random beans
                </span>
              </button>
              <button type="button" className="card button">
                <span className="h">
                  🗞️ Print Campaign
                </span>
                <small>Approval+ Cash-</small>
                <span className="p">
                  Chance to increase Approval on wealthy beans
                </span>
              </button>
            </div>
            <div className="subheader">
                <h3>Appearances</h3>
                <button type="button" className="callout" onClick={() => void(0)} >💬 Schedule Appearance</button>
            </div>
            <span>
              Appearances have limited reach, but have powerful effects.
            </span>
            <div className="card-parent">
              <button type="button" className="card button">
                <span className="h">
                🤔 Debating
                </span>
                <small>
                  Labor-
                </small>
                <span className="p">
                  Chance to gain or lose Influence
                </span>
              </button>
              <button type="button" className="card button">
                <span className="h">
                📸 Photo Op
                </span>
                <small>
                  Labor-
                </small>
                <span className="p">
                  Increases Approval within one Social Group
                </span>
              </button>
              <button type="button" className="card button">
                <span className="h">
                  🎤 Speechmaking
                </span>
                <small>
                  Labor-
                </small>
                <span className="p">
                  Increases chance of Donations in a single City
                </span>
              </button>
              <button type="button" className="card button">
                <span className="h">
                🙋 Town Hall
                </span>
                <small>
                  Labor-
                </small>
                <span className="p">
                  Suppresses negative Approval in a single city                     
                </span>
              </button>
            </div>
            {/* <CharityPanel world={this.state.world} onFoundCharity={this.foundCharity}></CharityPanel>
            <div>
              <b>Campaign Finances</b> <br/>
              <b>Expenses</b> ${seasonalCost} <b>Surplus</b> ${this.state.world.party.seasonalIncome - seasonalCost}
            </div> */}
          </div>
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
              {season} 1
            </span>
            <span>
              6 mo 5 days til Grade
            </span>
            <button type="button" onClick={() => this.setState({activeMain: 'network'})}>🌐</button>
            <button type="button" onClick={() => this.setState({activeMain: 'geo'})}>🌎</button>
            <button type="button" className="important" onClick={() => this.endTurn()}>End Turn</button>
            
          </div>
          <div className="bottom">
            <BubbleText changeEvent={this.state.world.bus.physicalCapital} icon="⚡️">
              <CapsuleLabel icon="⚡️" label="Energy">
                {this.state.world.alien.energy.amount}
              </CapsuleLabel>
            </BubbleText>
            <BubbleText changeEvent={this.state.world.bus.politicalCapital} icon="🧠">
              <CapsuleLabel icon="🧠" label="Psi">
                {this.state.world.alien.psi.amount}
              </CapsuleLabel>
            </BubbleText>
            <BubbleText changeEvent={this.state.world.bus.labor} icon="🤖">
              <CapsuleLabel icon="🤖" label="Bots">
                {this.state.world.alien.bots.amount}
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
