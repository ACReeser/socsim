import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IBean } from '../../simulation/Agent'
import { HexPoint, Point } from '../../simulation/Geography'
import { GenerateIBuilding } from '../../simulation/RealEstate'
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
      selectHex: (state, action: PayloadAction<{cityKey: number, hex: HexPoint}>) => {
        
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
      }
    }
  })
  
  export const { refreshMarket, magnetChange, selectHex, worldTick, newGame  } = worldSlice.actions
  
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
  