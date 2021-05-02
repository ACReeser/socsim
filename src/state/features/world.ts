import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChangePubSub, IEvent } from '../../events/Events'
import { DefaultDifficulty } from '../../Game'
import { IBean } from '../../simulation/Agent'
import { ICity } from '../../simulation/City'
import { IEconomy } from '../../simulation/Economy'
import { GenerateGeography, HexPoint, Point } from '../../simulation/Geography'
import { IGovernment, ILaw, LawAxis } from '../../simulation/Government'
import { MarketTraitListing } from '../../simulation/MarketTraits'
import { IPickup } from '../../simulation/Pickup'
import { IPlayerData, Player } from '../../simulation/Player'
import { IDate, Season } from '../../simulation/Time'
import { IUFO } from '../../simulation/Ufo'
import { simulate_world } from '../../simulation/WorldSim'
import { ITile } from '../../World'
import { CreateEmptyEntitySlice, CreateEntitySlice, IEntitySlice } from '../entity.state'

export interface IWorldState {
  tiles: IEntitySlice<ITile>,
  cities: IEntitySlice<ICity>,
  beans: IEntitySlice<IBean>,
  ufos: IEntitySlice<IUFO>,
  events: IEntitySlice<IEvent>,
  pickups: IEntitySlice<IPickup>,
  economy: IEconomy,
  law: IGovernment,
  marketTraitsForSale: MarketTraitListing[],
  date: IDate,
  alien: IPlayerData,
  spotlightEvent: IEvent | undefined
}

export const worldSlice = createSlice({
  name: 'world',
  initialState: {
    tiles: CreateEmptyEntitySlice<ITile>(),
    cities: CreateEntitySlice<ICity>([
      {
        ...GenerateGeography(),
        key: 0,
        name: 'string',
        deadBeanKeys: [],
        beanKeys: [],
        ufoKeys: [],
        hexes: [],
        pickupKeys: [],
        pickupMagnetPoint: undefined,
        costOfLiving: 0
      }
    ]),
    beans: CreateEmptyEntitySlice<IBean>(),
    ufos: CreateEmptyEntitySlice<IUFO>(),
    events: CreateEmptyEntitySlice<IEvent>(),
    pickups: CreateEmptyEntitySlice<IPickup>(),
    economy: {
      unfulfilledMonthlyDemand: { food: 0, shelter: 0, medicine: 0, fun: 0, },
      monthlyDemand: { food: 0, shelter: 0, medicine: 0, fun: 0, },
      monthlySupply: { food: 0, shelter: 0, medicine: 0, fun: 0, }
    },
    law: {
      treasury: 0,
      lawTree: {} as {[key in LawAxis]: ILaw|undefined},
      laws: [] as ILaw[]
    },
    date: {year: 1, season: Season.Spring, day: 1, hour: 1},
    marketTraitsForSale: [],
    alien: {
      scanned_bean: {},
      seenBeliefs: [],
      beliefInventory: [],
      speechcrimes: {},
      abductedBeans: [],
      energy: { amount: 16, income: 2/30},
      bots: { amount: 10, income: 2/30},
      hedons: { amount: 0, income: 0},
      tortrons: { amount: 0, income: 0},
      next_grade: { year: 1, season: 3, day: 1, hour: 0 },
      difficulty: {...DefaultDifficulty},
      goals: ['found_utopia', 'build_house_n_farm',  'beam_3', 'scan', 'brainwash', 'set_policy', 'c+_grade'],
      goalProgress: {},
      pastReportCards: [],
      workingReportCard: {
          Happiness: 'D',
          Prosperity: 'D',
          Stability: 'D',
          Dogma: 'D',
      },
      techProgress: {},
      currentlyResearchingTech: undefined
    },
    spotlightEvent: undefined
  } as IWorldState,
  reducers: {
    refreshMarket: state => {
        
    },
    generate: state => {

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

    }
  }
})

export const { refreshMarket, generate, magnetChange, selectHex  } = worldSlice.actions

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

