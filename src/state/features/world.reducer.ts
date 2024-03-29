import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from '@reduxjs/toolkit/node_modules/immer/dist/types/types-external'
import { PlayerResources } from '../../Game'
import { GameStorageInstance } from '../../GameStorage'
import { MoverStoreInstance } from '../../MoverStoreSingleton'
import { SignalStoreInstance } from '../../SignalStore'
import { GetPriorities, IActivityData, IBean } from '../../simulation/Agent'
import { AgentDurationStoreInstance } from '../../simulation/AgentDurationInstance'
import { BeanBelievesIn, BeanCalculateSanity, BeanCalculateStamina, BeanCanPurchase, BeanDidWitnessCrime, BeanDie, BeanLoseSanity, BeanMaybeGetInsanity, CosmopolitanHappyChance, DiligenceHappyChance, GermophobiaHospitalWorkChance, HedonismExtraChance, HedonismHateWorkChance, LibertarianTaxUnhappyChance, ParochialHappyChance, ProgressivismTaxHappyChance } from '../../simulation/Bean'
import { BeanTryFindJob } from '../../simulation/BeanAndCity'
import { SecondaryBeliefData, TraitBelief } from '../../simulation/Beliefs'
import { BeanLoseJob, BuildingUnsetJob } from '../../simulation/City'
import { EconomyEmployAndPrice, EconomyMostInDemandJob, EconomyProduceAndPrice, EconomyTryTransact, IListing, IMarketReceipt, MarketListingSubtract } from '../../simulation/Economy'
import { BuildingTypes, HexPoint, hex_to_pixel, OriginAccelerator, Point, polarToPoint } from '../../simulation/Geography'
import { CrimeKey, CrimePunishment, IsActionIllegal, LawData, LawKey } from '../../simulation/Government'
import { EnterpriseType } from '../../simulation/Institutions'
import { MarketTraitListing } from '../../simulation/MarketTraits'
import { IPickup } from '../../simulation/Pickup'
import { HasResearched, PlayerCanAfford, PlayerPurchase, PlayerTryPurchase, PlayerUseTraitGem, Tech } from '../../simulation/Player'
import { GenerateIBuilding, IBuilding, IDwelling } from '../../simulation/RealEstate'
import { TicksPerDay } from '../../simulation/Time'
import { ITitle } from '../../simulation/Titles'
import { IUFO } from '../../simulation/Ufo'
import { MathClamp } from '../../simulation/Utils'
import { simulate_world, WorldAddEvent, WorldOnBeanDie } from '../../simulation/WorldSim'
import { EmotionSanity, EmotionWorth, GoodToThreshold, JobToGood, TraitEmote, TraitFaith, TraitGood } from '../../World'
import { DistrictAddLots, GenerateBean, GenerateDistrictsAndLots, GetRandom, GetRandomCityName, GetRandomFloat } from '../../WorldGen'
import { WorldSfxInstance } from '../../WorldSound'
import { EntityAddToSlice } from '../entity.state'
import { GetBlankWorldState, IWorldState } from './world'

const ChargePerMarket = 3;
const ChargePerExtract = 1;

