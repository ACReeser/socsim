import { AnyAction } from "@reduxjs/toolkit";
import { IDifficulty } from "../Game";
import { MoverStoreInstance } from "../MoverStoreSingleton";
import { IWorldState } from "../state/features/world";
import { beanArrest, beanBePersuaded, beanBuy, beanCrime, beanEmote, beanHitDestination, beanRelax, beanWork, changeState } from "../state/features/world.reducer";
import { BeanPhysics, GoodIcon, JobToGood, TraitCommunity, TraitEthno, TraitFaith, TraitFood, TraitGood, TraitHealth, TraitHousing, TraitIdeals, TraitJob, TraitSanity, TraitStamina } from "../World";
import { GetRandomNumber } from "../WorldGen";
import { BeanBelievesIn, BeanGetRandomChat, BeanMaybeChat, BeanMaybeCrime, BeanMaybeParanoid, BeanMaybePersuaded, BeanMaybeScarcity } from "./Bean";
import { HedonExtremes, HedonReport, HedonSourceToVal, TraitBelief } from "./Beliefs";
import { CityGetNearestNeighbors, CityGetRandomBuildingOfType, CityGetRandomEntertainmentBuilding, CityGetRandomHomelessSleepingBuilding, ICity } from "./City";
import { EconomyCanBuy, IMarketReceipt, ISeller } from "./Economy";
import { accelerate_towards, BuildingTypes, GoodToBuilding, HexPoint, hex_linedraw, hex_to_pixel, JobToBuilding, OriginAccelerator, pixel_to_hex, Point, point_normalize } from "./Geography";
import { CrimeKey } from "./Government";
import { IBuilding } from "./RealEstate";
import { DateGetActivityPeriodIndex, IDate, TickSpeedMS, TicksPerPeriod } from "./Time";
import { MathClamp, SampleNormalDistribution, StatsNormalDev, StatsNormalMean } from "./Utils";

export type Act = 'travel'|'work'|'sleep'|'chat'|'soapbox'|'craze'|'idle'|'buy'|'crime'|'relax'|'chase'|'assault';

/**
 * cruise == interruptible travel towards destination
 * 
 * approach == uninterruptible travel into destination slot
 export type Travel = 'cruise'|'approach';
 */

export type RecreationActivity = 'performance'|'artistry'|'sport'|'game'|'relax';
export type RecPerformType = 'sing'|'dance'|'act'|'drum'|'guitar'|'piano'|'horn';
export type RecArtType = 'paint'|'write'|'sculpt';
export type RecSportType = 'soccer'|'basketball'|'hockey'|'tennis'|'baseball'|'cricket';
export type RecGameType = 'chess'|'cards'|'boardgames';
export type RecRelaxType = 'watch'|'read'|'hike'|'swim'|'fish';

// 🎤 🩰 🎭 🥁 🎸 🎹 🎺
// 🎨 🖋️ 🏺
// ⚽️ 🏀 🏒 🎾 ⚾ 🏏
// ♟️ 🃏 🎲
// 📺 📚 🎒 🤿 🎣


export enum ActivityPeriod {
    Rest = 1,
    Chores = 2,
    Work = 3,
    Play = 4
};

export const ActivityPeriodMetadata = {
    [ActivityPeriod.Rest]: {
        icon: '💤',
        class: 'a-p-rest',
    },
    [ActivityPeriod.Chores]: {
        icon: '🛍️',
        class: 'a-p-chores',
    },
    [ActivityPeriod.Work]: {
        icon: '💪',
        class: 'a-p-work',
    },
    [ActivityPeriod.Play]: {
        icon: '⚽',
        class: 'a-p-play',
    }
}


export interface IActivityData {
    act: Act;
    elapsed?: number;
    destinations?: Point[]; //point to travel to??
    destinationIndex?: number; //which point are we heading towards
    intent?: IActivityData; //when travelling, what do you intend to do next
    good?: TraitGood; //good to buy or work
    crimeGood?: 'food'|'medicine';
    chat?: IChatData;
    buyAttempts?: number;
    buyReceipt?: IMarketReceipt;
    chase?: {
        targetBeanKey?: number,
        type: 'arrest'|'rob'|'murder'|'assault',
        crime: CrimeKey
    },
    assault? : {
        perpBeanKey: number;
        victimBeanKey: number;
        assaultType: 'arrest'|'rob'|'murder'|'assault';
        crime: CrimeKey
    }
}

