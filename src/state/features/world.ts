import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IEvent } from '../../events/Events'
import { IBean } from '../../simulation/Agent'
import { ICity } from '../../simulation/City'
import { Economy, IEconomy } from '../../simulation/Economy'
import { GenerateGeography, HexPoint, Point } from '../../simulation/Geography'
import { Government, IGovernment } from '../../simulation/Government'
import { MarketTraitListing } from '../../simulation/MarketTraits'
import { IPickup } from '../../simulation/Pickup'
import { IPlayerData, Player } from '../../simulation/Player'
import { IDate, Season } from '../../simulation/Time'
import { IUFO } from '../../simulation/Ufo'
import { ITile } from '../../World'
import { CreateEmptyEntitySlice, CreateEntitySlice, IEntitySlice } from '../entity.state'

interface IWorldState {
  tiles: IEntitySlice<ITile>,
  cities: IEntitySlice<ICity>,
  beans: IEntitySlice<IBean>,
  ufos: IEntitySlice<IUFO>,
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
        ufoKeys: [],
        hexes: [],
        pickupKeys: [],
        pickupMagnetPoint: undefined
      }
    ]),
    beans: CreateEmptyEntitySlice<IBean>(),
    ufos: CreateEmptyEntitySlice<IUFO>(),
    pickups: CreateEmptyEntitySlice<IPickup>(),
    economy: new Economy(),
    law: new Government(),
    date: {year: 1, season: Season.Spring, day: 1, hour: 1},
    marketTraitsForSale: [],
    alien: new Player(),
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
      
    }
  }
})

export const { refreshMarket, generate, magnetChange, selectHex  } = worldSlice.actions


export default worldSlice.reducer;

