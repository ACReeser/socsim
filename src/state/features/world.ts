import { IEvent } from '../../events/Events'
import { DefaultDifficulty } from '../../Game'
import { IBean } from '../../simulation/Agent'
import { ICity } from '../../simulation/City'
import { IEconomy } from '../../simulation/Economy'
import { GenerateGeography, IBuilding } from '../../simulation/Geography'
import { IGovernment, ILaw, LawAxis } from '../../simulation/Government'
import { IEnterprise } from '../../simulation/Institutions'
import { MarketTraitListing } from '../../simulation/MarketTraits'
import { IPickup } from '../../simulation/Pickup'
import { IPlayerData } from '../../simulation/Player'
import { IDate, Season } from '../../simulation/Time'
import { IUFO } from '../../simulation/Ufo'
import { CreateEmptyEntitySlice, CreateEntitySlice, IEntitySlice } from '../entity.state'

export interface IWorldState {
  buildings: IEntitySlice<IBuilding>,
  enterprises: IEntitySlice<IEnterprise>,
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

export function GetBlankWorldState(): IWorldState{
  return {
    buildings: CreateEmptyEntitySlice<IBuilding>(),
    enterprises: CreateEmptyEntitySlice<IEnterprise>(),
    cities: CreateEntitySlice<ICity>([
      {
        ...GenerateGeography(),
        key: 0,
        name: 'string',
        deadBeanKeys: [],
        beanKeys: [],
        ufoKeys: [],
        pickupKeys: [],
        buildingKeys: [],
        pickupMagnetPoint: undefined,
        costOfLiving: 0,
        buildingMap: {}
      }
    ]),
    beans: CreateEmptyEntitySlice<IBean>(),
    ufos: CreateEmptyEntitySlice<IUFO>(),
    events: CreateEmptyEntitySlice<IEvent>(),
    pickups: CreateEmptyEntitySlice<IPickup>(),
    economy: {
      unfulfilledMonthlyDemand: { food: 0, shelter: 0, medicine: 0, fun: 0, },
      monthlyDemand: { food: 0, shelter: 0, medicine: 0, fun: 0, },
      monthlySupply: { food: 0, shelter: 0, medicine: 0, fun: 0, },
      market: {
        listings: {food: [], fun: [], medicine: [], shelter: []}
      }
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
      seenBeliefs: {},
      beliefInventory: [],
      speechcrimes: {},
      abductedBeans: [],
      energy: { amount: 16, income: 2/30},
      bots: { amount: 10, income: 2/30},
      hedons: { amount: 0, income: 0},
      // tortrons: { amount: 0, income: 0},
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
  }
}