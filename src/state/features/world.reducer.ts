import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayerResources } from '../../Game'
import { IBean } from '../../simulation/Agent'
import { BuildingTypes, HexPoint, Point } from '../../simulation/Geography'
import { EnterpriseType } from '../../simulation/Institutions'
import { PlayerCanAfford, PlayerPurchase, PlayerTryPurchase } from '../../simulation/Player'
import { BuildingTryFreeBean, GenerateIBuilding } from '../../simulation/RealEstate'
import { IUFO } from '../../simulation/Ufo'
import { simulate_world } from '../../simulation/WorldSim'
import { GetRandomCityName, GetRandomNumber } from '../../WorldGen'
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
            point: {...action.payload.where} 
          };
          state.ufos.allIDs.push(ufo.key);
          state.ufos.byID[ufo.key] = ufo;
          state.cities.byID[action.payload.cityKey].ufoKeys.push(ufo.key);

          // window.setTimeout(() => {
          //   city.beans.push(GenerateBean(city, where));
          //   this.setState({ world: state });
          // }, 3000);
        }
      },
      sim_ufos: (state, action: PayloadAction<{deltaMS: number}>) => {

      },
      abduct: () => {

      },
      brainwash: () => {

      },
      scan: () => {

      },
      vaporize: () => {

      }
    }
  })
  
  export const { 
    refreshMarket, magnetChange, worldTick, 
    sim_ufos,
    newGame, build, changeEnterprise, fireBean, upgrade, beam,
    abduct, brainwash, scan, vaporize
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
  