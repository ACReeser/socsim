import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayerResources } from '../../Game'
import { MoverBusInstance } from '../../MoverBusSingleton'
import { Act, IActivityData, IBean } from '../../simulation/Agent'
import { AgentDurationStoreInstance } from '../../simulation/AgentDurationInstance'
import { BeanBelievesIn, CosmopolitanHappyChance, DiligenceHappyChance, GermophobiaHospitalWorkChance, HedonismExtraChance, HedonismHateWorkChance, ParochialHappyChance } from '../../simulation/Bean'
import { BeanTrySetJob } from '../../simulation/BeanAndCity'
import { TraitBelief } from '../../simulation/Beliefs'
import { EconomyEmployAndPrice, EconomyMostInDemandJob, EconomyProduceAndPrice } from '../../simulation/Economy'
import { BuildingTypes, HexPoint, hex_to_pixel, IBuilding, OriginAccelerator, Point } from '../../simulation/Geography'
import { EnterpriseType } from '../../simulation/Institutions'
import { IPickup } from '../../simulation/Pickup'
import { PlayerCanAfford, PlayerPurchase, PlayerTryPurchase } from '../../simulation/Player'
import { BuildingTryFreeBean, GenerateIBuilding } from '../../simulation/RealEstate'
import { IUFO } from '../../simulation/Ufo'
import { MathClamp } from '../../simulation/Utils'
import { simulate_world } from '../../simulation/WorldSim'
import { EmotionSanity, EmotionWorth, GoodToThreshold, IWorld, JobToGood, TraitEmote } from '../../World'
import { GenerateBean, GetRandomCityName, GetRandomNumber } from '../../WorldGen'
import { GetBlankWorldState, IWorldState } from './world'

