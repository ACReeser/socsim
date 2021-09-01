import React from 'react';
import { Provider } from 'react-redux';
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import './App.css';
import './chrome/chrome.css';
import { IEvent } from './events/Events';
import { GameStorageInstance, isGame } from './GameStorage';
import { BrainwashingContent } from './modal-content/Brainwashing';
import { CampaignsPanel } from './modal-content/Campaigns';
import { EconomyReport } from './modal-content/EconomyReport';
import { EscapeMenu } from './modal-content/EscapeMenu';
import { GovernmentPanel } from './modal-content/Gov';
import { GreetingPanel } from './modal-content/GreetingPanel';
import { LoadGameMenu } from './modal-content/LoadGameMenu';
import { MainMenu } from './modal-content/MainMenu';
import { ResearchPanel } from './modal-content/Research';
import { TraitsReport } from './modal-content/TraitsReport';
import { MoverStoreInstance } from './MoverStoreSingleton';
import { WorldTile2 } from './petri-ui/WorldTile';
import { DetailPanel } from './right-panel/DetailPanel';
import { EventsPanel } from './right-panel/Events';
import { GoalsPanel } from './right-panel/Goals';
import { MarketPanel } from './right-panel/MarketPanel';
import { SignalStoreInstance } from './SignalStore';
import { Point } from './simulation/Geography';
import { MoverStore } from './simulation/MoverBus';
import { animate_beans, animate_pickups, animate_ufos } from './simulation/WorldSim';
import { doSelectBean, doSelectBuilding, doSelectNone } from './state/features/selected.reducer';
import { cheatAdd, loadGame, newGame, worldTick } from './state/features/world.reducer';
import { RootState, store as StoreState } from './state/state';
import { AutosaveWidget } from './widgets/Autosave';
import { BubbleNumberText, BubbleSeenTraitsText } from './widgets/BubbleText';
import { BotsAmount, CapsuleLabel, EnergyAmount, HedonAmount } from './widgets/CapsuleLabel';
import { Modal } from './widgets/Modal';
import { SeasonWidget } from './widgets/Season';
import { SocialGraph } from './widgets/SocialGraph';
import { GeoNetworkButtons, StopPlayFastButtons } from './widgets/StopPlayFast';
import { TimelyEventToggle } from './widgets/TimelyEventToggle';
import { WorldSfxInstance, WorldSound } from './WorldSound';

export type ModalView = 'mainmenu'|'loadgame'|'escapemenu'|'greeting' | 'economy' | 'campaign' | 'gov' | 'polisci' | 'brainwash' | 'traits';
interface AppPs {
}
interface AppState {
  activeModal: ModalView | null;
  activeMain: 'geo' | 'network';
  activeRightPanel: 'events' | 'overview' | 'goals' | 'market';
  timeScale: number;
  spotlightEvent: IEvent | undefined;
  cursor?: Point;
}
export const SfxContext = React.createContext<WorldSound|undefined>(undefined);
export const MoverContext = React.createContext<MoverStore>(MoverStoreInstance);

const LogicTickMS = 2000;
const SpotlightDurationTimeMS = 5000;
const store = StoreState;

