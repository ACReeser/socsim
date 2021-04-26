import { createSlice } from '@reduxjs/toolkit'
import { Bean } from '../../simulation/Bean'
import { City } from '../../simulation/City'
import { Economy } from '../../simulation/Economy'
import { Government } from '../../simulation/Government'
import { MarketTraitListing } from '../../simulation/MarketTraits'
import { Player } from '../../simulation/Player'
import { IDate, Season } from '../../simulation/Time'
import { Tile } from '../../World'
import { IEntitySlice } from '../entity.state'

interface IWorldState {
  tiles: IEntitySlice<Tile>,
  cities: IEntitySlice<City>,
  beans: IEntitySlice<Bean>,
  economy: Economy,
  law: Government,
  marketTraitsForSale: MarketTraitListing[],
  date: IDate,
  alien: Player
}

export const worldSlice = createSlice({
  name: 'world',
  initialState: {
    tiles: {
      byID: {},
      allIDs: []
    },
    cities: {
      byID: {},
      allIDs: []
    },
    beans: {
      byID: {},
      allIDs: []
    },
    economy: new Economy(),
    law: new Government(),
    date: {year: 1, season: Season.Spring, day: 1, hour: 1},
    marketTraitsForSale: [],
    alien: new Player()
  } as IWorldState,
  reducers: {
    refreshMarket: state => {
        
    },
    generate: state => {

    }
  }
})

export const { refreshMarket, generate } = worldSlice.actions

export default worldSlice.reducer;