export const worldSlice = createSlice({
    name: 'world',
    initialState: GetBlankWorldState(),
    reducers: {
      refreshMarket: state => {
          
      },
      magnetChange: (state, action: PayloadAction<{cityKey: number, px?: Point}>) => {
        state.cities.byID[action.payload.cityKey].pickupMagnetPoint = action.payload.px;
      },
      worldTick: state => {
        simulate_world(state);
      },
      newGame: state => {
        const city = state.cities.byID[0];
        city.name = GetRandomCityName();
        GenerateIBuilding(state, city, 'courthouse', {q: 0, r: 0}, state.economy);
        GenerateIBuilding(state, city, 'nature', city.hexes[GetRandomNumber(15, 20)], state.economy);
        GenerateIBuilding(state, city, 'nature', city.hexes[GetRandomNumber(21, 25)], state.economy);
        GenerateIBuilding(state, city, 'nature', city.hexes[GetRandomNumber(26, 60)], state.economy);
      },
      build: (state, action: PayloadAction<{city: number, where: HexPoint, what: BuildingTypes}>) => {
        const cost: PlayerResources = state.alien.difficulty.cost.emptyHex.build[action.payload.what];
        if (PlayerTryPurchase(state.alien, cost)) {
          GenerateIBuilding(state, state.cities.byID[action.payload.city], action.payload.what, action.payload.where, state.economy);
        }
      },
      changeEnterprise: (state, action: PayloadAction<{enterpriseKey: number, newType: EnterpriseType}>) => {
        state.enterprises.byID[action.payload.enterpriseKey].enterpriseType = action.payload.newType;
      },
      fireBean: (state, action: PayloadAction<{cityKey: number, beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        state.enterprises.allIDs.forEach((eKey) => {
          const enterprise = state.enterprises.byID[eKey];
          if (enterprise.ownerBeanKey === bean.key){
            enterprise.ownerBeanKey = undefined;
          }
        });
        state.buildings.allIDs.forEach((bKey) => {
          const building = state.buildings.byID[bKey];
          BuildingTryFreeBean(building, bean.key);
        });
      },
      upgrade: (state, action: PayloadAction<{buildingKey: number}>) => {
        const cost = state.alien.difficulty.cost.hex.upgrade;
        const what = state.buildings.byID[action.payload.buildingKey];
        if (PlayerTryPurchase(state.alien, cost)) {
          what.upgraded = true;
        }
      },
      beam: (state, action: PayloadAction<{cityKey: number, where: HexPoint}>) => {
        const cost = state.alien.difficulty.cost.hex.beam;
        if (PlayerCanAfford(state.alien, cost)) {
          PlayerPurchase(state.alien, cost);
          const ufo: IUFO = {
            key: state.ufos.nextID++,
            action: 'beam-in',
            duration: 0,
            point: {...action.payload.where},
            cityKey: action.payload.cityKey
          };
          state.ufos.allIDs.push(ufo.key);
          state.ufos.byID[ufo.key] = ufo;
          state.cities.byID[action.payload.cityKey].ufoKeys.push(ufo.key);
        }
      },
      remove_ufo: (state, action: PayloadAction<{ufoKey: number}>) => {
        const ufo = state.ufos.byID[action.payload.ufoKey];
        const newBean = GenerateBean(state, state.cities.byID[0], undefined, ufo.point);
        delete state.ufos.byID[action.payload.ufoKey];
        state.ufos.allIDs = state.ufos.allIDs.filter(x => x != action.payload.ufoKey);
        state.cities.byID[ufo.cityKey].ufoKeys = state.cities.byID[ufo.cityKey].ufoKeys.filter(x => x != action.payload.ufoKey);
        
        state.beans.byID[newBean.key] = newBean;
        state.beans.allIDs.push(newBean.key);
        state.cities.byID[ufo.cityKey].beanKeys.push(newBean.key);
        MoverBusInstance.Get('bean', newBean.key).current = {
          point: hex_to_pixel(state.cities.byID[ufo.cityKey].hex_size, state.cities.byID[ufo.cityKey].petriOrigin, ufo.point), 
          velocity: {x: 0, y: 0}
        };
      },
      abduct: () => {

      },
      brainwash: () => {

      },
      scan: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (PlayerTryPurchase(state.alien, state.alien.difficulty.cost.bean.scan)) {
          state.alien.scanned_bean[bean.key] = true;
          bean.beliefs.forEach((b) => {
            if (!state.alien.seenBeliefs[b]){
              state.alien.seenBeliefs[b] = true;
            }
          });
          // state.world.sfx.play('scan');
        }
      },
      vaporize: () => {

      },
      pickUpPickup: (state, action: PayloadAction<{cityKey: number, pickupKey: number}>) => {
        const pickup = state.pickups.byID[action.payload.pickupKey];

        const amt = EmotionWorth[pickup.type];
        state.alien.hedons.amount += amt;
        state.cities.byID[action.payload.cityKey].pickupKeys = state.cities.byID[action.payload.cityKey].pickupKeys.filter(x => x != action.payload.pickupKey);
        state.pickups.allIDs = state.pickups.allIDs.filter(x => x != action.payload.pickupKey);
        delete state.pickups.byID[action.payload.pickupKey];
        // TODO
        //world.sfx.play(pickup.type);
      },
      changeState: (state, action: PayloadAction<{beanKey: number, newState: IActivityData}>) => {
        const oldAct = state.beans.byID[action.payload.beanKey].action;
        const bean = state.beans.byID[action.payload.beanKey];
        const ADS = AgentDurationStoreInstance.Get('bean', bean.key);
        bean.activity_duration[oldAct] += ADS.elapsed;
        bean.action = action.payload.newState.act;
        bean.actionData = action.payload.newState;
        ADS.elapsed = 0;
      },
      beanHitDestination: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (bean.actionData.destinationIndex != null){
          bean.actionData.destinationIndex++;
        }
      },
      beanGiveCharity: (state, action: PayloadAction<{senderBeanKey: number, needyBeanKey: number}>) => {
        const bean = state.beans.byID[action.payload.senderBeanKey];
        bean.cash -= 0.5;
        _emote(bean, state, {emote: 'happiness', source: 'Charity'});
        const needy = state.beans.byID[action.payload.needyBeanKey];
        needy.cash += 0.5;
        _emote(needy, state, {emote: 'happiness', source: 'Charity'});
      },
      beanWork: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (bean.job === 'jobless'){
        } else {
            switch(bean.job){
                case 'farmer':
                    bean.discrete_food = Math.min(bean.discrete_food+1, GoodToThreshold.food.sufficient*2);
                    _ifBelievesInMaybeEmote(state, bean, 'Parochialism', 'happiness', ParochialHappyChance);
                    break;
                case 'doc':
                    bean.discrete_health = Math.min(bean.discrete_health+1, GoodToThreshold.medicine.sufficient*2);
                    _ifBelievesInMaybeEmote(state, bean, 'Germophobia', 'unhappiness', GermophobiaHospitalWorkChance);
                    break;
                case 'builder': 
                    bean.stamina = 'awake';
                    bean.discrete_stamina = 7;
                    break;
                case 'entertainer':
                    _ifBelievesInMaybeEmote(state, bean, 'Cosmopolitanism', 'happiness', CosmopolitanHappyChance);
                break;
            }
            _ifBelievesInMaybeEmote(state, bean, 'Diligence', 'happiness', DiligenceHappyChance);
            _ifBelievesInMaybeEmote(state, bean, 'Hedonism', 'unhappiness', HedonismHateWorkChance);
            bean.ticksSinceLastSale++;
            if (bean.ticksSinceLastSale > 7){
                // const cityHasOtherWorkers = state.cities.byID[bean.cityKey].beans.get.filter(x => x.job === bean.job).length > 1 : false;
                // cityHasOtherWorkers &&

                //underemployment
                if (Math.random() > 0.5) {
                    const newJob = EconomyMostInDemandJob(state.economy);
                    if (newJob)
                      BeanTrySetJob(state, bean, newJob);
                }
            }
            let workedForEmployer = false;
            if (bean.employerEnterpriseKey){
                const employer = state.enterprises.byID[bean.employerEnterpriseKey];
                if (employer){
                    EconomyEmployAndPrice(state.economy, employer, JobToGood(bean.job), 4, bean.fairGoodPrice);
                    workedForEmployer = true;
                    switch(employer.enterpriseType){
                        case 'company':
                            _ifBelievesInMaybeEmote(state, bean, 'Communism', 'unhappiness', 0.1);
                            if (employer.ownerBeanKey === bean.key)
                              _ifBelievesInMaybeEmote(state, bean, 'Capitalism', 'happiness', 0.1);
                            break;
                        case 'co-op':                            
                            _ifBelievesInMaybeEmote(state, bean, 'Capitalism', 'unhappiness', 0.1);
                                
                            _ifBelievesInMaybeEmote(state, bean, 'Socialism', 'happiness', 0.1);
                            break;
                        case 'commune':                            
                          _ifBelievesInMaybeEmote(state, bean, 'Capitalism', 'unhappiness', 0.1);
                            break;
                    }
                }
            }
            if (!workedForEmployer)
              EconomyProduceAndPrice(state.economy, bean, JobToGood(bean.job), 4, bean.fairGoodPrice);
        }
      },
      beanEmote: (state, action: PayloadAction<{beanKey: number, emote: TraitEmote, source: string}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        
        _emote(bean, state, action.payload);
        if (BeanBelievesIn(bean, 'Hedonism') && (
          action.payload.emote === 'happiness' || action.payload.emote === 'love'
          ) && Math.random() < HedonismExtraChance){
            _emote(bean, state, {emote: 'happiness', source: 'Hedonism'});
        }
      },
      beanRelax: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        bean.discrete_fun += 1;
        _emote(bean, state, {emote: 'happiness', source: 'Relaxation'});
        if (BeanBelievesIn(bean, 'Naturalism'))
          _emote(bean, state, {emote: 'happiness', source: 'Naturalism'});
      }
    }
  });

  function _ifBelievesInMaybeEmote(state: IWorldState, bean: IBean, source: TraitBelief, emote: TraitEmote, chance: number){
    if (BeanBelievesIn(bean, source) && Math.random() < chance){
      _emote(bean, state, {emote: emote, source: source});
    }
  }
  function _emote(bean: IBean, state: IWorldState, payload: {emote: TraitEmote, source: string}){
    bean.discrete_sanity = MathClamp(bean.discrete_sanity + EmotionSanity[payload.emote], 0, 10);
    bean.hedonHistory[0][payload.source] = (bean.hedonHistory[0][payload.source] || 0) + EmotionWorth[payload.emote];
    
    const beanPosition = MoverBusInstance.Get('bean', bean.key).current || OriginAccelerator;

    const pickup: IPickup = {
        key: state.pickups.nextID++,
        point: {
          ...beanPosition.point
        },
        type: payload.emote,
        velocity: {x: 0, y: 0}
    };
    state.cities.byID[bean.cityKey].pickupKeys.push(pickup.key);
    state.pickups.byID[pickup.key] = pickup; 
    state.pickups.allIDs.push(pickup.key);
    MoverBusInstance.Get('pickup', pickup.key).publish({
      ...beanPosition,
      velocity: {x: 0, y: 0}
    });
  }
  
  export const { 
    refreshMarket, magnetChange, worldTick, 
    remove_ufo,
    newGame, build, changeEnterprise, fireBean, upgrade, beam,
    abduct, brainwash, scan, vaporize, pickUpPickup,
    changeState, beanEmote, beanGiveCharity, beanHitDestination, beanWork, beanRelax
  } = worldSlice.actions
  
  export const selectCityBeanIDs = (state: IWorldState, cityKey: number) => state.cities.byID[cityKey].beanKeys;
  export const selectBeans = (state: IWorldState) => state.beans.byID;
  export const selectBeansByCity = createSelector(
    selectCityBeanIDs,
    selectBeans,
    (cityBeanIDs, beansByID) => cityBeanIDs.reduce((all, cityBeanKey) => {
      all.push(beansByID[cityBeanKey])
      return all;
    }, [] as IBean[])
  );
  export const selectCity = (state: IWorldState, cityKey: number) => state.cities.byID[cityKey];
  export const selectBuilding = (state: IWorldState, buildingKey: number) => state.buildings.byID[buildingKey];
  export const selectCityBuildingByHex = (state: IWorldState, cityKey: number, hexKey: string) => {
    const buildingKey = state.cities.byID[cityKey].buildingMap[hexKey];
    if (buildingKey != null)
      return selectBuilding(state, buildingKey);
    else
      return undefined;
  }
  export const selectBuildingKeysByCity = (state: IWorldState, cityKey: number) => {
    return state.cities.byID[cityKey].buildingKeys;
  }
  export const selectBuildingsByCity = (state: IWorldState, cityKey: number) => {
    return selectBuildingKeysByCity(state, cityKey).reduce((x: IBuilding[], id) => {
      x.push(state.buildings.byID[id]);
      return x;
    }, [] as IBuilding[]);
  }
  
  export const selectMajorityEthnicity = createSelector(selectBeansByCity, (cityBeans) => {
    const c = cityBeans.reduce((count: {circle: number, square: number, triangle: number}, bean) => {
        switch(bean.ethnicity){
            case 'circle': count.circle++;break;
            case 'square': count.square++;break;
            case 'triangle': count.triangle++;break;
        }
        return count;
    }, {circle: 0, square: 0, triangle: 0});
    if (c.circle > c.square && c.circle > c.triangle){
      return 'circle';
    } else if (c.square > c.circle && c.square > c.triangle){
      return 'square';
    } else {
      return 'triangle';
    }
  });
  
  export default worldSlice.reducer;
  