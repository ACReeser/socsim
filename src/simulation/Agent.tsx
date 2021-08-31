import { AnyAction } from "@reduxjs/toolkit";
import { IDifficulty } from "../Game";
import { MoverStoreInstance as MoverStoreInstance } from "../MoverStoreSingleton";
import { getRandomSlotOffset } from "../petri-ui/Building";
import { IWorldState } from "../state/features/world";
import { beanBePersuaded, beanBuy, beanCrime, beanEmote, beanHitDestination, beanRelax, beanWork, changeState } from "../state/features/world.reducer";
import { BeanPhysics, GoodIcon, JobToGood, TraitCommunity, TraitEmote, TraitEthno, TraitFaith, TraitFood, TraitGood, TraitHealth, TraitIdeals, TraitJob, TraitSanity, TraitStamina } from "../World";
import { Bean, BeanBelievesIn, BeanEmote, BeanGetRandomChat, BeanMaybeChat, BeanMaybeCrime, BeanMaybeParanoid, BeanMaybePersuaded, BeanMaybeScarcity } from "./Bean";
import { HedonExtremes, HedonReport, HedonSourceToVal, TraitBelief } from "./Beliefs";
import { CityGetNearestNeighbors, CityGetRandomBuildingOfType, CityGetRandomEntertainmentBuilding, ICity } from "./City";
import { EconomyCanBuy, IMarketReceipt, ISeller } from "./Economy";
import { accelerate_towards, BuildingTypes, Geography, GoodToBuilding, hex_linedraw, hex_to_pixel, IAccelerator, IBuilding, JobToBuilding, OriginAccelerator, pixel_to_hex, Point } from "./Geography";
import { DumbPriorityQueue, IPriorityQueue, PriorityNode } from "./Priorities";
import { IDate } from "./Time";

export type Act = 'travel'|'work'|'sleep'|'chat'|'soapbox'|'craze'|'idle'|'buy'|'crime'|'relax';

/**
 * cruise == interruptible travel towards destination
 * 
 * approach == uninterruptible travel into destination slot
 */
export type Travel = 'cruise'|'approach';

export interface IActListener{
    onChat: (b: Bean, speech: IChatData) => void;
    onEmote: (b: Bean, emote: TraitEmote) => void;
}