export interface IPrioritizedActivityData extends IActivityData{
    priority: number;
}

export interface IChatData{
    participation: 'speaker'|'listener';
    type: 'praise'|'bully'|'preach'|'gift';
    preachBelief?: TraitBelief;
    /**
     * strength of the preacher's persuasion
     */
    persuasionStrength?: number;
    /**
     * target key of the bean who is targeted for praise or bully
     */
    targetBeanKey?: number;
}

export interface IBeanAgent{
    key: number;
    action: Act;
    actionData: IActivityData;
    priorities: IPrioritizedActivityData[];
    actionClock: ActivityPeriod[]
}
export interface StateFunctions {
    enter: (agent: IBean) => AnyAction|undefined;
    act: (agent: IBean, world: IWorldState, elapsed: number, deltaMS: number) => {action?: AnyAction|AnyAction[], newActivity?: IActivityData};
    exit: (agent: IBean, seed: string) => AnyAction|undefined;
}
const RelaxationDurationMS = 3000;
const CrimeDurationMS = TickSpeedMS;
const TransactMaximumDurationMS = 1100;
const ChatDurationMS = 1000;
const WorkDurationMS = TickSpeedMS * TicksPerPeriod / 2;
const SleepDurationMS = TickSpeedMS * TicksPerPeriod / 2;
const AssaultDurationMS = TickSpeedMS;
const CatatoniaWalkSpeedPercentage = 0.4;

