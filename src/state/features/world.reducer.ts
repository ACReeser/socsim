import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayerResources } from '../../Game'
import { MoverBusInstance } from '../../MoverBusSingleton'
import { Act, IActivityData, IBean } from '../../simulation/Agent'
import { AgentDurationStoreInstance } from '../../simulation/AgentDurationInstance'
import { BeanBelievesIn, HedonismExtraChance } from '../../simulation/Bean'
import { BuildingTypes, HexPoint, hex_to_pixel, IBuilding, OriginAccelerator, Point } from '../../simulation/Geography'
import { EnterpriseType } from '../../simulation/Institutions'
import { IPickup } from '../../simulation/Pickup'
import { PlayerCanAfford, PlayerPurchase, PlayerTryPurchase } from '../../simulation/Player'
import { BuildingTryFreeBean, GenerateIBuilding } from '../../simulation/RealEstate'
import { IUFO } from '../../simulation/Ufo'
import { MathClamp } from '../../simulation/Utils'
import { simulate_world } from '../../simulation/WorldSim'
import { EmotionSanity, EmotionWorth, TraitEmote } from '../../World'
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
        return simulate_world(state);
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
      changeState: (state, action: PayloadAction<{beanKey: number, newState: Act, newData: IActivityData}>) => {
        const oldAct = state.beans.byID[action.payload.beanKey].action;
        const bean = state.beans.byID[action.payload.beanKey];
        const ADS = AgentDurationStoreInstance.Get('bean', bean.key);
        bean.activity_duration[oldAct] += ADS.elapsed;
        bean.action = action.payload.newState;
        bean.actionData = action.payload.newData;
        ADS.elapsed = 0;

        // if (agent instanceof Bean){
        //     agent.activity_duration[this.data.act] += this.Elapsed;
        // }
      },
      beanHitDestination: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (bean.actionData.destinationIndex != null){
          bean.actionData.destinationIndex++;
          console.log('hit dest')
        }
      },
      beanGiveCharity: (state, action: PayloadAction<{senderBeanKey: number, needyBeanKey: number}>) => {
        const bean = state.beans.byID[action.payload.senderBeanKey];
        bean.cash -= 0.5;
        // this.emote('happiness', 'Charity');
        const needy = state.beans.byID[action.payload.needyBeanKey];
        needy.cash += 0.5;
        // needy.emote('happiness', 'Charity');
      },
      beanEmote: (state, action: PayloadAction<{beanKey: number, emote: TraitEmote, source: string}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        
        bean.discrete_sanity = MathClamp(bean.discrete_sanity + EmotionSanity[action.payload.emote], 0, 10);
        bean.hedonHistory[0][action.payload.source] = (bean.hedonHistory[0][action.payload.source] || 0) + EmotionWorth[action.payload.emote];
        const all: IPickup[] = [
            {
                key: state.pickups.nextID++, 
                point: {
                  ...(MoverBusInstance.Get('bean', bean.key).current || OriginAccelerator).point
                }, 
                type: action.payload.emote,
                velocity: {x: 0, y: 0}
            }
        ];
        if (BeanBelievesIn(bean, 'Hedonism') && (
          action.payload.emote === 'happiness' || action.payload.emote === 'love'
          ) && Math.random() < HedonismExtraChance){
            //same as this method, but just for hedonism
            bean.discrete_sanity = MathClamp(bean.discrete_sanity + EmotionSanity['happiness'], 0, 10);
            bean.hedonHistory[0]['Hedonism'] = (bean.hedonHistory[0]['Hedonism'] || 0) + EmotionWorth['happiness'];
            all.push(
              {
                  key: state.pickups.nextID++, 
                  point: {
                    ...(MoverBusInstance.Get('bean', bean.key).current || OriginAccelerator).point
                  }, 
                  type: 'happiness',
                  velocity: {x: 0, y: 0}
              });
        }
        all.map(x => {
          state.pickups.byID[x.key] = x; 
          state.pickups.allIDs.push(x.key)
        })
      }
    }
  })
  
  export const { 
    refreshMarket, magnetChange, worldTick, 
    remove_ufo,
    newGame, build, changeEnterprise, fireBean, upgrade, beam,
    abduct, brainwash, scan, vaporize,
    changeState, beanEmote, beanGiveCharity, beanHitDestination
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
  