export interface IActivityData {
    act: Act;
    elapsed?: number;
    // location?: Point, //FROM Point
    destinations?: Point[]; //point to travel to??
    destinationIndex?: number; //which point are we heading towards
    intent?: IActivityData; //when travelling, what do you intend to do next
    good?: TraitGood; //good to buy or work
    crimeGood?: 'food'|'medicine';
    // travel?: Travel;
    chat?: IChatData;
    buyAttempts?: number;
    buyReceipt?: IMarketReceipt
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
}
export interface StateFunctions {
    enter: (agent: IBean) => AnyAction|undefined;
    act: (agent: IBean, world: IWorldState, elapsed: number, deltaMS: number) => {action?: AnyAction|AnyAction[], newActivity?: IActivityData};
    exit: (agent: IBean) => AnyAction|undefined;
}
const RelaxationDurationMS = 1000;
const CrimeDurationMS = 1500;
const TransactMaximumDurationMS = 1100;
const ChatDurationMS = 1000;
const WorkDurationMS = 3000;
const SleepDurationMS = 3000;

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
            const newAccelerator = {
                ...(MoverStoreInstance.Get('bean', agent.key).current || OriginAccelerator)
            };

            const collide = accelerate_towards(
                newAccelerator,
                target,
                BeanPhysics.AccelerateS * deltaMS/1000, 
                BeanPhysics.MaxSpeed, 
                BeanPhysics.CollisionDistance,
                BeanPhysics.Brake);

            MoverStoreInstance.Get('bean', agent.key).publish(newAccelerator);
            
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
                    const chat: IChatData = BeanGetRandomChat(agent, () => {
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
        exit: (agent: IBean) => {
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
                                BeanMaybePersuaded(agent, agent.actionData.chat.preachBelief, agent.actionData.chat.persuasionStrength)){
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
            if (elapsed < 200)
                return {};
            
            const priorities = GetPriorities(agent, world.cities.byID[agent.cityKey], world.alien.difficulty);
            let top = priorities.dequeue();
            let travelState: IActivityData|undefined = undefined;
            let sideEffect: AnyAction|undefined = undefined;

            //loop through possible destinations
            while (top && travelState == null){
                const substitute = SubstituteIntent(agent, world, top.value);
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
                top = priorities.dequeue();
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
                return {
                    newActivity: {
                        act: agent.actionData.good === 'shelter' ? 'sleep' : 'idle'
                    }
                }
            }
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
            if (elapsed > 250 && agent.actionData.good){
                return {
                    action: beanBuy({beanKey: agent.key, good: agent.actionData.good})
                };
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
        if (desiredGoodState != 'yes' && intent.good === 'fun') //if you can't buy happiness, go somewhere to relax
            intent.act = 'relax'; //relaxing is free!
        else if (desiredGoodState === 'pricedout') {
            if ((intent.good == 'food' || intent.good == 'medicine') && BeanMaybeCrime(bean, intent.good)){
                intent.act = 'crime';
                intent.crimeGood = intent.good;
            } else {
                const isPhysical = intent.good === 'food' || intent.good === 'medicine' || intent.good === 'shelter';
                if (isPhysical){
                    return {
                        sideEffect: beanEmote({beanKey: bean.key, emote: 'unhappiness', source: 'Poverty'})
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
        intent.buyAttempts = 0;
    }
    return {
        intent: intent
    };
}

export function IntentToDestination(agent: IBean, city: ICity, intent: IActivityData, world: IWorldState): Point[]|null{
    switch(intent.act){
        case 'buy':
            if (intent.good)
                return RouteRandom(city, world, agent, GoodToBuilding[intent.good]);
        case 'work':
            return RouteRandom(city, world, agent, JobToBuilding[agent.job]);
        case 'relax': {
            const buildingDest = CityGetRandomEntertainmentBuilding(city, world);
            if (buildingDest){
                return Route(city, agent, buildingDest);
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

export const GetPriority = {
    work: function(bean: IBean, city: ICity): number{
        if (bean.job == 'jobless'){
            return 9;
        }
        else if (city){
            //beans with no inventory prioritize work higher
            let inventory_priority = 99;
            // if (city.economy){
            //     const quant = bean.city.economy.market.getStakeListings(bean.key, bean.employerEnterpriseKey, JobToGood(bean.job))?.quantity || 0;
            //     inventory_priority = quant;
            // }
            //beans with lots of cash prioritize work higher
            const wealth_priority = bean.cash / city.costOfLiving / 2;
            return 0.5 + Math.min(inventory_priority, wealth_priority);
        } else {
            return 0.5;
        }
    },
    food: function(bean: IBean, difficulty: IDifficulty): number{
        if ((bean.discrete_food <= difficulty.bean_life.vital_thresh.food.warning ))
            return bean.discrete_food;
        return 0.5 + (bean.discrete_food / difficulty.bean_life.vital_thresh.food.sufficient )
    },
    medicine:function(bean: IBean, difficulty: IDifficulty): number{
        if ((bean.discrete_health <= difficulty.bean_life.vital_thresh.medicine.warning ))
            return 0.25 + bean.discrete_health;
        return 0.75 + (bean.discrete_health / difficulty.bean_life.vital_thresh.medicine.sufficient )
    },
    stamina: function(bean: IBean, difficulty: IDifficulty): number{
        if ((bean.discrete_stamina <= difficulty.bean_life.vital_thresh.shelter.warning ))
            return 0.50 + bean.discrete_stamina;
        return 1 + (bean.discrete_stamina / difficulty.bean_life.vital_thresh.shelter.sufficient )
    },
    fun:function(bean: IBean, difficulty: IDifficulty): number{
        return 3
    }
}

export function GetPriorities(bean: IBean, city: ICity, difficulty: IDifficulty): IPriorityQueue<IActivityData>{
    const queue = new DumbPriorityQueue<IActivityData>([]);
    let node = new PriorityNode<IActivityData>({act: 'work', good: JobToGood(bean.job)} as IActivityData, GetPriority.work(bean, city));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'food'} as IActivityData, GetPriority.food(bean, difficulty));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'shelter'} as IActivityData, GetPriority.stamina(bean, difficulty));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'medicine'} as IActivityData, GetPriority.medicine(bean, difficulty));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'fun'} as IActivityData, GetPriority.fun(bean, difficulty));
    queue.enqueue(node);
    return queue;
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
            return `commiting crime`;
        case 'sleep':
            return `sleeping 😴`;
        case 'relax':
            return `relaxing`;
        case 'travel':
            return `travelling to ` + data.intent?.act || '';
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
    graceTicks: number;
    cash: number;
    dob: IDate;
    sanity: TraitSanity;
    beliefs: TraitBelief[];
    lifecycle: 'alive'|'dead'|'abducted',
    hedonHistory: HedonSourceToVal[],
    job: TraitJob,
    happiness: HedonReport,
    lastHappiness: number,
    hedonFiveDayRecord: HedonExtremes,
    fairGoodPrice: number,
    employerEnterpriseKey?: number,
    activity_duration: {[act in Act]: number},
    bornInPetri: boolean,
    ticksSinceLastRelax: number,
    lastChatMS: number,
    lastPoint?: Point
}

/**
 * fills out "markers" and "destinationKey" with random building of type
 * @param city 
 * @param bean 
 * @param buildingType 
 */
export function RouteRandom(city: ICity, world: IWorldState, bean: IBean, buildingType: BuildingTypes): Point[]|null{
    const destination: IBuilding|undefined = CityGetRandomBuildingOfType(city, world, buildingType);
    if (destination === undefined) 
        return null;
    return Route(city, bean, destination);
}

/**
 * fills out "markers" property with points to walk to destination
 * @param city 
 * @param bean 
 * @param buildingType 
 */
export function Route(city: ICity, bean: IBean, destination: IBuilding): Point[]{
    const start = MoverStoreInstance.Get('bean', bean.key).current || {...OriginAccelerator};
    const nearestHex = pixel_to_hex(city.hex_size, city.petriOrigin, start.point);
    return hex_linedraw(nearestHex, destination.address).map(
        (h) => hex_to_pixel(city.hex_size, city.petriOrigin, h)
        ).map((x, i, a) => {
        if (i === a.length-1){
            const offset = getRandomSlotOffset();
            return {
                x: x.x + offset.x,
                y: x.y + offset.y
            }
        } else {
            return x;
        }
    });
}
export function Approach(geo: Geography, bean: IBean){

}