const ChaseGiveUpTimeMS = 15000;
const AvoidanceScale = 0.78;
const AvoidanceClamp = 0.07;
export const BeanActions: {[act in Act]: StateFunctions} = {
    'travel': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world: IWorldState, elapsed: number, deltaMS: number) => {
            const city = world.cities.byID[agent.cityKey];
            const destinationTargetIndex = agent.actionData.destinationIndex || 0;
            if (agent.actionData.destinations == null || 
                agent.actionData.destinations.length === 0 || 
                destinationTargetIndex >= agent.actionData.destinations.length){
                if (agent.actionData.intent)
                    return {
                        newActivity: agent.actionData.intent
                    }
                else
                    return {
                        newActivity: {
                            act: 'idle'
                        }
                    }
            }
            const target = agent.actionData.destinations[destinationTargetIndex];

            if (isNaN(target.x) || isNaN(target.y)) {
                //sanity check
                console.warn('NaN destination, resetting to idle')
                return {
                    newActivity: {
                        act: 'idle'
                    }
                };
            }
            const oldAccelerator = MoverStoreInstance.Get('bean', agent.key).current || OriginAccelerator;
            const newAccelerator = {
                ...oldAccelerator
            };

            const collide = accelerate_towards(
                newAccelerator,
                city,
                target,
                BeanPhysics.AccelerateS * (BeanBelievesIn(agent, 'Catatonia') ? CatatoniaWalkSpeedPercentage : 1) * deltaMS/1000, 
                BeanPhysics.MaxSpeed, 
                BeanPhysics.CollisionDistance,
                BeanPhysics.Brake, () => {
                    return MoverStoreInstance.GetOthersInHexBin('bean', agent.key, oldAccelerator.hex).reduce((vec, sib) => {
                        const delta = {
                            x: sib.point.x - oldAccelerator.point.x, 
                            y: sib.point.y - oldAccelerator.point.y
                        };
                        point_normalize(delta);
                        vec.x = MathClamp(delta.x * AvoidanceScale + vec.x, -AvoidanceClamp, AvoidanceClamp);
                        vec.y = MathClamp(delta.y * AvoidanceScale + vec.y, -AvoidanceClamp, AvoidanceClamp);
                        return vec;
                    }, {x: 0, y: 0} as Point)
                });

            MoverStoreInstance.UpdatePosition('bean', agent.key, newAccelerator, oldAccelerator.hex);
            
            if (collide){
                return {
                    action: beanHitDestination({beanKey: agent.key})
                };
            }
            
            if (city) {
                const nearbyBeanKeys = CityGetNearestNeighbors(city, agent);
                if (nearbyBeanKeys.length && BeanMaybeChat(agent)){
                    const targets = nearbyBeanKeys.filter((bKey) => BeanMaybeChat(world.beans.byID[bKey]));
                    if (targets.length < 1)
                        return {};
                    const chat: IChatData = BeanGetRandomChat(agent, world.seed, () => {
                        return targets.map(
                                x => world.beans.byID[x]
                            ).filter(
                                x => x.cash <= agent.cash-1
                            ).reduce(
                                (least: IBean|undefined, bean) => {
                                    if (least == null || (bean.cash < least.cash))
                                        return bean;
                                    return least;
                        }, undefined);
                    });
                    return {
                        newActivity: {
                            act: 'chat',
                            chat: chat,
                            intent: agent.actionData 
                        },
                        action: targets.map(t => changeState({beanKey: t, newState: {
                            act: 'chat',
                            chat: {
                                ...chat,
                                participation: 'listener'
                            },
                            intent: world.beans.byID[t].actionData
                        }}))
                    };
                } else if (BeanBelievesIn(agent, 'Wanderlust') && Math.random() < WanderlustEmoteChance) {
                    return {
                        action: beanEmote({beanKey: agent.key, emote: 'happiness', source: 'Wanderlust'})
                    };
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
            // if (agent instanceof Bean){
            //     agent.velocity = {x: 0, y: 0};
            // }
        },
    }, 
    'work': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world: IWorldState, elapsed: number) => {
            if (elapsed > WorkDurationMS && agent.actionData.good){
                return {
                    action: beanWork({beanKey: agent.key}),
                    newActivity: {
                        act: 'idle'
                    }
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'sleep':{
        enter: (agent: IBean) => {
            if (agent.housing === 'homeless')
                return beanEmote({beanKey: agent.key, emote: 'unhappiness', source: 'Homelessness'});
            return undefined;
        },
        act: (agent: IBean, world, elapsed) => {
            if (elapsed > SleepDurationMS){
                return {
                    newActivity: {
                        act: 'idle'
                    }
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'chat': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, state, elapsed: number) => {
            if (elapsed > ChatDurationMS && agent.actionData.intent){
                return {
                    newActivity: {
                        act: 'travel',
                        intent: agent.actionData.intent
                    }
                }
            }
            return {};
        },
        exit: (agent: IBean, seed: string) => {
            if (agent.actionData.chat){
                if (agent.actionData.chat.participation === 'listener'){
                    switch(agent.actionData.chat.type){
                        case 'bully':
                            return beanEmote({beanKey: agent.key, emote: 'unhappiness', source: 'Antagonism'});
                        case 'praise':
                            return beanEmote({beanKey: agent.key, emote: 'happiness', source: 'Enthusiasm'});
                        case 'preach':
                            if (agent.actionData.chat.preachBelief && 
                                agent.actionData.chat.persuasionStrength && 
                                BeanMaybePersuaded(agent, seed, agent.actionData.chat.preachBelief, agent.actionData.chat.persuasionStrength)){
                                return beanBePersuaded({beanKey: agent.key, belief: agent.actionData.chat.preachBelief})
                            }
                    }
                }
            }
            return undefined;
        },
    }, 
    'soapbox': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean) => {
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'craze': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean) => {
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'idle': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world: IWorldState, elapsed: number) => {
            if (agent.lifecycle === 'incarcerated')
                return {};
            if (elapsed < 200)
                return {};
            
            const priorities = agent.priorities.slice(0);
            let top: IPrioritizedActivityData|undefined = priorities[0];
            let travelState: IActivityData|undefined = undefined;
            let sideEffect: AnyAction|undefined = undefined;

            //loop through possible destinations
            while (top && travelState == null){
                const substitute = SubstituteIntent(agent, world, top);
                if (substitute?.intent){
                    travelState = CreateTravelFromIntent(agent, world.cities.byID[agent.cityKey], substitute.intent, world);
                    if (travelState != null)
                        return {
                            newActivity: travelState,
                            action: sideEffect
                        };
                } else if (substitute?.sideEffect){
                    sideEffect = substitute.sideEffect;
                }
                top = priorities.shift();
            }
            return {
                action: sideEffect
            };
        },
        exit: (agent: IBean) => {
            if (BeanMaybeParanoid(agent))
                return beanEmote({beanKey: agent.key, emote: 'unhappiness', source:'Paranoia'});
        },
    }, 
    'chase':{
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world, elapsed: number, deltaMS: number) => {
            if (agent.actionData.chase?.targetBeanKey != null && elapsed < ChaseGiveUpTimeMS){
                const targetPos = (MoverStoreInstance.Get('bean', agent.actionData.chase.targetBeanKey).current?.point || world.beans.byID[agent.actionData.chase.targetBeanKey].lastPoint);
                if (targetPos == null || isNaN(targetPos.x) || isNaN(targetPos.y)) {
                    //sanity check
                    console.warn('NaN destination, resetting to idle')
                    return {
                        newActivity: {
                            act: 'idle'
                        }
                    };
                }
                const oldAccelerator = MoverStoreInstance.Get('bean', agent.key).current || OriginAccelerator;
                const newAccelerator = {
                    ...oldAccelerator
                };
    
    
                const collide = accelerate_towards(
                    newAccelerator,
                    world.cities.byID[agent.cityKey],
                    targetPos,
                    BeanPhysics.AccelerateS * (BeanBelievesIn(agent, 'Catatonia') ? CatatoniaWalkSpeedPercentage : 1) * deltaMS/1000, 
                    BeanPhysics.MaxSpeed, 
                    BeanPhysics.CollisionDistance,
                    BeanPhysics.Brake);
    
                MoverStoreInstance.UpdatePosition('bean', agent.key, newAccelerator, oldAccelerator.hex);

                if (collide){
                    const arrest = beanArrest({criminalBeanKey: agent.actionData.chase.targetBeanKey, crime: agent.actionData.chase.crime});
                    if (agent.actionData.intent){
                        return {
                            newActivity : {
                                ...agent.actionData.intent,
                            },
                            action: arrest
                        };
                    } else {
                        return {
                            newActivity: {act: 'idle'},
                            action: arrest
                        }
                    }
                } else {
                    return {};
                }
            } else { //no-one to chase or ran out of time
                // intent is arrest/murder, so look for intent after that one
                if (agent.actionData.intent?.intent){
                    return {
                        newActivity: {
                            ...agent.actionData.intent.intent
                        }
                    }
                } else {
                    return {newActivity: {act: 'idle'}};
                }
            }
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'assault':{
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world, elapsed) => {
            if (elapsed > AssaultDurationMS){
                if (agent.actionData.intent){
                    return {
                        newActivity: {
                            ...agent.actionData.intent
                        }
                    }
                }
                return {
                    newActivity: {
                        act: 'idle'
                    }
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'buy': {
        // static MaximumBuyDuration = 1100;
        // private sinceLastAttemptMS: number = 0;
        // tryBuy(agent: IAgent){
        //     if (agent instanceof Bean && agent.actionData.good && agent.city?.economy)
        //     {
        //         this._bought = agent.buy[agent.actionData.good](agent.city.economy);
        //     }
        //     this.sinceLastAttemptMS = 0;
        // }
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world: IWorldState, elapsed: number) => {
            if (agent.actionData.buyReceipt){
                if (elapsed > 750)
                    return {
                        newActivity: {
                            act: 'idle'
                        }
                    }
            } else {
                if (elapsed > TransactMaximumDurationMS){
                    return {
                        newActivity: {act:'idle'}
                    }
                }
                if ((agent.actionData.buyAttempts || 0) >= 3){
                    return {
                        newActivity: {act:'idle'}
                    }
                }
                if (elapsed > 100 && agent.actionData.good){
                    return {
                        action: beanBuy({beanKey: agent.key, good: agent.actionData.good})
                    };
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'crime': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world: IWorldState, elapsed) => {
            if (elapsed > CrimeDurationMS){
                return {
                    newActivity: {act: 'idle'},
                    action: beanCrime({beanKey: agent.key, good: agent.actionData.crimeGood || 'food'})
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return undefined;
        },
    }, 
    'relax': {
        enter: (agent: IBean) => {
            return undefined;
        },
        act: (agent: IBean, world: IWorldState, elapsed: number) => {
            let durationMS = RelaxationDurationMS;
            if (BeanBelievesIn(agent, 'Naturalism'))
                durationMS *= 3;
            if (elapsed > durationMS){
                return {
                    newActivity: {
                        act: 'idle'
                    }
                }
            }
            return {};
        },
        exit: (agent: IBean) => {
            return beanRelax({beanKey: agent.key});
        },
    }
}

function SubstituteIntent(bean: IBean, world: IWorldState, intent: IActivityData): {
    intent?: IActivityData,
    sideEffect?: AnyAction
}|undefined{
    if (intent.act === 'buy' && intent.good != null){
        const desiredGoodState = EconomyCanBuy(world.economy, world.law, bean, intent.good);
        if (desiredGoodState !== 'yes' && intent.good === 'fun'){ //if you can't buy happiness, go somewhere to relax{
            return {
                intent: {
                    act: 'relax'
                }
            }
        } else if (desiredGoodState === 'pricedout') {
            if ((intent.good === 'food' || intent.good === 'medicine') && BeanMaybeCrime(bean, world.seed, intent.good)){
                return {
                    intent: {
                        act: 'crime',
                        crimeGood: intent.good
                    }
                }
            } else {
                const isPhysical = intent.good === 'food' || intent.good === 'medicine';
                if (isPhysical){
                    return {
                        sideEffect: beanEmote({beanKey: bean.key, emote: 'unhappiness', source: GoodIcon[intent.good] + ' Poverty'})
                    }
                }
                return undefined; //don't travel to buy something that you can't afford
            }
        } else if (desiredGoodState === 'nosupply'){
            if (intent.good && BeanMaybeScarcity(bean, intent.good)){
                return {
                    sideEffect: beanEmote({beanKey: bean.key, emote: 'unhappiness', source:'Scarcity'}) 
                }
            }
            return undefined; //don't travel to buy something that doesn't exist
        }
        return {
            intent: {
                ...intent,
                buyAttempts: 0
            }
        }
    }
    return {
        intent: intent
    };
}

export function IntentToDestination(agent: IBean, city: ICity, intent: IActivityData, world: IWorldState): Point[]|null{
    switch(intent.act){
        case 'buy':
            if (intent.good)
                return RouteRandomBuildingOfType(city, world, agent, GoodToBuilding[intent.good]);
            break;
        case 'sleep': {
            if (agent.dwellingKey !== undefined){
                const dwelling = world.dwellings.byID[agent.dwellingKey];
                const building = world.buildings.byID[dwelling.buildingKey];
                const lot = world.lots.byID[building.lotKey];
                const district = world.districts.byID[lot.districtKey];
                return RouteToHexAndPoint(world.seed, city, agent, {q: district.q, r: district.r}, lot.point);
            } else {
                return RouteRandomHomelessSleepingBuilding(city, world, agent);
            }
        }
        case 'work':
            return RouteRandomBuildingOfType(city, world, agent, JobToBuilding[agent.job]);
        case 'relax': {
            const buildingDest = CityGetRandomEntertainmentBuilding(city, world);
            if (buildingDest){
                return Route(world.seed, city, agent, buildingDest);
            } else {
                const nature = world.districts.allIDs.map(x => world.districts.byID[x]).find(y => y.kind === 'nature');
                if (nature){
                    return RouteToHexAndPoint(world.seed, city, agent, {q: nature.q,r: nature.r}, {
                        x: nature.point.x + (Math.random() * 150) - 75,
                        y: nature.point.y + (Math.random() * 150) - 75
                    });
                }
            }
        }
    }
    return [];
}

function CreateTravelFromIntent(agent: IBean, city: ICity, intent: IActivityData, world: IWorldState): IActivityData|undefined{
    const destination = IntentToDestination(agent, city, intent, world);
    
    if (destination)
        return {
            act: 'travel',
            destinations: destination,
            destinationIndex: 0,
            intent: intent
        }
    else
        return undefined;
}

const WanderlustEmoteChance = 0.002;

/**
 * returns a priority. Higher is more important
 */
export const GetPriority = {
    work: function(bean: IBean, seed: string, city: ICity): number{
        const deviation = BeanBelievesIn(bean, 'Delirium') ? StatsNormalDev*2 : StatsNormalDev;
        if (bean.job === 'jobless' || BeanBelievesIn(bean, 'Catatonia')){
            return 0;
        }
        else if (bean.cash === 0){
            return SampleNormalDistribution(seed, StatsNormalMean + (StatsNormalDev * 2), deviation);
        }
        else if (city){
            return SampleNormalDistribution(seed, StatsNormalMean + 
                (StatsNormalDev * Math.min(1, city.costOfLiving / bean.cash), deviation)
            );
        }
        return SampleNormalDistribution(seed, StatsNormalMean, deviation);
    },
    food: function(bean: IBean, seed: string, difficulty: IDifficulty): number{
        const deviation = BeanBelievesIn(bean, 'Delirium') ? StatsNormalDev*2 : StatsNormalDev;
        return SampleNormalDistribution(seed, StatsNormalMean + (
            StatsNormalDev * 6 * Math.min(1, difficulty.bean_life.vital_thresh.food.warning / bean.discrete_food),
            deviation
        ));
    },
    stamina: function(bean: IBean, seed: string, difficulty: IDifficulty): number{
        const deviation = BeanBelievesIn(bean, 'Delirium') ? StatsNormalDev*2 : StatsNormalDev;
        return SampleNormalDistribution(seed, StatsNormalMean + (
            StatsNormalDev * 4 * Math.min(1, difficulty.bean_life.vital_thresh.shelter.warning / bean.discrete_stamina),
            deviation
        ));
    },
    medicine:function(bean: IBean, seed: string, difficulty: IDifficulty): number{
        const deviation = BeanBelievesIn(bean, 'Delirium') ? StatsNormalDev*2 : StatsNormalDev;
        return SampleNormalDistribution(seed, StatsNormalMean + (
            StatsNormalDev * 2 * Math.min(1, difficulty.bean_life.vital_thresh.medicine.warning / bean.discrete_health),
            deviation
        ));
    },
    fun:function(bean: IBean, seed: string, difficulty: IDifficulty): number{
        const deviation = BeanBelievesIn(bean, 'Delirium') ? StatsNormalDev*2 : StatsNormalDev;
        return SampleNormalDistribution(seed, StatsNormalMean + (
            StatsNormalDev * Math.min(1, -bean.lastHappiness / 100),
            deviation
        ));
    }
}

export function GetPriorities(bean: IBean, seed: string, date: IDate, city: ICity, difficulty: IDifficulty): IPrioritizedActivityData[]{
    let priors: IPrioritizedActivityData[] = [];
    const clockI = DateGetActivityPeriodIndex(date.hour);
    if (clockI < bean.actionClock.length){
        const period: ActivityPeriod = bean.actionClock[clockI];
        switch(period){
            case ActivityPeriod.Rest:
                return [
                    {act: 'sleep', priority: GetPriority.stamina(bean, seed, difficulty)} as IPrioritizedActivityData
            ];
            case ActivityPeriod.Chores:
                priors = [{act: 'buy', good: 'food', priority: GetPriority.food(bean, seed, difficulty)} as IPrioritizedActivityData,
                    {act: 'buy', good: 'medicine', priority: GetPriority.medicine(bean, seed, difficulty)} as IPrioritizedActivityData,
                    {act: 'buy', good: 'fun', priority: GetPriority.fun(bean, seed, difficulty)} as IPrioritizedActivityData
                ];
                break;
            case ActivityPeriod.Work:
                return [
                    {act: 'work', good: JobToGood(bean.job), priority: GetPriority.work(bean, seed, city)} as IPrioritizedActivityData
                ];
            case ActivityPeriod.Play:
                return [
                    {act: 'relax', priority: 1} as IPrioritizedActivityData
                ];
            }
    }
    priors.sort((a, b) => b.priority - a.priority);
    return priors;
}

export function ActivityIcon(data: IActivityData): string{
    switch(data.act){
        case 'sleep':
            return '😴';
        case 'work':
            if (data.good)
                return '💪 '+ GoodIcon[data.good];
            else
                return '💪';
        case 'buy':
            if (data.good)
                return '💸 '+ GoodIcon[data.good];
            else
                return '💸';
    }
    return '';
}
export function ActivityDisplay(data: IActivityData): string{    
    switch(data.act){
        case 'chat':
            return `chatting`;
        case 'crime':
            return `stealing ${data?.crimeGood}`;
        case 'sleep':
            return `sleeping 😴`;
        case 'relax':
            return `relaxing`;
        case 'travel':
            return `travelling to ` + data.intent?.act || '';
        case 'chase':
            return `in a chase to ` + data.chase?.type || '';
        case 'assault':
            return `in the middle of a ` + data?.assault?.assaultType || '';
        case 'work':
            if (data.good)
                return 'working to make '+ GoodIcon[data.good];
            else
                return 'working';
        case 'buy':
            if (data.good)
                return 'buying '+ GoodIcon[data.good];
            else
                return 'buying';
    }
    return '';
}

/**
 * a bean is a citizen with preferences
 */
export interface IBean extends ISeller, IBeanAgent{    
    key: number;
    cityKey: number;
    name: string;
    community: TraitCommunity;
    ideals: TraitIdeals;
    ethnicity: TraitEthno;
    faith: TraitFaith;
    stamina: TraitStamina;
    health: TraitHealth;
    food: TraitFood;
    discrete_food: number;
    discrete_health: number;
    discrete_sanity: number;
    discrete_stamina: number;
    discrete_fun: number;
    housing: TraitHousing;
    graceTicks: number;
    cash: number;
    dob: IDate;
    sanity: TraitSanity;
    beliefs: TraitBelief[];
    lifecycle: 'alive'|'dead'|'abducted'|'incarcerated',
    deathCause?: string,
    hedonHistory: HedonSourceToVal[],
    job: TraitJob,
    happiness: HedonReport,
    lastHappiness: number,
    hedonFiveDayRecord: HedonExtremes,
    fairGoodPrice: number,
    employerEnterpriseKey?: number,
    dwellingKey?: number,
    activity_duration: {[act in Act]: number},
    bornInPetri: boolean,
    ticksSinceLastRelax: number,
    lastChatMS: number,
    lastPoint?: Point,
    lastHex?: HexPoint,
    titleKey?: number,
    badge?: string,
    hat?: string,
    faceOverride?: string,
    faceOverrideTicks?: number,
    jailTicksLeft?: number
}

/**
 * fills out "markers" and "destinationKey" with random building of type
 * @param city 
 * @param bean 
 * @param buildingType 
 */
export function RouteRandomBuildingOfType(city: ICity, world: IWorldState, bean: IBean, buildingType: BuildingTypes): Point[]|null{
    const destination: IBuilding|undefined = CityGetRandomBuildingOfType(city, world, buildingType);
    if (destination === undefined) 
        return null;
    return Route(world.seed, city, bean, destination);
}
export function RouteRandomHomelessSleepingBuilding(city: ICity, world: IWorldState, bean: IBean): Point[]|null{
    const destination: IBuilding|undefined = CityGetRandomHomelessSleepingBuilding(city, world);
    if (destination === undefined) 
        return null;
    return Route(world.seed, city, bean, destination);
}

/**
 * fills out "markers" property with points to walk to destination
 * @param city 
 * @param bean 
 * @param buildingType 
 */
export function Route(seed: string, city: ICity, bean: IBean, destination: IBuilding): Point[]{
    return RouteToHexAndPoint(seed, city, bean, destination.hex, destination.point);
}
export function RouteToHexAndPoint(seed: string, city: ICity, bean: IBean, hex: HexPoint, point: Point): Point[]{
    const start = MoverStoreInstance.Get('bean', bean.key).current || {...OriginAccelerator};
    const nearestHex = pixel_to_hex(city.district_hex_size, city.petriOrigin, start.point);
    return hex_linedraw(nearestHex, hex).map(
        (h) => hex_to_pixel(city.district_hex_size, city.petriOrigin, h)
        ).map((x, i, a) => {
        if (i === a.length-1){
            return {
                x: point.x + GetRandomNumber(seed, -20, 20),
                y: point.y + GetRandomNumber(seed, -20, 20)
            }
        } else {
            return x;
        }
    });
}