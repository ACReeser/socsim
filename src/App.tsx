import React from 'react';
import './App.css';
import './chrome/chrome.css';
import { World, TraitGood, Trait, TraitCommunity, TraitIdeals, TraitFaith } from './World';
import { GenerateWorld, GeneratePartyHQ, GenerateBuilding, GenerateBean, GetRandom } from './WorldGen';
import { Modal } from './widgets/Modal';
import { OverviewPanel } from './right-panel/OverviewPanel';
import { Bean } from './simulation/Bean';
import { WorldTile } from './petri-ui/WorldTile';
import { EconomyReport } from './modal-content/EconomyReport';
import { CharityPanel } from './modal-content/CharityPanel';
import { PoliticalEffect, Policy, CityPartyHQ, IPolicy } from './simulation/Politics';
import { EventsPanel } from './right-panel/Events';
import { BeanPanel } from './right-panel/BeanPanel';
import { FoundParty, FoundPartyS } from './modal-content/FoundParty';
import { PartyOverview } from './modal-content/PartyOverview';
import { BubbleText } from './widgets/BubbleText';
import { Season, Now, Hour } from './simulation/Time';
import { SocialGraph } from './widgets/SocialGraph';
import { CapsuleLabel } from './widgets/CapsuleLabel';


import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { GoalsPanel } from './right-panel/Goals';
import { CampaignsPanel } from './modal-content/Campaigns';
import { GovernmentPanel } from './modal-content/Gov';
import { ResearchPanel } from './modal-content/Research';
import { StopPlayFastButtons } from './widgets/StopPlayFast';
import { BuildingTypes, HexPoint, IBuilding, Point, transformPoint } from './simulation/Geography';
import { HexPanel } from './right-panel/HexPanel';
import { City, UFO } from './simulation/City';
import { BrainwashingContent } from './modal-content/Brainwashing';
import { SecondaryBeliefData, TraitBelief } from './simulation/Beliefs';
import { TimelyEventToggle } from './widgets/TimelyEventToggle';
import { LawAxis } from './simulation/Government';
import { Tech } from './simulation/Player';
import { IEvent } from './events/Events';
import { JsxEmit } from 'typescript';

export const keyToName: { [key in Trait | BuildingTypes]: string } = {
  state: 'Collectivist', ego: 'Independent',
  trad: 'Elitist', prog: 'Progressive',
  circle: 'Brunette', square: 'Blonde', triangle: 'Redhead',
  rocket: 'Futuristic', dragon: 'Mythical', music: 'Dramatic', noFaith: 'Nihilistic',
  hungry: 'Hungry', sated: 'Sated', stuffed: 'Stuffed',
  podless: 'Homeless', crowded: 'Crowded', homeowner: 'Homeowner',
  sick: 'Sick', bruised: 'Bruised', fresh: 'Robust',
  sane: 'Sane', confused: 'Confused', mad: 'Mad',
  house: 'House', hospital: 'Hospital', farm: 'Farm', theater: 'Theater', church: 'Church', courthouse: 'Courthouse', park: 'Park', nature: 'Natural Scenery'
};

export type ModalView = 'policy' | 'economy' | 'campaign' | 'party_creation' | 'party' | 'polisci' | 'brainwash';
interface AppPs {
}
interface AppState {
  world: World,
  activeCityID: number | null;
  activeBeanID: number | null;
  activeHex: HexPoint | null;
  activeModal: ModalView | null;
  activeMain: 'geo' | 'network';
  activeRightPanel: 'events' | 'overview' | 'goals';
  timeScale: number;
  spotlightEvent: IEvent | undefined;
  cursor?: Point;
}

