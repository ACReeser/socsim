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
import { BotsAmount, CapsuleLabel, EnergyAmount, HedonAmount } from './widgets/CapsuleLabel';


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
import { selectSelectedBean, store as StoreState } from './state/state';
import { WorldTile2 } from './petri-ui/WorldTile2';
import { newGame, selectBuilding, worldTick } from './state/features/world.reducer';
import { DetailPanel } from './right-panel/DetailPanel';
import { doSelectBean, doSelectBuilding } from './state/features/selected.reducer';
import { MoverBus } from './simulation/MoverBus';
import { MoverBusInstance } from './MoverBusSingleton';
import { animate_beans, animate_pickups, animate_ufos } from './simulation/WorldSim';
import { SeasonWidget } from './widgets/Season';

export type ModalView = 'greeting' | 'economy' | 'campaign' | 'gov' | 'polisci' | 'brainwash' | 'traits';
interface AppPs {
}
interface AppState {
  world: World,
  activeModal: ModalView | null;
  activeMain: 'geo' | 'network' | 'draft';
  activeRightPanel: 'events' | 'overview' | 'goals' | 'market';
  timeScale: number;
  spotlightEvent: IEvent | undefined;
  cursor?: Point;
}
export const SfxContext = React.createContext<WorldSound|undefined>(undefined);
export const MoverContext = React.createContext<MoverBus>(MoverBusInstance);

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
    const deltaTimeMS = (timeMS - this.previousTimeMS);

    // Update the previous time
    this.previousTimeMS = timeMS;
    if (deltaTimeMS > 0) {
      const gameDeltaTimeMS = deltaTimeMS * this.state.timeScale;

      animate_ufos(store.getState().world, deltaTimeMS).map(x => store.dispatch(x));
      if (gameDeltaTimeMS > 0){
        this.logicTickAccumulatorMS += deltaTimeMS;
        animate_pickups(store.getState().world, deltaTimeMS).map(x => store.dispatch(x));
        animate_beans(store.getState().world, deltaTimeMS).map(x => store.dispatch(x));
  
        if (this.logicTickAccumulatorMS > LogicTickMS) {
          store.dispatch(worldTick())
          this.logicTickAccumulatorMS = 0;
        }
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
      if (this.state.activeModal === 'greeting')
        store.dispatch(newGame())
      this.setState({activeModal: null});
    } else if (this.cheatMode && event.key === 'B') {
      this.state.world.alien.energy.amount += (this.state.world.alien.difficulty.cost.hex.beam.energy || 0);
      // this.beam(this.state.world.cities[0], { q: 0, r: 0 });
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
      // this.beam(this.state.world.cities[0], { q: 0, r: 0 });
      // this.beam(this.state.world.cities[0], { q: 1, r: 0 });
      // this.beam(this.state.world.cities[0], { q: 0, r: 1 });
      // this.beam(this.state.world.cities[0], { q: 1, r: 1 });
      this.setState({activeModal: null});
    } else if (this.cheatMode && event.key === 'S') {
      this.state.world.beans.get.forEach((b) => {
        if (this.state.world.alien.difficulty.cost.bean.scan.energy){
          if (this.state.world.alien.energy.amount < this.state.world.alien.difficulty.cost.bean.scan.energy)
            this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.bean.scan.energy;
        }
        // this.scan(b);
      });
    }
    this.cheatMode = event.shiftKey && event.key === 'C';
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
        return <DetailPanel openBrainwash={() => this.setState({ activeModal: 'brainwash' })}></DetailPanel>
      case 'goals':
        return <GoalsPanel player={this.state.world.alien} progress={this.state.world.alien}></GoalsPanel>
      case 'events':
        return <EventsPanel events={this.state.world.bus.buffer} selectBean={(beankey?: number) => {
          const cityKey = store.getState()?.world?.cities.byID[0]?.key;
          if (beankey)
            store.dispatch(doSelectBean({cityKey: cityKey, beanKey: beankey}));
        }}></EventsPanel>
      case 'market': 
        return <MarketPanel buyEnergy={this.buyEnergy} buyBots={this.buyBots} scrubHedons={this.scrubHedons} buyTrait={this.buyTrait}
         player={this.state.world.alien} market={this.state.world.marketTraitsForSale}></MarketPanel>
    }
  }
  render() {
    return (
      <Provider store={store}>
        <div className="canvas">
          <SfxContext.Provider value={this.state.world.sfx}>
          <MoverContext.Provider value={MoverBusInstance}>
          {
            this.state.activeMain === 'network' ? <div className="canvas">
              <SocialGraph costOfLiving={this.state.world.economy.getCostOfLiving()} scanned_beans={this.state.world.alien.scanned_bean}
                city={store.getState().world.cities.byID[0]}
                onClickBuilding={(b) => store.dispatch(doSelectBuilding({cityKey: store.getState().world.cities.allIDs[0], buildingKey: b.key }))}
                onClick={(b) => store.dispatch(doSelectBean({cityKey: b.cityKey, beanKey: b.key }))} ></SocialGraph>
            </div> : <TransformWrapper
              defaultScale={1}
              wheel={{ step: 48 }}>
              <TransformComponent>
                <div className="world">
                  {
                  store.getState().world.cities.allIDs.map((t) => {
                    return (
                      <WorldTile2 cityKey={t} key={t}
                        onClick={() => {
                          
                        }}
                      ></WorldTile2>
                    )
                  })}
                </div>
              </TransformComponent>
            </TransformWrapper>
          }
          <div className="overlay">
            <Modal show={this.state.activeModal == 'greeting'} onClick={() => {
              this.setState({ activeModal: null });
              store.dispatch(newGame());
              }
            }>
              <GreetingPanel></GreetingPanel>
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
              <TraitsReport seenBeliefs={this.state.world.alien.lSeenBeliefs} beliefInventory={this.state.world.alien.lBeliefInventory}
              ></TraitsReport>
            </Modal>
            <Modal show={this.state.activeModal == 'brainwash'} onClick={() => this.setState({ activeModal: null })}>
              {(this.state.activeModal == 'brainwash' ? <BrainwashingContent
                world={this.state.world} beanID={store.getState().selected.selectedBeanKey}
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
                <SeasonWidget></SeasonWidget>
                <StopPlayFastButtons timeScale={this.state.timeScale} setTimeScale={(n: number) => { this.setState({ timeScale: n }) }}></StopPlayFastButtons>
                <GeoNetworkButtons setActiveMain={(v) => this.setState({ activeMain: v })} activeMain={this.state.activeMain} ></GeoNetworkButtons>
                <span></span>
              </div>
              <div className="bottom">
                <BubbleNumberText changeEvent={this.state.world.alien.energy.change} icon="⚡️">
                  <CapsuleLabel icon="⚡️" label="Energy">
                    <EnergyAmount></EnergyAmount>
                  </CapsuleLabel>
                </BubbleNumberText>
                <BubbleNumberText changeEvent={this.state.world.alien.bots.change} icon="🤖">
                  <CapsuleLabel icon="🤖" label="Bots">
                    <BotsAmount></BotsAmount>
                  </CapsuleLabel>
                </BubbleNumberText>
                <BubbleNumberText changeEvent={this.state.world.alien.hedons.change} icon="👍">
                  <CapsuleLabel icon="👍" label="Hedons">
                    <HedonAmount></HedonAmount>
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
                  
                  <BubbleSeenTraitsText changeEvent={this.state.world.alien.lSeenBeliefs.onAdd} icon="🧠">
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
          </MoverContext.Provider>
          </SfxContext.Provider>
          </div>
      </Provider>
    )
  }
}

export default App;
