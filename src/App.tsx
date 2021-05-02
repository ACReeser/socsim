import React from 'react';
import { Provider } from 'react-redux';

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
import { BubbleNumberText, BubbleSeenTraitsText } from './widgets/BubbleText';
import { Season, Now, Hour } from './simulation/Time';
import { SocialGraph } from './widgets/SocialGraph';
import { CapsuleLabel } from './widgets/CapsuleLabel';


import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { GoalsPanel } from './right-panel/Goals';
import { CampaignsPanel } from './modal-content/Campaigns';
import { GovernmentPanel } from './modal-content/Gov';
import { ResearchPanel } from './modal-content/Research';
import { GeoNetworkButtons, StopPlayFastButtons } from './widgets/StopPlayFast';
import { BuildingTypes, HexPoint, IBuilding, Point, transformPoint } from './simulation/Geography';
import { HexPanel } from './right-panel/HexPanel';
import { City, UFO } from './simulation/City';
import { BrainwashingContent } from './modal-content/Brainwashing';
import { SecondaryBeliefData, TraitBelief } from './simulation/Beliefs';
import { TimelyEventToggle } from './widgets/TimelyEventToggle';
import { LawAxis, LawKey } from './simulation/Government';
import { Tech } from './simulation/Player';
import { IEvent } from './events/Events';
import { WorldSound } from './WorldSound';
import { MarketPanel } from './right-panel/MarketPanel';
import { TraitsReport } from './modal-content/TraitsReport';
import { GreetingPanel } from './modal-content/GreetingPanel';
import { MarketTraitListing } from './simulation/MarketTraits';
import { store as StoreState } from './state/state';
import { WorldTile2 } from './petri-ui/WorldTile2';

export type ModalView = 'greeting' | 'economy' | 'campaign' | 'party_creation' | 'gov' | 'polisci' | 'brainwash' | 'traits';
interface AppPs {
}
interface AppState {
  world: World,
  activeCityID: number | null;
  activeBeanID: number | null;
  activeHex: HexPoint | null;
  activeModal: ModalView | null;
  activeMain: 'geo' | 'network' | 'draft';
  activeRightPanel: 'events' | 'overview' | 'goals' | 'market';
  timeScale: number;
  spotlightEvent: IEvent | undefined;
  cursor?: Point;
}
export const SfxContext = React.createContext<WorldSound|undefined>(undefined);

const LogicTickMS = 2000;
const SpotlightDurationTimeMS = 5000;
const ChargePerWash = 3;
const ChargePerMarket = 3;
const store = StoreState;