const UnderemploymentThresholdTicks = 8
const BeanJailSentenceInDays = 2
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
      newGame: (state, action: PayloadAction<{seed: string}>) => {
        const city = state.cities.byID[0];
        state.seed = action.payload.seed;
        city.name = GetRandomCityName(state.seed);
        const dls = GenerateDistrictsAndLots(city);
        state.districts = dls.ds;
        state.lots = dls.lots;
        const natureID = GetRandom(state.seed, state.districts.allIDs.slice(1));
        state.districts.byID[natureID].kind = 'nature';
        // GenerateIBuilding(state, city, 'courthouse', {q: 0, r: 0}, state.economy);
        // GenerateIBuilding(state, city, 'nature', city.hexes[GetRandomNumber(state.seed, 15, 20)], state.economy);
        // GenerateIBuilding(state, city, 'nature', city.hexes[GetRandomNumber(state.seed, 21, 25)], state.economy);
        // GenerateIBuilding(state, city, 'nature', city.hexes[GetRandomNumber(state.seed, 26, 60)], state.economy);
      },
      loadGame: (state, action:PayloadAction<{newState: IWorldState}>) => {
        action.payload.newState.beans.allIDs.forEach(k => {
          const bean = action.payload.newState.beans.byID[k];
          if (bean){
            MoverStoreInstance.UpdatePosition('bean', k, {
              point: {
                x: bean.lastPoint?.x || 0,
                y: bean.lastPoint?.y || 0
              }, 
              velocity: {
                x: 0, 
                y: 0
              },
              hex: {
                q: bean.lastHex?.q || 0,
                r: bean.lastHex?.r || 0
              }
            }, {q: 0, r: 0});
          }
        })
        return action.payload.newState
      },
      build: (state, action: PayloadAction<{city: number, lot: number, what: BuildingTypes}>) => {
        const cost: PlayerResources = state.alien.difficulty.cost.emptyHex.build[action.payload.what];
        if (PlayerTryPurchase(state.alien, cost)) {
          const lot = state.lots.byID[action.payload.lot];
          const district = state.districts.byID[lot.districtKey];
          GenerateIBuilding(state, state.cities.byID[action.payload.city], action.payload.what, district, lot.point, lot.key, state.economy);
          switch(action.payload.what){
            case 'farm':
              WorldSfxInstance.play('moo');
              break;
            case 'hospital':
              WorldSfxInstance.play('pills');
              break;
            case 'house':
              WorldSfxInstance.play('door');
              break;
            case 'jail':
              WorldSfxInstance.play('siren');
              break;
            case 'graveyard':
              WorldSfxInstance.play('graveyard');
              break;
          }
        }
      },
      upgradeDistrict: (state, action: PayloadAction<{city: number, district: number}>) => {
        const district = state.districts.byID[action.payload.district];
        if (!district)
          return;
        const newKind = district.kind === 'rural' ? 'urban' : 'rural';
        if (newKind === 'rural'){
          const cost: PlayerResources = state.alien.difficulty.cost.hex.fallow_2_rural;
          if (PlayerTryPurchase(state.alien, cost)) {
            DistrictAddLots(district, state.lots, 'rural');
            district.kind = 'rural';
            WorldSfxInstance.play('develop');
          }
        } else {
          const cost: PlayerResources = state.alien.difficulty.cost.hex.rural_2_urban;
          if (PlayerTryPurchase(state.alien, cost)) {
            DistrictAddLots(district, state.lots, 'urban');
            district.kind = 'urban';
            WorldSfxInstance.play('urbanize');
          }
        }
      },
      changeEnterprise: (state, action: PayloadAction<{enterpriseKey: number, newType: EnterpriseType}>) => {
        state.enterprises.byID[action.payload.enterpriseKey].enterpriseType = action.payload.newType;
      },
      fireBean: (state, action: PayloadAction<{cityKey: number, beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        BeanLoseJob(bean, state);
      },
      upgrade: (state, action: PayloadAction<{buildingKey: number}>) => {
        const cost = state.alien.difficulty.cost.hex.upgrade;
        const what = state.buildings.byID[action.payload.buildingKey];
        if (PlayerTryPurchase(state.alien, cost)) {
          what.upgradedJobs = true;
        }
      },
      upgradeLoft: (state, action: PayloadAction<{buildingKey: number}>) => {
        const cost = state.alien.difficulty.cost.hex.add_loft;
        const what = state.buildings.byID[action.payload.buildingKey];
        if (PlayerTryPurchase(state.alien, cost)) {
          what.upgradedLoft = true;
          const loft: IDwelling = {
            key: 0,
            buildingKey: action.payload.buildingKey,
            kind: 'loft'
          }
          EntityAddToSlice(state.dwellings, loft);
          what.dwellingKeys = [loft.key];
        }
      },
      upgradeStorage: (state, action: PayloadAction<{buildingKey: number}>) => {
        const cost = state.alien.difficulty.cost.hex.upgrade;
        const what = state.buildings.byID[action.payload.buildingKey];
        if (PlayerTryPurchase(state.alien, cost)) {
          what.upgradedStorage = true;
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
            hex: {...action.payload.where},
            cityKey: action.payload.cityKey
          };
          state.ufos.allIDs.push(ufo.key);
          state.ufos.byID[ufo.key] = ufo;
          state.cities.byID[action.payload.cityKey].ufoKeys.push(ufo.key);
        }
      },
      remove_ufo: (state, action: PayloadAction<{ufoKey: number}>) => {
        const ufo = state.ufos.byID[action.payload.ufoKey];
        const newBean = GenerateBean(state, state.cities.byID[0], undefined, ufo.hex);
        newBean.priorities = GetPriorities(newBean, state.seed, state.date, state.cities.byID[newBean.cityKey], state.alien.difficulty);
        delete state.ufos.byID[action.payload.ufoKey];
        state.ufos.allIDs = state.ufos.allIDs.filter(x => x !== action.payload.ufoKey);
        state.cities.byID[ufo.cityKey].ufoKeys = state.cities.byID[ufo.cityKey].ufoKeys.filter(x => x !== action.payload.ufoKey);
        
        state.beans.byID[newBean.key] = newBean;
        state.beans.allIDs.push(newBean.key);
        state.cities.byID[ufo.cityKey].beanKeys.push(newBean.key);
        MoverStoreInstance.Get('bean', newBean.key).current = {
          point: hex_to_pixel(state.cities.byID[ufo.cityKey].district_hex_size, state.cities.byID[ufo.cityKey].petriOrigin, ufo.hex), 
          hex: {
            ...ufo.hex
          },
          velocity: {x: 0, y: 0}
        };
      },
      abduct: (state, action: PayloadAction<{beanKey: number}>) => {
        if (PlayerTryPurchase(state.alien, state.alien.difficulty.cost.bean.abduct)) {
          const bean = state.beans.byID[action.payload.beanKey];
          if (bean.lifecycle === 'alive'){
            bean.lifecycle = 'abducted';
            if (bean.employerEnterpriseKey){
              const building = state.buildings.byID[bean.employerEnterpriseKey];
              BuildingUnsetJob(building, bean);
            }
            state.cities.byID[bean.cityKey].beanKeys = state.cities.byID[bean.cityKey].beanKeys.filter(x => x !== bean.key);
            state.alien.abductedBeanKeys.push(bean.key);
          }
        }
      },
      cheatAdd: (state) => {
        state.alien.energy.amount += 10;
        state.alien.bots.amount += 10;
        state.alien.hedons.amount += 10;
      },
      release: (state) => {
        if (state.alien.abductedBeanKeys.length > 0) {
          const lucky_bean_key = state.alien.abductedBeanKeys.shift();
          if (lucky_bean_key != null){
            const luckyBean = state.beans.byID[lucky_bean_key];
            luckyBean.lifecycle = 'alive';
            state.cities.byID[luckyBean.cityKey].beanKeys.push(lucky_bean_key);
          }
        }

      },
      washCommunity: (state, action: PayloadAction<{beanKey: number, faith: TraitFaith}>) => {
        // if (bean.canPurchase(state.alien.difficulty.cost.bean_brain.brainwash_ideal, 0)) {
        //   bean.loseSanity(state.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0);
        //   if (bean.community === 'ego')
        //     bean.community = 'state';
        //   else bean.community = 'ego';
        //   return true;
        // }
      },
      washMotive: () => {

        // if (bean.canPurchase(state.alien.difficulty.cost.bean_brain.brainwash_ideal, 0)) {
        //   bean.loseSanity(state.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0);
        //   if (bean.ideals === 'prog')
        //     bean.ideals = 'trad';
        //   else bean.ideals = 'prog';
        //   this.setState({ world: state });
        //   return true;
        // }
      },
      washNarrative: (state, action: PayloadAction<{beanKey: number, faith: TraitFaith}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (BeanCanPurchase(bean, state.alien.difficulty.cost.bean_brain.brainwash_ideal, 0)) {
          BeanLoseSanity(bean, state.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0);
          const oldFaith = bean.faith;
          while (bean.faith === oldFaith){
            bean.faith = GetRandom(state.seed, ['rocket', 'dragon', 'music', 'noFaith']);
          }
        }
      },
      washBelief: (state, action: PayloadAction<{beanKey: number, trait: TraitBelief}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        const sanityCostBonus = HasResearched(state.alien.techProgress, 'sanity_bonus') ? -1 : 0;
        if (BeanCanPurchase(bean, state.alien.difficulty.cost.bean_brain.brainwash_secondary, sanityCostBonus)) {
          BeanLoseSanity(bean, state.alien.difficulty.cost.bean_brain.brainwash_secondary.sanity || 0);
          bean.sanity = BeanCalculateSanity(bean, state.alien.difficulty);
          bean.beliefs.splice(
            bean.beliefs.indexOf(action.payload.trait), 1
          );
          state.insanityEvent = BeanMaybeGetInsanity(state.seed, bean);
          if (state.insanityEvent){
            bean.beliefs = [...bean.beliefs, state.insanityEvent.newInsanity];
            WorldSfxInstance.play('crazy_laugh');
          } else {
            WorldSfxInstance.play('wash_out');
          }
        }
      },
      extractBelief: (state, action: PayloadAction<{beanKey: number, trait: TraitBelief}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        const sanityCostBonus = HasResearched(state.alien.techProgress, 'sanity_bonus') ? -1 : 0;
        if (BeanCanPurchase(bean, state.alien.difficulty.cost.bean_brain.brainwash_secondary, sanityCostBonus)) {
          BeanLoseSanity(bean, state.alien.difficulty.cost.bean_brain.brainwash_secondary.sanity || 0);
          bean.sanity = BeanCalculateSanity(bean, state.alien.difficulty);
          const existing = state.alien.beliefInventory.find((x) => x.trait === action.payload.trait);
          const chargeBonus = HasResearched(state.alien.techProgress, 'neural_duplicator') ? 1 : 0;
          if (existing) {
            existing.gems += ChargePerExtract + chargeBonus;
          } else {
            state.alien.beliefInventory.push({trait: action.payload.trait, gems: ChargePerExtract + chargeBonus});
          }
          state.insanityEvent = BeanMaybeGetInsanity(state.seed, bean);
          if (state.insanityEvent){
            bean.beliefs = [...bean.beliefs, state.insanityEvent.newInsanity];
            WorldSfxInstance.play('crazy_laugh');
          } else {
            WorldSfxInstance.play('wash_out');
          }
        }
      },
      acknowledgeNewInsanity: (state) =>{
        state.insanityEvent = undefined;
      },
      setResearch: (state, action: PayloadAction<{t: Tech}>) => {
        state.alien.currentlyResearchingTech = action.payload.t;
      },
      implant: (state, action: PayloadAction<{beanKey: number, trait: TraitBelief}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        const sanityCostBonus = HasResearched(state.alien.techProgress, 'sanity_bonus') ? -1 : 0;
        if (BeanCanPurchase(bean, state.alien.difficulty.cost.bean_brain.brainimplant_secondary, sanityCostBonus) && 
          state.alien.beliefInventory.filter(x => x.trait === action.payload.trait && x.gems > 0)) {
          bean.beliefs.push(action.payload.trait);
          PlayerUseTraitGem(state.alien, action.payload.trait);
          BeanLoseSanity(bean, state.alien.difficulty.cost.bean_brain.brainimplant_secondary.sanity || 0); 
          bean.sanity = BeanCalculateSanity(bean, state.alien.difficulty);
          state.insanityEvent = BeanMaybeGetInsanity(state.seed, bean);
          if (state.insanityEvent){
            bean.beliefs = [...bean.beliefs, state.insanityEvent.newInsanity];
            WorldSfxInstance.play('crazy_laugh');
          } else {
            WorldSfxInstance.play('wash_in');
          }
        }
      },
      scan: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (PlayerTryPurchase(state.alien, state.alien.difficulty.cost.bean.scan)) {
          state.alien.scanned_bean[bean.key] = true;
          bean.beliefs.forEach((b) => {
            if (!state.alien.seenBeliefs[b]){
              state.alien.seenBeliefs[b] = true;
              SignalStoreInstance.newTraitSeen.publish({k: SecondaryBeliefData[b].noun, v: true});
            }
          });
          bean.faceOverrideTicks = 4;
          bean.faceOverride = '😨';
          WorldSfxInstance.play('scan');
        }
      },
      vaporize: (state, action: PayloadAction<{beanKey: number}>) => {
        if (PlayerTryPurchase(state.alien, state.alien.difficulty.cost.bean.vaporize)) {
          const bean = state.beans.byID[action.payload.beanKey];
          const d = BeanDie(bean, state.seed, 'vaporization');
          WorldOnBeanDie(state, bean, d.death, d.emotes);
        }
      },
      setCrimeLegality: (state, action: PayloadAction<{crime: CrimeKey, legality: CrimePunishment|'none'|undefined}>) => {
        if (action.payload.legality === 'none')
          action.payload.legality = undefined;
        state.law.crimes[action.payload.crime] = action.payload.legality;
      },
      pickUpPickup: (state, action: PayloadAction<{cityKey: number, pickupKey: number}>) => {
        const pickup = state.pickups.byID[action.payload.pickupKey];

        const amt = EmotionWorth[pickup.type];
        state.alien.hedons.amount += amt;
        state.cities.byID[action.payload.cityKey].pickupKeys = state.cities.byID[action.payload.cityKey].pickupKeys.filter(x => x != action.payload.pickupKey);
        state.pickups.allIDs = state.pickups.allIDs.filter(x => x != action.payload.pickupKey);
        delete state.pickups.byID[action.payload.pickupKey];
        
        SignalStoreInstance.alienHedons.publish({change: amt});
        WorldSfxInstance.play(pickup.type);
      },
      changeState: (state, action: PayloadAction<{beanKey: number, newState: IActivityData}>) => {
        _changeState(state, action)
      },
      beanHitDestination: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        if (bean.actionData.destinationIndex != null){
          bean.actionData.destinationIndex++;
        }
      },
      beanBePersuaded: (state, action: PayloadAction<{beanKey: number, belief: TraitBelief}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        
        bean.beliefs.push(action.payload.belief);
        WorldAddEvent(state, {
            key: 0,
            icon: '🗣️', 
            trigger: 'persuasion', 
            message: `${bean.name} now believes in ${SecondaryBeliefData[action.payload.belief].icon} ${SecondaryBeliefData[action.payload.belief].noun}!`, 
            beanKey: bean.key, cityKey: bean.cityKey,
            point: bean.lastPoint
        });
        WorldSfxInstance.play('mhmm')
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
            if (bean.ticksSinceLastSale > UnderemploymentThresholdTicks && bean.employerEnterpriseKey != null){
                const employer = state.enterprises.byID[bean.employerEnterpriseKey];
                // underemployment
                if (employer.ownerBeanKey != bean.key && Math.random() > 0.5) {
                    const newJob = EconomyMostInDemandJob(state.economy);
                    if (newJob){
                      BeanTryFindJob(state, bean, bean.employerEnterpriseKey);
                      bean.ticksSinceLastSale = 0;
                    }
                }
            }
            let workedForEmployer = false;
            if (bean.employerEnterpriseKey != null){
                const employer = state.enterprises.byID[bean.employerEnterpriseKey];
                if (employer && employer.buildingKey != null){
                    const building = state.buildings.byID[employer.buildingKey];
                    EconomyEmployAndPrice(state.economy, employer, building, JobToGood(bean.job), 4, employer.projectedPrice);
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
      beanCrime: (state, action: PayloadAction<{beanKey: number, good: 'food'|'medicine'}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        const crime: CrimeKey = 'steal';
        
        const listing = GetRandom(state.seed, state.economy.market.listings[action.payload.good]);
        if (listing == null){
        } else {
          //give the stealer stolen goods
          const stolen = Math.min(listing.quantity, 3);
          MarketListingSubtract(state.economy.market, listing, action.payload.good, stolen);
          switch(action.payload.good){
              case 'food':
                  bean.discrete_food += stolen;
                  break;
              case 'medicine':
                  bean.discrete_health += stolen;
                  break;
          }
          //make the stolen-from bean sad
          if (listing.sellerEnterpriseKey != null){
            const enterprise = state.enterprises.byID[listing.sellerEnterpriseKey];
            let unluckyBean: IBean|undefined = undefined;
            if (enterprise.enterpriseType === 'company'){
              const ownerKey = enterprise.ownerBeanKey;
              if (ownerKey != null && action.payload.beanKey != ownerKey){
                unluckyBean = state.beans.byID[ownerKey];
              }
            } else {
              const beanKeys = state.beans.allIDs.filter(b => b != action.payload.beanKey && state.beans.byID[b].lifecycle === 'alive' && state.beans.byID[b].employerEnterpriseKey === listing.sellerEnterpriseKey);
              const unluckyBeanKey = GetRandom(state.seed, beanKeys);
              unluckyBean = state.beans.byID[unluckyBeanKey];
            }
            if (unluckyBean){
              unluckyBean.faceOverride = '🥺';
              unluckyBean.faceOverrideTicks = 4;
              _emote(unluckyBean, state, {emote: 'unhappiness', source: 'Theft Victim'});
            }
          }
          if (IsActionIllegal(state.law, crime)){
            // see if the stealer is caught
            const bucket = bean.lastHex ? MoverStoreInstance.GetOtherKeysInHexBin('bean', action.payload.beanKey, bean.lastHex) : state.beans.allIDs.filter(b => b != action.payload.beanKey);
            const witnessCandidateBeanKeys = bucket.filter(b => state.beans.byID[b].lifecycle === 'alive');
            const witnesses: IBean[] = witnessCandidateBeanKeys.reduce((arr, bK) => {
              const person = state.beans.byID[bK];
              const wasWitness = BeanDidWitnessCrime(person, state.seed, action.payload.beanKey);
              if (wasWitness)
                arr.push(person);
              return arr;
            }, [] as Array<IBean>);
            if (witnesses.length){
              WorldAddEvent(state, {
                icon: '🤠',
                key: 0,
                message: `${bean.name} was caught stealing ${action.payload.good}!`,
                trigger: 'crimecrime',
                beanKey: bean.key
              });
              WorldSfxInstance.play('siren');
            } else {
              WorldSfxInstance.play('crime');
            }
            witnesses.forEach((witness) => {
              _changeState(state, {
                payload: {
                  beanKey: witness.key,
                  newState: {
                    act: 'chase',
                    chase: {
                      targetBeanKey: action.payload.beanKey,
                      type: 'arrest',
                      crime: crime
                    },
                    intent: {
                      act: 'assault',
                      assault: {
                        perpBeanKey: witness.key,
                        assaultType: 'arrest',
                        victimBeanKey: action.payload.beanKey,
                        crime: crime
                      },
                      intent: witness.actionData
                    }
                  }
                }, type: ''
              });
            });
          }
        }
      },
      beanArrest: (state, action: PayloadAction<{criminalBeanKey: number, crime: CrimeKey}>) => {
        const criminal = state.beans.byID[action.payload.criminalBeanKey];
        const punishment = state.law.crimes[action.payload.crime];
        if (punishment){
          switch(punishment){
            case 'death': {
              const d = BeanDie(criminal, state.seed, 'execution');
              WorldOnBeanDie(state, criminal, d.death, d.emotes);
              break;
            }
            case 'jail': {
              WorldSfxInstance.play('handcuffs');
              criminal.lifecycle = 'incarcerated';
              criminal.jailTicksLeft = TicksPerDay * BeanJailSentenceInDays;
              const randAngle = GetRandomFloat(state.seed) * Math.PI * 2;
              const point = polarToPoint({ az: randAngle, r: 30});
              const jailPoint = {
                x: state.districts.byID[1].point.x + point.x,
                y: state.districts.byID[1].point.y + point.y
              };
              criminal.lastPoint = jailPoint;
              const hexes = state.districts.byID[1].hexString.split(',').map(x => parseInt(x));
              const jailHex = {
                q: hexes[0],
                r: hexes[1]
              };
              MoverStoreInstance.UpdatePosition('bean', criminal.key, {
                point: {...jailPoint}, 
                velocity: {...OriginAccelerator.velocity},
                hex: { ... jailHex },
              }, criminal.lastHex || {q: 0, r: 0});
              criminal.lastHex = jailHex;
              break;
            }
          }
        }
        state.beans.allIDs.forEach((b) => {
          const bean = state.beans.byID[b];
          if (bean.actionData.act === 'chase' && 
            bean.actionData.chase &&
            bean.actionData.chase.targetBeanKey === criminal.key){
            bean.actionData.chase.targetBeanKey = undefined; //make the other beans give up the chase
          }
        })
      },
      beanRelax: (state, action: PayloadAction<{beanKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        bean.discrete_fun += 1;
        _emote(bean, state, {emote: 'happiness', source: 'Relaxation'});
        if (BeanBelievesIn(bean, 'Naturalism'))
          _emote(bean, state, {emote: 'happiness', source: 'Naturalism'});
      },
      enactLaw: (state, action: PayloadAction<{lawKey: LawKey}>) => {
        const data = LawData[action.payload.lawKey];
        state.law.lawTree[data.axis] = data;
      },
      repealLaw: (state, action: PayloadAction<{lawKey: LawKey}>) => {
        const data = LawData[action.payload.lawKey];
        delete state.law.lawTree[data.axis];
      },
      beanInter: (state, action: PayloadAction<{bean: number, graveyard: number}>) => {
        const grave = state.buildings.byID[action.payload.graveyard];
        const bean = state.beans.byID[action.payload.bean]
        if (grave && bean && grave.interredBeanKeys){
          grave.interredBeanKeys.push(bean.key);
          const city = state.cities.byID[bean.cityKey];
          city.beanKeys = city.beanKeys.filter(x => x != bean.key);
        }
      },
    buyBots: (state, action: PayloadAction<{amount: number}>) => {
      const cost = state.alien.difficulty.cost.market.resource.bots;
      if (PlayerTryPurchase(state.alien, cost, action.payload.amount)) {
        state.alien.bots.amount += action.payload.amount;
      }
    },
    buyEnergy: (state, action: PayloadAction<{amount: number}>) => {
      const cost = state.alien.difficulty.cost.market.resource.bots;
      if (PlayerTryPurchase(state.alien, cost, action.payload.amount)) {
        state.alien.energy.amount += action.payload.amount;
      }
    },
    scrubHedons: (state) => {
      const cost = state.alien.difficulty.cost.market.scrubHedons;
      if (PlayerTryPurchase(state.alien, cost)) {
        const old = state.alien.hedons.amount;
        state.alien.hedons.amount = 0;
      }
    },
    buyTrait: (state, action: PayloadAction<{l: MarketTraitListing}>) => {
      if (PlayerTryPurchase(state.alien, action.payload.l.cost)) {
        const existing = state.alien.beliefInventory.find((x) => x.trait === action.payload.l.trait);
        if (existing) {
          existing.gems += ChargePerMarket;
        } else
          state.alien.beliefInventory.push({trait: action.payload.l.trait, gems: ChargePerMarket});
      }
    },
      beanBuy: (state, action: PayloadAction<{beanKey: number, good: TraitGood}>) =>{
        const bean = state.beans.byID[action.payload.beanKey];
        const getSeller = (l: IListing) => {
          if (l.sellerEnterpriseKey != null)
            return state.enterprises.byID[l.sellerEnterpriseKey];
          else if (l.sellerBeanKey)
            return state.beans.byID[l.sellerBeanKey];
          else
            return state.law;
        }
        let receipt: IMarketReceipt|undefined;
        switch(action.payload.good){
          case 'food':
            receipt = EconomyTryTransact(state.economy, state.law, bean, 'food', getSeller, 0.5, 3);
            if (receipt?.bought) {
                bean.discrete_food += receipt.bought;
                if (bean.food === 'stuffed'){
                    _emote(bean, state, {emote:'happiness', source: 'Stuffed'});
                    _ifBelievesInMaybeEmote(state, bean, 'Gluttony', 'happiness', 1);
                }
            }
            break;
          // case 'shelter':
          //   receipt = EconomyTryTransact(state.economy, state.law, bean, 'shelter', getSeller);
          //   if (receipt?.bought) {
          //       bean.discrete_stamina = 10;
          //       bean.stamina = 'awake';
          //   } else if (bean.discrete_stamina <= 0){
          //       bean.stamina = 'homeless';
          //   }
          //   break;
          case 'medicine':
            receipt = EconomyTryTransact(state.economy, state.law, bean, 'medicine', getSeller, 0.5, 3);
            if (receipt?.bought){
                bean.discrete_health += receipt.bought;
                if (bean.health === 'fresh')
                    _emote(bean, state, {emote:'happiness', source: 'Robust'});
            }
            break;
          case 'fun':
            receipt = EconomyTryTransact(state.economy, state.law, bean, 'fun', getSeller);
            if (receipt?.bought) {
                bean.discrete_fun = 1;
                _emote(bean, state, {emote:'happiness', source:'Entertainment'});
                _emote(bean, state, {emote:'happiness', source:'Entertainment'});
            }
            break;
        }
        bean.actionData.buyAttempts = (bean.actionData.buyAttempts || 0) + 1;
        if (receipt){
          WorldSfxInstance.play('cash');
          if (receipt.tax){
            _ifBelievesInMaybeEmote(state, bean, 'Libertarianism', 'unhappiness', LibertarianTaxUnhappyChance);
            _ifBelievesInMaybeEmote(state, bean, 'Progressivism', 'happiness', ProgressivismTaxHappyChance);
          }
          bean.actionData.buyReceipt = receipt;
        }
      },
      addTitle: (state, action: PayloadAction<{}>) => {
        EntityAddToSlice(state.titles, {
          key: 0,
          name: 'Title',
          privileges: []
        })
      },
      editTitle: (state, action: PayloadAction<{newT: ITitle}>) => {
        const oldTitle = state.titles.byID[action.payload.newT.key];
        state.titles.byID[action.payload.newT.key] = action.payload.newT;
        if (oldTitle && oldTitle.badge != action.payload.newT.badge){
          state.beans.allIDs.forEach((x) => {
            if (state.beans.byID[x].titleKey === oldTitle.key)
              state.beans.byID[x].badge = action.payload.newT.badge;
          });
        }
        if (oldTitle && oldTitle.headwear != action.payload.newT.headwear){
          state.beans.allIDs.forEach((x) => {
            if (state.beans.byID[x].titleKey === oldTitle.key)
              state.beans.byID[x].hat = action.payload.newT.headwear;
          });
        }
      },
      manualSave: (state) => {
        GameStorageInstance.SaveGame(state);
      },
      beanSetTitle: (state, action: PayloadAction<{beanKey: number, titleKey: number}>) => {
        const bean = state.beans.byID[action.payload.beanKey];
        bean.titleKey = action.payload.titleKey;
        const title = state.titles.byID[action.payload.titleKey];
        bean.badge = title.badge;
        bean.hat = title.headwear;
      }
    }
  });

function _changeState(state: WritableDraft<IWorldState>, action: { payload: { beanKey: number; newState: IActivityData }; type: string }) {
  const oldAct = state.beans.byID[action.payload.beanKey].action;
  const bean = state.beans.byID[action.payload.beanKey];
  const ADS = AgentDurationStoreInstance.Get('bean', bean.key);
  if (oldAct === 'chat')
    bean.lastChatMS = Date.now()
  if (oldAct === 'sleep') {
    bean.discrete_stamina = 7
    BeanCalculateStamina(bean, state.alien.difficulty)
  }
  if (action.payload.newState.act === 'idle') {
    bean.priorities = GetPriorities(bean, state.seed, state.date, state.cities.byID[bean.cityKey], state.alien.difficulty)
  }
  bean.activity_duration[oldAct] += ADS.elapsed;
  bean.action = action.payload.newState.act;
  bean.actionData = action.payload.newState;
  const p = MoverStoreInstance.Get('bean', bean.key).current?.point;
  if (p && !isNaN(p.x) && !isNaN(p.y)) {
    bean.lastPoint = {
      ...p
    };
  }
  ADS.elapsed = 0;
}

  function _ifBelievesInMaybeEmote(state: IWorldState, bean: IBean, source: TraitBelief, emote: TraitEmote, chance: number){
    if (BeanBelievesIn(bean, source) && Math.random() < chance){
      _emote(bean, state, {emote: emote, source: source});
    }
  }
  function _emote(bean: IBean, state: IWorldState, payload: {emote: TraitEmote, source: string}){
    bean.discrete_sanity = MathClamp(bean.discrete_sanity + EmotionSanity[payload.emote], 0, 10);
    bean.hedonHistory[0][payload.source] = (bean.hedonHistory[0][payload.source] || 0) + EmotionWorth[payload.emote];
    
    const beanPosition = MoverStoreInstance.Get('bean', bean.key).current || OriginAccelerator;

    const pickup: IPickup = {
        key: state.pickups.nextID++,
        point: {
          x: beanPosition.point.x,
          y: beanPosition.point.y
        },
        type: payload.emote,
        velocity: {x: 0, y: 0}
    };
    state.cities.byID[bean.cityKey].pickupKeys.push(pickup.key);
    state.pickups.byID[pickup.key] = pickup; 
    state.pickups.allIDs.push(pickup.key);
    MoverStoreInstance.Get('pickup', pickup.key).publish({
      point: {
        x: beanPosition.point.x,
        y: beanPosition.point.y
      },
      hex: {
        q: beanPosition.hex.q,
        r: beanPosition.hex.r
      },
      velocity: {x: 0, y: 0}
    });
  }
  
  export const { 
    refreshMarket, magnetChange, worldTick, 
    remove_ufo, upgradeDistrict,
    newGame, loadGame, build, changeEnterprise, fireBean, upgrade, upgradeLoft, upgradeStorage, beam,
    abduct, release, scan, vaporize, pickUpPickup,
    implant, washBelief, washNarrative, washCommunity, washMotive,extractBelief,
    changeState, beanEmote, beanGiveCharity, beanHitDestination, beanWork, beanRelax, beanBuy, beanCrime,beanArrest,
    beanBePersuaded, cheatAdd, manualSave, setCrimeLegality, beanInter,
    addTitle, editTitle, beanSetTitle, acknowledgeNewInsanity,
    enactLaw, repealLaw, setResearch, buyBots, buyEnergy, buyTrait, scrubHedons
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

  
