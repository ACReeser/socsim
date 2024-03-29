import { IEvent } from '../../events/Events'
import { DefaultDifficulty } from '../../Game'
import { IBean } from '../../simulation/Agent'
import { InsanityTraits } from '../../simulation/Beliefs'
import { ICity } from '../../simulation/City'
import { IEconomy } from '../../simulation/Economy'
import { IDistrict, ILot } from '../../simulation/Geography'
import { CrimeKey, CrimePunishment, IGovernment, IGovPolicy, LawAxis } from '../../simulation/Government'
import { IEnterprise } from '../../simulation/Institutions'
import { MarketTraitListing } from '../../simulation/MarketTraits'
import { IPickup } from '../../simulation/Pickup'
import { IPlayerData } from '../../simulation/Player'
import { IBuilding, IDwelling } from '../../simulation/RealEstate'
import { IDate, Season } from '../../simulation/Time'
import { ITitle } from '../../simulation/Titles'
import { IUFO } from '../../simulation/Ufo'
import { GenerateCity } from '../../WorldGen'
import { CreateEmptyEntitySlice, CreateEntitySlice, IEntitySlice } from '../entity.state'

export interface IWorldState {
  buildings: IEntitySlice<IBuilding>,
  enterprises: IEntitySlice<IEnterprise>,
  cities: IEntitySlice<ICity>,
  beans: IEntitySlice<IBean>,
  ufos: IEntitySlice<IUFO>,
  events: IEntitySlice<IEvent>,
  pickups: IEntitySlice<IPickup>,
  districts: IEntitySlice<IDistrict>,
  lots: IEntitySlice<ILot>,
  titles: IEntitySlice<ITitle>,
  dwellings: IEntitySlice<IDwelling>,
  economy: IEconomy,
  law: IGovernment,
  marketTraitsForSale: MarketTraitListing[],
  date: IDate,
  alien: IPlayerData,
  spotlightEvent: IEvent | undefined,
  insanityEvent: {beanKey: number, newInsanity: InsanityTraits}|undefined,
  /**
   * 1-based ID of save slot (1-3)
   */
  saveSlot: number,
  seed: string
}

export function GetBlankWorldState(seed: string = 'abcdef'): IWorldState{
  return {
    buildings: CreateEmptyEntitySlice<IBuilding>(),
    enterprises: CreateEmptyEntitySlice<IEnterprise>(),
    cities: CreateEntitySlice<ICity>([
      GenerateCity()
    ]),
    beans: CreateEmptyEntitySlice<IBean>(),
    ufos: CreateEmptyEntitySlice<IUFO>(),
    events: CreateEmptyEntitySlice<IEvent>(),
    pickups: CreateEmptyEntitySlice<IPickup>(),
    lots: CreateEmptyEntitySlice<ILot>(),
    districts: CreateEmptyEntitySlice<IDistrict>(),
    titles: CreateEmptyEntitySlice<ITitle>(),
    dwellings: CreateEmptyEntitySlice<IDwelling>(),
    economy: {
      unfulfilledMonthlyDemand: { food: 0, medicine: 0, fun: 0, },
      monthlyDemand: { food: 0, medicine: 0, fun: 0, },
      monthlySupply: { food: {avgUnitPrice: 1, totalQty: 0}, medicine: {avgUnitPrice: 1, totalQty: 0}, fun: {avgUnitPrice: 1, totalQty: 0}, },
      market: {
        listings: {
          food: [], fun: [], medicine: []
          //, shelter: []
        }
      }
    },
    law: {
      cash: 0,
      lawTree: {} as {[key in LawAxis]: IGovPolicy|undefined},
      crimes: {
        'murder': 'jail',
        'destroy': 'jail',
        'hurt': 'jail',
        'rob': 'jail',
        'steal': 'jail',
      } as {[key in CrimeKey]: CrimePunishment|undefined},
      laws: [] as IGovPolicy[],
      ticksSinceLastSale: 0
    },
    date: {year: 1, season: Season.Spring, day: 1, hour: 1},
    marketTraitsForSale: [],
    alien: {
      scanned_bean: {},
      seenBeliefs: {},
      beliefInventory: [],
      speechcrimes: {},
      abductedBeanKeys: [],
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
    spotlightEvent: undefined,
    insanityEvent: undefined,
    saveSlot: 1,
    seed: seed
  }
}