class App extends React.Component<AppPs, AppState>{
  constructor(props: AppPs) {
    super(props);
    this.state = {
      world: GenerateWorld(),
      activeCityID: null,
      activeBeanID: null,
      activeHex: null,
      activeMain: 'geo',
      activeModal: 'greeting',
      activeRightPanel: 'overview',
      timeScale: 0,
      spotlightEvent: undefined
    };
    this.state.world.calculateComputedState();
    this.state.world.bus.death.subscribe(this.onDeath);
    this.state.world.bus.persuasion.subscribe(() => this.state.world.sfx.play('mhmm'));
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
  cheatMode: boolean = false;
  keyupHandler = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      if (this.state.timeScale > 0) {
        this.setState({ timeScale: 0 });
      } else {
        this.setState({ timeScale: 1 });
      }
    } else if (event.key === 'Escape') {
      this.setState({activeModal: null});
    } else if (this.cheatMode && event.key === 'B') {
      this.state.world.alien.energy.amount += (this.state.world.alien.difficulty.cost.hex.beam.energy || 0);
      this.beam(this.state.world.cities[0], { q: 0, r: 0 });
    } else if (this.cheatMode && event.key === 'Q') {
      if (this.state.world.cities[0].book.getBuildings().filter(x => x.type === 'farm').length < 1){
        this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.emptyHex.build.farm.energy || 0;
        this.state.world.alien.bots.amount += this.state.world.alien.difficulty.cost.emptyHex.build.farm.bots || 0;
        this.build(this.state.world.cities[0], { q: 1, r: 1 }, 'farm');
        this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.emptyHex.build.house.energy || 0;
        this.state.world.alien.bots.amount += this.state.world.alien.difficulty.cost.emptyHex.build.house.bots || 0;
        this.build(this.state.world.cities[0], { q: 1, r: 0 }, 'house');
        this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.emptyHex.build.hospital.energy || 0;
        this.state.world.alien.bots.amount += this.state.world.alien.difficulty.cost.emptyHex.build.hospital.bots || 0;
        this.build(this.state.world.cities[0], { q: 0, r: 1 }, 'hospital');
      }
      this.state.world.alien.energy.amount += (this.state.world.alien.difficulty.cost.hex.beam.energy || 0) * 4;
      this.beam(this.state.world.cities[0], { q: 0, r: 0 });
      this.beam(this.state.world.cities[0], { q: 1, r: 0 });
      this.beam(this.state.world.cities[0], { q: 0, r: 1 });
      this.beam(this.state.world.cities[0], { q: 1, r: 1 });
      this.setState({activeModal: null});
    } else if (this.cheatMode && event.key === 'S') {
      this.state.world.beans.get.forEach((b) => {
        if (this.state.world.alien.difficulty.cost.bean.scan.energy){
          if (this.state.world.alien.energy.amount < this.state.world.alien.difficulty.cost.bean.scan.energy)
            this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.bean.scan.energy;
        }
        this.scan(b);
      });
    }
    this.cheatMode = event.shiftKey && event.key === 'C';
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
      GenerateBuilding(city, what, where, city.economy);
    }

    this.setState({ world: this.state.world });
  }
  changeEnterprise = (city: City, what: IBuilding) => {
    
    this.setState({ world: this.state.world });
  }
  fireBean = (city: City, beanKey: number) => {
    const b = city.beans.get.find(x => x.key === beanKey);
    if (b){
      city.unsetJob(b);
      this.setState({ world: this.state.world });
    }
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
        city.beans.push(GenerateBean(city, where));
        this.setState({ world: this.state.world });
      }, 3000);

      this.setState({ world: this.state.world }, () => {
        this.removeUFO(city, newUFO.key);
      });
    }
  }
  buyBots = (amount: number) => {
    const cost = this.difficulty.cost.market.resource.bots;
    if (this.state.world.alien.tryPurchase(cost, amount)) {
      this.state.world.alien.bots.amount += amount;
      this.state.world.alien.bots.change.publish({change:amount});
    }

    this.setState({ world: this.state.world });
  }
  buyEnergy = (amount: number) => {
    const cost = this.difficulty.cost.market.resource.bots;
    if (this.state.world.alien.tryPurchase(cost, amount)) {
      this.state.world.alien.energy.amount += amount;
      this.state.world.alien.energy.change.publish({change:amount});
    }

    this.setState({ world: this.state.world });
  }
  scrubHedons = () => {
    const cost = this.difficulty.cost.market.scrubHedons;
    if (this.state.world.alien.tryPurchase(cost)) {
      const old = this.state.world.alien.hedons.amount;
      this.state.world.alien.hedons.amount = 0;
      this.state.world.alien.hedons.change.publish({change: -old});
    }

    this.setState({ world: this.state.world });
  }
  buyTrait = (l: MarketTraitListing) => {
    if (this.state.world.alien.tryPurchase(l.cost)) {
      
      const existing = this.state.world.alien.lBeliefInventory.get.find((x) => x.trait === l.trait);
      if (existing) {
        existing.charges += ChargePerMarket;
        this.state.world.alien.lBeliefInventory.set([...this.state.world.alien.lBeliefInventory.get]);
      } else
        this.state.world.alien.lBeliefInventory.push({trait: l.trait, charges: ChargePerMarket});
    }
    this.setState({ world: this.state.world });
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
      bean.city?.beans.remove(bean);
      this.setState({ world: this.state.world });
    }
  }
  enactLaw = (law: LawKey) => {
    this.state.world.law.enact(law);
    this.setState({ world: this.state.world });
  }
  revokeLaw = (law: LawKey) => {
    this.state.world.law.enact(law);
    this.setState({ world: this.state.world });
  }
  releaseBean = () => {
    if (this.state.world.alien.abductedBeans.length > 0) {
      const lucky_bean = this.state.world.alien.abductedBeans.shift();
      if (lucky_bean instanceof Bean) {
        lucky_bean.lifecycle = 'alive';
        lucky_bean.city?.beans.push(lucky_bean);
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
    if (this.state.world.alien.tryPurchase(this.state.world.alien.difficulty.cost.bean.scan)) {
      this.state.world.alien.scanned_bean[bean.key] = true;
      bean.beliefs.forEach((b) => {
        if (!this.state.world.alien.seenBeliefs.get.has(b)){
          this.state.world.alien.seenBeliefs.add(b, true);
        }
      });
      this.state.world.sfx.play('scan');
      this.setState({ world: this.state.world });
      return true;
    } else {
      return false;
    }
  }
  washCommunity = (bean: Bean, a: TraitCommunity) => {
    if (bean.canPurchase(this.state.world.alien.difficulty.cost.bean_brain.brainwash_ideal, 0)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0);
      if (bean.community === 'ego')
        bean.community = 'state';
      else bean.community = 'ego';
      this.setState({ world: this.state.world });
      return true;
    }
  }
  washMotive = (bean: Bean, a: TraitIdeals) => {
    if (bean.canPurchase(this.state.world.alien.difficulty.cost.bean_brain.brainwash_ideal, 0)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0);
      if (bean.ideals === 'prog')
        bean.ideals = 'trad';
      else bean.ideals = 'prog';
      this.setState({ world: this.state.world });
      return true;
    }
  }
  washNarrative = (bean: Bean, a: TraitFaith) => {
    if (bean.canPurchase(this.state.world.alien.difficulty.cost.bean_brain.brainwash_ideal, 0)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0);
      const oldFaith = bean.faith;
      while (bean.faith === oldFaith)
        bean.faith = GetRandom(['rocket', 'dragon', 'music', 'noFaith']);
      this.setState({ world: this.state.world });
      return true;
    }
  }
  washBelief = (bean: Bean, a: TraitBelief) => {
    const sanityCostBonus = this.state.world.alien.hasResearched('sanity_bonus') ? -1 : 0;
    if (bean.canPurchase(this.state.world.alien.difficulty.cost.bean_brain.brainwash_secondary, sanityCostBonus)) {
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean_brain.brainwash_secondary.sanity || 0);
      bean.beliefs.splice(
        bean.beliefs.indexOf(a), 1
      );
      const existing = this.state.world.alien.lBeliefInventory.get.find((x) => x.trait === a);
      const chargeBonus = this.state.world.alien.hasResearched('neural_duplicator') ? 1 : 0;
      if (existing) {
        existing.charges += ChargePerWash + chargeBonus;
        this.state.world.alien.lBeliefInventory.set([...this.state.world.alien.lBeliefInventory.get]);
      } else
        this.state.world.alien.lBeliefInventory.push({trait: a, charges: ChargePerWash + chargeBonus});
      this.state.world.sfx.play('wash_out');
      this.setState({ world: this.state.world });
      return true;
    }
  }
  implantBelief = (bean: Bean, a: TraitBelief) => {
    const sanityCostBonus = this.state.world.alien.hasResearched('sanity_bonus') ? -1 : 0;
    if (bean.canPurchase(this.state.world.alien.difficulty.cost.bean_brain.brainimplant_secondary, sanityCostBonus) && 
      this.state.world.alien.lBeliefInventory.get.filter(x => x.trait == a && x.charges > 0)) {
      bean.beliefs.push(a);
      this.state.world.alien.useCharge(a);
      this.state.world.sfx.play('wash_in');
      bean.loseSanity(this.state.world.alien.difficulty.cost.bean_brain.brainimplant_secondary.sanity || 0);
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
    this.state.world.sfx.play('death');
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
          return <OverviewPanel beans={this.state.world.beans} utopia={this.state.world.party} clearCity={() => this.setState({ activeCityID: null })} alien={this.state.world.alien}></OverviewPanel>
        } else {
          const city = this.state.world.cities.find((x) => x.key == this.state.activeCityID);
          if (city) {

            if (this.state.activeHex != null) {
              return <HexPanel city={city} hex={this.state.activeHex} difficulty={this.state.world.alien.difficulty}
                clearHex={() => this.setState({ activeHex: null })}
                beam={(where) => this.beam(city, where)}
                upgrade={(what) => this.upgrade(city, what)}
                build={(where, what) => { this.build(city, where, what) }}
                changeEnterprise={(what) => this.changeEnterprise(city, what)}
                fire={(beanKey) => this.fireBean(city, beanKey)}
                ></HexPanel>
            }
            else if (this.state.activeBeanID != null) {
              const bean = city.beans.get.find((y) => y.key == this.state.activeBeanID);
              if (bean)
                return <BeanPanel bean={bean} city={city} alien={this.state.world.alien}
                  economy={this.state.world.economy} party={this.state.world.party} bus={this.state.world.bus} law={this.state.world.law}
                  scan={this.scan} vaporize={this.vaporize}
                  brainwash={() => this.setState({ activeModal: 'brainwash' })}
                  abduct={this.abduct}
                  gift={() => this.setState({ activeModal: 'brainwash' })}
                  clearCity={() => this.setState({ activeCityID: null, activeBeanID: null })}></BeanPanel>
            }

            return <OverviewPanel beans={city?.beans} utopia={this.state.world.party} city={city} clearCity={() => this.setState({ activeCityID: null })} alien={this.state.world.alien}></OverviewPanel>
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
      case 'market': 
        return <MarketPanel buyEnergy={this.buyEnergy} buyBots={this.buyBots} scrubHedons={this.scrubHedons} buyTrait={this.buyTrait}
         player={this.state.world.alien} market={this.state.world.marketTraitsForSale}></MarketPanel>
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
  render() {
    const season = Season[this.state.world.date.season];
    return (
      <Provider store={store}>
        <div className="canvas"><SfxContext.Provider value={this.state.world.sfx}>
          {
            this.state.activeMain === 'network' ? <div className="canvas">
              <SocialGraph costOfLiving={this.state.world.economy.getCostOfLiving()} scanned_beans={this.state.world.alien.scanned_bean}
                beans={this.state.world.beans} city={this.state.world.cities[0]}
                onClickBuilding={(b) => this.setState({ activeCityID: this.state.world.cities[0].key, activeHex: b.address, activeBeanID: null, activeRightPanel: 'overview' })}
                onClick={(b) => this.setState({ activeCityID: b.cityKey, activeRightPanel: 'overview', activeBeanID: b.key, activeHex: null })} ></SocialGraph>
            </div> : this.state.activeMain === 'draft' ? <TransformWrapper
              defaultScale={1}
              wheel={{ step: 48 }}>
              <TransformComponent>
                <div className="world">
                  {
                  this.state.world.cities.map((t) => {
                    return (
                      <WorldTile2 cityKey={t.key} key={t.key} activeBeanID={this.state.activeBeanID}
                        onClick={() => this.setState({ activeCityID: t.key, activeRightPanel: 'overview', activeHex: null, activeBeanID: null })}
                        onBeanClick={(b: Bean) => this.setState({ activeCityID: t.key, activeRightPanel: 'overview', activeHex: null, activeBeanID: b.key })}
                        onHexClick={(hex: HexPoint) => { this.setState({ activeCityID: t.key, activeHex: hex, activeBeanID: null, activeRightPanel: 'overview' }) }}
                      ></WorldTile2>
                    )
                  })}
                </div>
              </TransformComponent>
            </TransformWrapper> : <TransformWrapper
              defaultScale={1}
              wheel={{ step: 48 }}>
              <TransformComponent>
                <div className="world">
                  {this.renderGeo()}
                </div>
              </TransformComponent>
            </TransformWrapper>
          }
          <div className="overlay">
            <Modal show={this.state.activeModal == 'greeting'} onClick={() => this.setState({ activeModal: null })}>
              <GreetingPanel></GreetingPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'party_creation'} onClick={() => this.setState({ activeModal: null })} hideCloseButton={true}>
              <FoundParty cities={this.state.world.cities} onFound={this.foundParty}></FoundParty>
            </Modal>
            <Modal show={this.state.activeModal == 'gov'} onClick={() => this.setState({ activeModal: null })}>
              <GovernmentPanel world={this.state.world} enactLaw={this.enactLaw} revokeLaw={this.revokeLaw}></GovernmentPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'polisci'} onClick={() => this.setState({ activeModal: null })}>
              <ResearchPanel release={this.releaseBean} setResearch={this.setResearch} player={this.state.world.alien}></ResearchPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({ activeModal: null })}>
              <CampaignsPanel></CampaignsPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'economy'} onClick={() => this.setState({ activeModal: null })}>
              {(this.state.activeModal == 'economy' ? <EconomyReport world={this.state.world}></EconomyReport> : '')}
            </Modal>
            <Modal show={this.state.activeModal == 'traits'} onClick={() => this.setState({ activeModal: null })}>
              <TraitsReport seenBeliefs={this.state.world.alien.seenBeliefs} beliefInventory={this.state.world.alien.lBeliefInventory}
              ></TraitsReport>
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
                <span>👽 Alien 🌍 Utopia 🔬 Lab</span>
                <span>&nbsp;Year {this.state.world.date.year},&nbsp;{season} {this.state.world.date.day} {this.renderHour()}</span>
                <StopPlayFastButtons timeScale={this.state.timeScale} setTimeScale={(n: number) => { this.setState({ timeScale: n }) }}></StopPlayFastButtons>
                <GeoNetworkButtons setActiveMain={(v) => this.setState({ activeMain: v })} activeMain={this.state.activeMain} ></GeoNetworkButtons>
                <span></span>
              </div>
              <div className="bottom">
                <BubbleNumberText changeEvent={this.state.world.alien.energy.change} icon="⚡️">
                  <CapsuleLabel icon="⚡️" label="Energy">
                    {this.state.world.alien.energy.amount.toFixed(1)}
                  </CapsuleLabel>
                </BubbleNumberText>
                <BubbleNumberText changeEvent={this.state.world.alien.bots.change} icon="🤖">
                  <CapsuleLabel icon="🤖" label="Bots">
                    {this.state.world.alien.bots.amount.toFixed(1)}
                  </CapsuleLabel>
                </BubbleNumberText>
                <BubbleNumberText changeEvent={this.state.world.alien.hedons.change} icon="👍">
                  <CapsuleLabel icon="👍" label="Hedons">
                    {this.state.world.alien.hedons.amount.toFixed(0)}
                  </CapsuleLabel>
                </BubbleNumberText>
                {/* <BubbleText changeEvent={this.state.world.alien.tortrons.change} icon="💔">
                  <CapsuleLabel icon="💔" label="Tortrons">
                    {this.state.world.alien.tortrons.amount.toFixed(0)}
                  </CapsuleLabel>
                </BubbleText> */}
                <span>
                  <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'economy' })}>📊 State of the Utopia</button>
                  <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'gov' })}>🗳️ Gov</button>
                  <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'polisci' })}>🧪 Research</button>
                  
                  <BubbleSeenTraitsText changeEvent={this.state.world.alien.seenBeliefs.onAdd} icon="🧠">
                    <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'traits' })}>🧠 Traits</button>
                  </BubbleSeenTraitsText>
                </span>
              </div>
            </div>
            <div className="right">
              <div className="full-width-tabs">
                <button onClick={() => this.setState({ activeRightPanel: 'overview' })}>📈 Info</button>
                <button onClick={() => this.setState({ activeRightPanel: 'market' })}>🛍️ Market</button>
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
          </SfxContext.Provider></div>
      </Provider>
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