const LogicTickMS = 2000;
const SpotlightDurationTimeMS = 5000;
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
      timeScale: 0,
      spotlightEvent: undefined
    };
    this.state.world.calculateComputedState();
    this.state.world.bus.death.subscribe(this.onDeath);
  }
  private previousTimeMS: DOMHighResTimeStamp = 0;
  private logicTickAccumulatorMS: number = 0;
  componentDidMount() {
    document.addEventListener("keyup", this.keyupHandler, false);
    window.requestAnimationFrame((time: DOMHighResTimeStamp) => {
      this.previousTimeMS = time;
      window.requestAnimationFrame(this.tick);
    });
  }
  componentWillUnmount() {
    document.removeEventListener("keyup", this.keyupHandler);
  }
  tick = (timeMS: DOMHighResTimeStamp) => {
    // Compute the delta-time against the previous time
    const deltaTimeMS = (timeMS - this.previousTimeMS) * this.state.timeScale;

    // Update the previous time
    this.previousTimeMS = timeMS;
    if (deltaTimeMS > 0) {
      this.logicTickAccumulatorMS += deltaTimeMS;
      this.state.world.simulate_beans(deltaTimeMS);
      this.state.world.simulate_pickups(deltaTimeMS);

      if (this.logicTickAccumulatorMS > LogicTickMS) {
        this.state.world.simulate_world();
        this.setState({ world: this.state.world });
        this.logicTickAccumulatorMS = 0;
      }
    }
    window.requestAnimationFrame(this.tick);
  }
  keyupHandler = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      if (this.state.timeScale > 0) {
        this.setState({ timeScale: 0 });
      } else {
        this.setState({ timeScale: 1 });
      }
    } else if (event.key === 'Q' && event.shiftKey) {
      this.build(this.state.world.cities[0], { q: 1, r: 1 }, 'farm');
      this.build(this.state.world.cities[0], { q: 1, r: 0 }, 'house');
      this.build(this.state.world.cities[0], { q: 0, r: 1 }, 'hospital');
      this.beam(this.state.world.cities[0], { q: 0, r: 0 });
      this.beam(this.state.world.cities[0], { q: 1, r: 0 });
      this.beam(this.state.world.cities[0], { q: 0, r: 1 });
      this.beam(this.state.world.cities[0], { q: 1, r: 1 });
    }
  }
  foundParty = (state: FoundPartyS) => {
    this.state.world.party.name = state.name;
    this.state.world.party.slogan = state.slogan;
    this.state.world.cities[0].name = state.name;
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
      activeModal: null
    });
  }
  get difficulty() {
    return this.state.world.alien.difficulty;
  }
  build = (city: City, where: HexPoint, what: BuildingTypes) => {
    const cost = this.difficulty.cost.emptyHex.build[what];
    if (this.state.world.alien.canAfford(cost)) {
      this.state.world.alien.purchase(cost);
      GenerateBuilding(city, what, where);
    }

    this.setState({ world: this.state.world });
  }
  upgrade = (city: City, what: IBuilding) => {
    const cost = this.difficulty.cost.hex.upgrade;
    if (this.state.world.alien.tryPurchase(cost)) {
      what.upgraded = true;
    }

    this.setState({ world: this.state.world });
  }
  beam = (city: City, where: HexPoint) => {
    const cost = this.difficulty.cost.hex.beam;
    if (this.state.world.alien.canAfford(cost)) {
      this.state.world.alien.purchase(cost);
      const newUFO = new UFO(city.ufos.length, where, 'beam-in');
      city.ufos.push(newUFO);
      window.setTimeout(() => {
        city.historicalBeans.push(GenerateBean(city, city.historicalBeans.length, where));
        this.setState({ world: this.state.world });
      }, 3000);

      this.setState({ world: this.state.world }, () => {
        this.removeUFO(city, newUFO.key);
      });
    }
  }
  removeUFO(city: City, key: number) {
    window.setTimeout(() => {
      const myUFOI = city.ufos.findIndex((x) => x.key === key);
      if (myUFOI > -1)
        city.ufos.splice(myUFOI, 1);
    }, 7000);
  }
  foundCharity = (good: TraitGood, name: string, budget: number) => {
    this.state.world.addCharity(good, name, budget);
    this.setState({ world: this.state.world });
  }
  vaporize = (bean: Bean) => {
    if (this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.vaporize)) {
      if (bean.city) {
        bean.die('vaporization');
      }
      this.setState({ world: this.state.world });
    }
  }
  abduct = (bean: Bean) => {
    if (this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.abduct)) {
      bean.abduct(this.state.world.alien);
      this.setState({ world: this.state.world });
    }
  }
  releaseBean = () => {
    if (this.state.world.alien.abductedBeans.length > 0) {
      const lucky_bean = this.state.world.alien.abductedBeans.shift();
      if (lucky_bean instanceof Bean) {
        lucky_bean.lifecycle = 'alive';
      } else {
        window.alert("releasing data beans is unimplemented");
      }
    }
  }
  setResearch = (t: Tech) => {
    this.state.world.alien.currentlyResearchingTech = t;
    this.setState({ world: this.state.world });
  }
  scan = (bean: Bean) => {
    if (this.state.world.alien.canAfford(this.state.world.alien.difficulty.cost.bean.scan)) {
      this.state.world.alien.purchase(this.state.world.alien.difficulty.cost.bean.scan);
      this.state.world.alien.scanned_bean[bean.key] = true;
      this.setState({ world: this.state.world });
      return true;
    } else {
      return false;
    }
  }
  washCommunity = (bean: Bean, a: TraitCommunity) => {
    if (bean.discrete_sanity > 0 && this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.brainwash_ideal)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean.brainwash_ideal.psi || 0);
      if (bean.community === 'ego')
        bean.community = 'state';
      else bean.community = 'ego';
      this.setState({ world: this.state.world });
      return true;
    }
  }
  washMotive = (bean: Bean, a: TraitIdeals) => {
    if (bean.discrete_sanity > 0 && this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.brainwash_ideal)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean.brainwash_ideal.psi || 0);
      if (bean.ideals === 'prog')
        bean.ideals = 'trad';
      else bean.ideals = 'prog';
      this.setState({ world: this.state.world });
      return true;
    }
  }
  washNarrative = (bean: Bean, a: TraitFaith) => {
    if (bean.discrete_sanity > 0 && this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.brainwash_ideal)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean.brainwash_ideal.psi || 0);
      const oldFaith = bean.faith;
      while (bean.faith === oldFaith)
        bean.faith = GetRandom(['rocket', 'dragon', 'music', 'noFaith']);
      this.setState({ world: this.state.world });
      return true;
    }
  }
  washBelief = (bean: Bean, a: TraitBelief) => {
    if (bean.discrete_sanity > 0 && this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.brainwash_secondary)) {
      bean.beliefs.splice(
        bean.beliefs.indexOf(a), 1
      );
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean.brainwash_secondary.psi || 0);
      this.setState({ world: this.state.world });
      return true;
    }
  }
  implantBelief = (bean: Bean, a: TraitBelief) => {
    if (bean.discrete_sanity > 0 && this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.brainimplant_secondary)) {
      bean.beliefs.push(a);
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean.brainimplant_secondary.psi || 0);
      this.setState({ world: this.state.world });
      return true;
    }
  }
  setPolicy = (axis: LawAxis, policy: IPolicy) => {
    this.state.world.party.platform[axis] = policy;
    this.state.world.calculateComputedState();
    this.setState({ world: this.state.world });
  }
  onDeath = (event: IEvent) => {
    this.startSpotlight(event);
  }
  private timescaleBeforeSpotlight: number = 1;
  startSpotlight(event: IEvent) {
    this.timescaleBeforeSpotlight = this.state.timeScale;
    this.setState({
      spotlightEvent: event,
      timeScale: 0
    }, () => {
      setTimeout(() => this.endSpotlight(), SpotlightDurationTimeMS);
    });
  }
  endSpotlight() {
    this.setState({
      timeScale: this.timescaleBeforeSpotlight,
      spotlightEvent: undefined
    });
  }
  getPanel() {
    switch (this.state.activeRightPanel) {
      case 'overview':
        if (this.state.activeCityID == null) {
          return <OverviewPanel beans={this.state.world.beans} utopia={this.state.world.party} clearCity={() => this.setState({ activeCityID: null })}></OverviewPanel>
        } else {
          const city = this.state.world.cities.find((x) => x.key == this.state.activeCityID);
          if (city) {

            if (this.state.activeHex != null) {
              return <HexPanel city={city} hex={this.state.activeHex} difficulty={this.state.world.alien.difficulty}
                clearHex={() => this.setState({ activeHex: null })}
                beam={(where) => this.beam(city, where)}
                upgrade={(what) => this.upgrade(city, what)}
                build={(where, what) => { this.build(city, where, what) }}></HexPanel>
            }
            else if (this.state.activeBeanID != null) {
              const bean = city.beans.find((y) => y.key == this.state.activeBeanID);
              if (bean)
                return <BeanPanel bean={bean} city={city} alien={this.state.world.alien}
                  economy={this.state.world.economy} party={this.state.world.party} bus={this.state.world.bus} law={this.state.world.law}
                  scan={this.scan} vaporize={this.vaporize}
                  brainwash={() => this.setState({ activeModal: 'brainwash' })}
                  abduct={this.abduct}
                  gift={() => this.setState({ activeModal: 'brainwash' })}
                  clearCity={() => this.setState({ activeCityID: null, activeBeanID: null })}></BeanPanel>
            }

            return <OverviewPanel beans={city?.beans} utopia={this.state.world.party} city={city} clearCity={() => this.setState({ activeCityID: null })}></OverviewPanel>
          }
          else
            return <div>
            </div>
        }
      case 'goals':
        return <GoalsPanel player={this.state.world.alien} progress={this.state.world.alien}></GoalsPanel>
      case 'events':
        return <EventsPanel events={this.state.world.bus.buffer} selectBean={(beankey?: number) => {
          if (beankey)
            this.setState({ activeCityID: this.state.world.cities[0].key, activeBeanID: beankey, activeHex: null, activeRightPanel: 'overview' })
        }}></EventsPanel>
    }
  }
  renderGeo() {
    const COL = this.state.world.economy.getCostOfLiving();
    return this.state.world.cities.map((t) => {
      return (
        <WorldTile tile={t} city={t} costOfLiving={COL} key={t.key} spotlightEvent={this.state.spotlightEvent} activeBeanID={this.state.activeBeanID}
          onClick={() => this.setState({ activeCityID: t.key, activeRightPanel: 'overview', activeHex: null, activeBeanID: null })}
          onBeanClick={(b) => this.setState({ activeCityID: t.key, activeRightPanel: 'overview', activeHex: null, activeBeanID: b.key })}
          onHexClick={(hex) => { this.setState({ activeCityID: t.key, activeHex: hex, activeBeanID: null, activeRightPanel: 'overview' }) }}
        ></WorldTile>
      )
    });
  }
  renderNetwork() {
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
        onClick={(b) => this.setState({ activeCityID: b.cityKey, activeRightPanel: 'overview', activeBeanID: b.key })} ></SocialGraph>
    </div>
  }
  main() {
    switch (this.state.activeMain) {
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
          wheel={{ step: 48 }}>
          <TransformComponent>
            <div className="world">
              {this.main()}
            </div>
          </TransformComponent>
        </TransformWrapper>
        <div className="overlay">
          <Modal show={this.state.activeModal == 'party_creation'} onClick={() => this.setState({ activeModal: null })} hideCloseButton={true}>
            <FoundParty cities={this.state.world.cities} onFound={this.foundParty}></FoundParty>
          </Modal>
          <Modal show={this.state.activeModal == 'party'} onClick={() => this.setState({ activeModal: null })}>
            <PartyOverview world={this.state.world} setPolicy={this.setPolicy}></PartyOverview>
          </Modal>
          <Modal show={this.state.activeModal == 'polisci'} onClick={() => this.setState({ activeModal: null })}>
            <ResearchPanel release={this.releaseBean} setResearch={this.setResearch} player={this.state.world.alien}></ResearchPanel>
          </Modal>
          <Modal show={this.state.activeModal == 'policy'} onClick={() => this.setState({ activeModal: null })}>
            <GovernmentPanel world={this.state.world}></GovernmentPanel>
          </Modal>
          <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({ activeModal: null })}>
            <CampaignsPanel></CampaignsPanel>
          </Modal>
          <Modal show={this.state.activeModal == 'economy'} onClick={() => this.setState({ activeModal: null })}>
            {(this.state.activeModal == 'economy' ? <EconomyReport world={this.state.world}></EconomyReport> : '')}
          </Modal>
          <Modal show={this.state.activeModal == 'brainwash'} onClick={() => this.setState({ activeModal: null })}>
            {(this.state.activeModal == 'brainwash' ? <BrainwashingContent
              world={this.state.world} beanID={this.state.activeBeanID}
              washCommunity={this.washCommunity}
              washMotive={this.washMotive}
              washNarrative={this.washNarrative}
              washBelief={this.washBelief}
              implantBelief={this.implantBelief}>
            </BrainwashingContent> : '')}
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
              {season} {this.state.world.date.day} {this.renderHour()}
              </span>
              <span>
                6 mo 5 days til Grade
            </span>
              <button type="button" onClick={() => this.setState({ activeMain: 'network' })}>🌐</button>
              <button type="button" onClick={() => this.setState({ activeMain: 'geo' })}>🌎</button>

              <StopPlayFastButtons timeScale={this.state.timeScale} setTimeScale={(n: number) => { this.setState({ timeScale: n }) }}></StopPlayFastButtons>
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
              <BubbleText changeEvent={this.state.world.alien.hedons.change} icon="👍">
                <CapsuleLabel icon="👍" label="Hedons">
                  {this.state.world.alien.hedons.amount.toFixed(0)}
                </CapsuleLabel>
              </BubbleText>
              <BubbleText changeEvent={this.state.world.alien.tortrons.change} icon="💔">
                <CapsuleLabel icon="💔" label="Tortrons">
                  {this.state.world.alien.tortrons.amount.toFixed(0)}
                </CapsuleLabel>
              </BubbleText>
              <span>
                <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'economy' })}>State of the Utopia</button>
                <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'party' })}>🗳️ Gov</button>
                <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'polisci' })}>🧪 Research</button>
                {/* <button type="button" onClick={() => this.setState({activeModal:'campaign'})}>Campaigns</button> */}
              </span>
            </div>
          </div>
          <div className="right">
            <div className="full-width-tabs">
              <button onClick={() => this.setState({ activeRightPanel: 'overview' })}>📈 Overview</button>
              <button onClick={() => this.setState({ activeRightPanel: 'events' })}>
                <TimelyEventToggle event={this.state.world.bus.speechcrime} eventIcon="🚨" eventClass="police-siren">📣</TimelyEventToggle> Events
            </button>
              <button onClick={() => this.setState({ activeRightPanel: 'goals' })}>🏆 Goals</button>
            </div>
            <div className="right-panel">
              {this.getPanel()}
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderHour(): string {
    switch (this.state.world.date.hour) {
      default: return '☀️';
      case Hour.Evening: return '🌇';
      case Hour.Morning: return '🌄';
      case Hour.Midnight: return '🌙';
    }
  }
}

export default App;