const AutosaveMilliseconds = 15 * 1000;
class App extends React.Component<AppPs, AppState>{
  constructor(props: AppPs) {
    super(props);
    this.state = {
      activeMain: 'geo',
      activeModal: 'mainmenu',
      activeRightPanel: 'overview',
      timeScale: 0,
      spotlightEvent: undefined
    };
  }
  private previousTimeMS: DOMHighResTimeStamp = 0;
  private logicTickAccumulatorMS: number = 0;
  private millisecondsSinceLastSave: DOMHighResTimeStamp = 0;
  private saveAccumulatorMS: number = 0;
  componentDidMount() {
    document.addEventListener("keyup", this.keyupHandler, false);
    window.requestAnimationFrame((time: DOMHighResTimeStamp) => {
      this.previousTimeMS = time;
      window.requestAnimationFrame(this.tick);
    });
    store.subscribe(() => {
      const s = store.getState();
      if ((s.selected.selectedBeanKey != null || s.selected.selectedBuildingKey != null || s.selected.selectedHexKey != null) && this.state.activeRightPanel != 'overview'){
        this.setState({activeRightPanel: 'overview'});
      }
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
      this.millisecondsSinceLastSave += deltaTimeMS;
      //save every 30 seconds
      if(GameStorageInstance.Dirty.current && this.millisecondsSinceLastSave > AutosaveMilliseconds){
        GameStorageInstance.SaveGame(store.getState().world);
        this.millisecondsSinceLastSave = 0;
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
    } else if (this.cheatMode && event.key === 'A') {
      store.dispatch(cheatAdd())
    } else if (this.cheatMode && event.key === 'Q') {
      // if (this.state.world.cities[0].book.getBuildings().filter(x => x.type === 'farm').length < 1){
      //   this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.emptyHex.build.farm.energy || 0;
      //   this.state.world.alien.bots.amount += this.state.world.alien.difficulty.cost.emptyHex.build.farm.bots || 0;
      //   // this.build(this.state.world.cities[0], { q: 1, r: 1 }, 'farm');
      //   this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.emptyHex.build.house.energy || 0;
      //   this.state.world.alien.bots.amount += this.state.world.alien.difficulty.cost.emptyHex.build.house.bots || 0;
      //   // this.build(this.state.world.cities[0], { q: 1, r: 0 }, 'house');
      //   this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.emptyHex.build.hospital.energy || 0;
      //   this.state.world.alien.bots.amount += this.state.world.alien.difficulty.cost.emptyHex.build.hospital.bots || 0;
        // this.build(this.state.world.cities[0], { q: 0, r: 1 }, 'hospital');
      // }
      // this.state.world.alien.energy.amount += (this.state.world.alien.difficulty.cost.hex.beam.energy || 0) * 4;
      // this.beam(this.state.world.cities[0], { q: 0, r: 0 });
      // this.beam(this.state.world.cities[0], { q: 1, r: 0 });
      // this.beam(this.state.world.cities[0], { q: 0, r: 1 });
      // this.beam(this.state.world.cities[0], { q: 1, r: 1 });
    } else if (this.cheatMode && event.key === 'S') {
      // this.state.world.beans.get.forEach((b) => {
      //   if (this.state.world.alien.difficulty.cost.bean.scan.energy){
      //     if (this.state.world.alien.energy.amount < this.state.world.alien.difficulty.cost.bean.scan.energy)
      //       this.state.world.alien.energy.amount += this.state.world.alien.difficulty.cost.bean.scan.energy;
      //   }
      //   // this.scan(b);
      // });
    }
    this.cheatMode = event.shiftKey && event.key === 'C';
  }
  onDeath = (event: IEvent) => {
    WorldSfxInstance.play('death');
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
        return <GoalsPanel></GoalsPanel>
      case 'events':
        return <EventsPanel></EventsPanel>
      case 'market': 
        return <MarketPanel></MarketPanel>
    }
  }
  render() {
    return (
      <Provider store={store}>
      <SfxContext.Provider value={WorldSfxInstance}>
      <MoverContext.Provider value={MoverStoreInstance}>
        <div className="canvas">
          {
            this.state.activeMain === 'network' ? <div className="canvas">
              <SocialGraph
                city={store.getState().world.cities.byID[0]}
                onClickBuilding={(b) => store.dispatch(doSelectBuilding({
                  cityKey: store.getState().world.cities.allIDs[0], 
                  buildingKey: b.key,
                  hex: b.address
                 }))}
                onClick={(b) => {
                  store.dispatch(doSelectBean({cityKey: b.cityKey, beanKey: b.key }));
                }} ></SocialGraph>
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
            <Modal show={this.state.activeModal == 'mainmenu'}>
              <MainMenu startGame={() => this.setState({activeModal: 'greeting'})} loadGame={(slot: number) => {
                const game = GameStorageInstance.GetGame(slot);
                if (isGame(game)){
                  store.dispatch(loadGame({newState: game.game}));
                  this.setState({activeModal: null});
                }
              }}></MainMenu>
            </Modal>
            <Modal show={this.state.activeModal == 'loadgame'} onClick={() => {
              this.setState({ activeModal: null });
              store.dispatch(newGame());
              }
            }>
              <LoadGameMenu></LoadGameMenu>
            </Modal>
            <Modal show={this.state.activeModal == 'escapemenu'} onClick={() => {
              this.setState({ activeModal: null });
              store.dispatch(newGame());
              }
            }>
              <EscapeMenu></EscapeMenu>
            </Modal>
            <Modal show={this.state.activeModal == 'greeting'} onClick={() => {
              this.setState({ activeModal: null });
              store.dispatch(newGame());
              }
            }>
              <GreetingPanel></GreetingPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'gov'} onClick={() => this.setState({ activeModal: null })}>
              <GovernmentPanel></GovernmentPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'polisci'} onClick={() => this.setState({ activeModal: null })}>
              <ResearchPanel></ResearchPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'campaign'} onClick={() => this.setState({ activeModal: null })}>
              <CampaignsPanel></CampaignsPanel>
            </Modal>
            <Modal show={this.state.activeModal == 'economy'} onClick={() => this.setState({ activeModal: null })}>
              {(this.state.activeModal == 'economy' ? <EconomyReport></EconomyReport> : '')}
            </Modal>
            <Modal show={this.state.activeModal == 'traits'} onClick={() => this.setState({ activeModal: null })}>
              <TraitsReport></TraitsReport>
            </Modal>
            <Modal show={this.state.activeModal == 'brainwash'} onClick={() => this.setState({ activeModal: null })}>
              <BrainwashingContent></BrainwashingContent>
            </Modal>
            <div className="left">
              <div className="top">
                <span>👽 Alien 🌍 Utopia 🔬 Lab</span>
                <SeasonWidget></SeasonWidget>
                <StopPlayFastButtons timeScale={this.state.timeScale} setTimeScale={(n: number) => { this.setState({ timeScale: n }) }}></StopPlayFastButtons>
                <GeoNetworkButtons setActiveMain={(v) => this.setState({ activeMain: v })} activeMain={this.state.activeMain} ></GeoNetworkButtons>
                <AutosaveWidget></AutosaveWidget>
              </div>
              <div className="bottom">
                <BubbleNumberText changeEvent={SignalStoreInstance.alienEnergy} icon="⚡️">
                  <CapsuleLabel icon="⚡️" label="Energy">
                    <EnergyAmount></EnergyAmount>
                  </CapsuleLabel>
                </BubbleNumberText>
                <BubbleNumberText changeEvent={SignalStoreInstance.alienBots} icon="🤖">
                  <CapsuleLabel icon="🤖" label="Bots">
                    <BotsAmount></BotsAmount>
                  </CapsuleLabel>
                </BubbleNumberText>
                <BubbleNumberText changeEvent={SignalStoreInstance.alienHedons} icon="👍">
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
                  
                  <BubbleSeenTraitsText changeEvent={SignalStoreInstance.newTraitSeen} icon="🧠">
                    <button type="button" className="callout" onClick={() => this.setState({ activeModal: 'traits' })}>🧠 Traits</button>
                  </BubbleSeenTraitsText>
                </span>
              </div>
            </div>
            <div className="right">
              <div className="full-width-tabs">
                <button onClick={() => {this.setState({ activeRightPanel: 'overview' });}}>📈 Info</button>
                <button onClick={() => {this.setState({ activeRightPanel: 'market' }); store.dispatch(doSelectNone())}}>🛍️ Market</button>
                <button onClick={() => {this.setState({ activeRightPanel: 'events' }); store.dispatch(doSelectNone())}}>
                  <TimelyEventToggle event={SignalStoreInstance.events} eventIcon="🚨" eventClass="police-siren">📣</TimelyEventToggle> Events
                </button>
                <button onClick={() => {this.setState({ activeRightPanel: 'goals' }); store.dispatch(doSelectNone())}}>🏆 Goals</button>
              </div>
              <div className="right-panel">
                {this.getPanel()}
              </div>
            </div>
          </div>
          </div>
      </MoverContext.Provider>
      </SfxContext.Provider>
      </Provider>
    )
  }
}

export default App;
