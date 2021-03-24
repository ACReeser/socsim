import { Agent } from "https";
import { Bean, DaysUntilSleepy } from "./Bean";
import { getRandomSlotOffset } from "../petri-ui/Building";
import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitGood, GoodToThreshold, JobToGood, TraitSanity, GoodIcon, TraitEmote } from "../World";
import { GetRandom } from "../WorldGen";
import { BuildingTypes, Geography, GoodToBuilding, HexPoint, hex_linedraw, hex_origin, hex_ring, hex_to_pixel, IBuilding, JobToBuilding, move_towards, pixel_to_hex, Point, Vector } from "./Geography";
import { IDate } from "./Time";
import { PubSub } from "../events/Events";
import { DumbPriorityQueue, IPriorityQueue, PriorityNode, PriorityQueue } from "./Priorities";
import { IDifficulty } from "../Game";
import { TraitBelief } from "./Beliefs";
import { ISeller } from "./Economy";
import { IterationStatement } from "typescript";

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
    location?: Point, //FROM Point
    destinations?: Point[]; //point to travel to??
    intent?: IActivityData; //when travelling, what do you intend to do next
    good?: TraitGood; //good to buy or work
    timeSpent?: number; //time spent on this action
    travel?: Travel;
    chat?: IChatData;
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

export interface IAgent {
    state: AgentState;
    onAct?: PubSub<number>;
    jobQueue: PriorityQueue<AgentState>;
}
export function ChangeState(agent: IAgent, newState: AgentState){
    //if ((agent as any)['key'] === 0)
    //console.log(`from ${agent.state.data.act} to ${newState.data.act} in ${agent.state.Elapsed}`);
    agent.state.exit(agent);
    agent.state = newState;
    agent.state.enter(agent);
}
export function Act(agent: IAgent, deltaMS: number, difficulty: IDifficulty, listener: IActListener): void{
    const result = agent.state.act(agent, deltaMS, difficulty);
    if (agent.onAct)
        agent.onAct.publish(deltaMS);
    if (result != agent.state){
        ChangeState(agent, result);
        if (result.data.act === 'chat' && result.data.chat?.participation === 'speaker'){
            listener.onChat(agent as Bean, result.data.chat);
        }
    }
}

export abstract class AgentState{
    constructor(public data: IActivityData){}
    public get Elapsed(): number {return this.data.elapsed || 0;}
    enter(agent: IAgent){
        this.data.elapsed = 0;
    }
    act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        const newState = this._act(agent, deltaMS, difficulty);
        this.data.elapsed = this.Elapsed + deltaMS;
        return newState;
    }
    abstract _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState;
    exit(agent: IAgent){

    }
    get display(): string {
        return ActivityDisplay(this.data);
    }
}
export class IdleState extends AgentState{
    static create(){ return new IdleState({act: 'idle'})}
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        if (this.Elapsed < 200){
            return this;
        }
        if (agent instanceof Bean && agent.city){
            const priorities = GetPriorities(agent, difficulty);
            let top = priorities.dequeue();
            let travelState: TravelState|null = null;

            //loop through possible destinations
            while (top && travelState == null){
                const activity = IdleState.substituteIntent(agent, top.value);
                if (activity){
                    travelState = TravelState.createFromIntent(agent, top.value);
                    if (travelState != null)
                        return travelState;
                }
                top = priorities.dequeue();
            }
        }
        return this;
    }
    static substituteIntent(agent: IAgent, intent: IActivityData): IActivityData|null{
        if (intent.act === 'buy' && intent.good != null && agent instanceof Bean){
            const desiredGoodState = agent.canBuy(intent.good);
            if (desiredGoodState != 'yes' && intent.good === 'fun')
                intent.act = 'relax'; //relaxing is free!
            else if (desiredGoodState === 'pricedout') {
                if (agent instanceof Bean && agent.maybeCrime(intent.good)){
                    intent.act = 'crime';
                } else {
                    return null; //don't travel to buy something that you can't afford
                }
            } else if (desiredGoodState === 'nosupply'){
                return null; //don't travel to buy something that doesn't exist
            }
        }
        return intent;
    }
    exit(agent: IAgent){
        super.exit(agent);

        if (agent instanceof Bean){
            agent.maybeParanoid()
        }
    }
}

export function IntentToDestination(agent: IAgent, intent: IActivityData): Point[]|null{
    if (!(agent instanceof Bean))
        return [];
    else if (agent.city){
        const city = agent.city;
        switch(intent.act){
            case 'buy':
                if (intent.good)
                    return RouteRandom(city, agent, GoodToBuilding[intent.good]);
            case 'work':
                return RouteRandom(city, agent, JobToBuilding[agent.job]);
            case 'relax': {
                const destination = city.book.getRandomEntertainmentBuilding();
                if (destination){
                    agent.destinationKey = destination.key;
                    return Route(city, agent, destination);
                }
            }
        }
    }
    return [];
}

export class TravelState extends AgentState{
    static createFromIntent(agent: IAgent, intent: IActivityData): TravelState|null{
        const destination = IntentToDestination(agent, intent);

        if (destination)
            return this.createFromDestination(destination, intent);
        return null;
    }
    static createFromDestination(destinations: Point[], intent: IActivityData): TravelState{ 
        return new TravelState({act: 'travel', destinations: destinations, intent: intent});
    }
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        
        if (agent instanceof Bean && agent.city && this.data.destinations && this.data.destinations.length){
            const pos = agent.city.movers['bean'][agent.key];
            const target = this.data.destinations[0];
            const newPos = move_towards(pos, target, deltaMS / 1000 * agent.speed);
            
            agent.city.movers['bean'][agent.key] = newPos;
            if (newPos.x == target.x && newPos.y == target.y){
                this.data.location = newPos;
                this.data.destinations.shift();
            }
        }
        if (this.data.destinations == null || this.data.destinations.length === 0){
            if (this.data.intent)
                return ActToState[this.data.intent.act](this.data.intent);
            else
                return IdleState.create();
        } else if (agent instanceof Bean && agent.city) {
            const nearby = agent.city.getNearestNeighbors(agent);
            if (nearby.length && agent.maybeChat()){
                const targets = nearby.filter((nn) => nn.maybeChat());
                if (targets.length < 1)
                    return this;
                const chat: IChatData = agent.getRandomChat(targets);
                targets.forEach((z) => z.state = ChatState.create(this.data.intent, {...chat, participation: 'listener'}));
                return ChatState.create(this.data, chat);
            } else {
                return this;
            }
        } else {
            return this;
        }
    }
}
export class WorkState extends AgentState{
    static create(good: TraitGood){ return new WorkState({act: 'work', good: good})}
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        if (this.Elapsed > 2000 && agent instanceof Bean && this.data.good && agent.city?.economy && agent.city?.law){
            agent.work(agent.city.law, agent.city.economy);
            return IdleState.create();
        }
        
        return this;
    }
}
export class BuyState extends AgentState{
    static create(good: TraitGood){ return new BuyState({act: 'buy', good: good})}
    private sinceLastAttemptMS: number = 0;
    private attempts: number = 0;
    tryBuy(agent: IAgent){
        if (agent instanceof Bean && this.data.good && agent.city?.economy)
        {
            this._bought = agent.buy[this.data.good](agent.city.economy);
        }
        this.sinceLastAttemptMS = 0;
        this.attempts++;
    }
    enter(agent: IAgent){
        this.tryBuy(agent);
    }
    private _bought: boolean = false;
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        if (!this._bought){
            if (this.sinceLastAttemptMS > 250)
            {
                this.tryBuy(agent);
                // if(this.attempts >= 3 && (this.data.good == 'food' || this.data.good == 'medicine') &&
                //     agent instanceof Bean &&
                //     agent.getCrimeDecision(this.data.good, 'desperation')){
                //     return CrimeState.create(this.data.good);
                // }
            }
        }
        if (this.Elapsed > 1500)
            return IdleState.create();
        else
            return this;
    }
}
export class ChatState extends AgentState{
    static create(intent: IActivityData|undefined, chat: IChatData){ 
        return new ChatState({act: 'chat', intent: intent, chat: chat})
    }
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        
        if (this.Elapsed > 1000 && this.data.intent){
            const tState = TravelState.createFromIntent(agent, this.data.intent);
            if (tState)
                return tState;
        }
        return this;
    }
    exit(agent: IAgent){
        if (agent instanceof Bean && this.data.chat){
            agent.lastChatMS = Date.now();
            if (this.data.chat.participation === 'listener'){
                if (this.data.chat.type === 'bully'){
                    agent.maybeAntagonised();
                }
                else if (this.data.chat.type === 'praise'){
                    agent.maybeEnthused();
                }
            }
        }
    }
}
export class RelaxState extends AgentState{
    static create(intent: IActivityData|undefined, chat: IChatData){ 
        return new RelaxState({act: 'relax', intent: intent, chat: chat})
    }
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        let durationMS = 1000;
        if (agent instanceof Bean && agent.believesIn('Naturalism'))
            durationMS *= 3;
        if (this.Elapsed > durationMS){
            return IdleState.create();
        }
        return this;
    }
    exit(agent: IAgent){
        if (agent instanceof Bean){
            agent.discrete_fun += 1;
            agent.emote('happiness');
            if (agent.believesIn('Naturalism'))
                agent.emote('happiness');
        }
    }
}
export class CrimeState extends AgentState{
    static create(good: 'food'|'medicine'){ return new CrimeState({act: 'crime', good: good})}
    _act(agent: IAgent, deltaMS: number, difficulty: IDifficulty): AgentState{
        if (this.Elapsed > 1500 && agent instanceof Bean && agent.city?.economy && 
            (this.data.good === 'food' ||
            this.data.good === 'medicine')){
            agent.steal(this.data.good, agent.city?.economy);
            return IdleState.create();
        }
        return this;
    }
}

const ActToState: {[key in Act]: (data: IActivityData) => AgentState} = {
    'idle': (data) => new IdleState(data),
    'work': (data) => new WorkState(data),
    'chat': (data) => new ChatState(data),
    'travel': (data) => new TravelState(data),
    'craze': (data) => new BuyState(data),
    'buy': (data) => new BuyState(data),
    'sleep': (data) => new BuyState(data),
    'soapbox': (data) => new BuyState(data),
    'crime': (data) => new CrimeState(data),
    'relax': (data) => new RelaxState(data)
}

export const GetPriority = {
    work: function(bean:Bean): number{
        if (bean.job == 'jobless' && bean.city){
            return 9;
        }
        else if (bean.city){
            //beans with no inventory prioritize work higher
            let inventory_priority = 99;
            if (bean.city.economy){
                const quant = bean.city.economy.market.getStakeListings(bean.key, bean.employerEnterpriseKey, JobToGood(bean.job))?.quantity || 0;
                inventory_priority = quant;
            }
            //beans with lots of cash prioritize work higher
            const wealth_priority = bean.cash / bean.city.costOfLiving / 2;
            return Math.min(inventory_priority, wealth_priority);
        } else {
            return 0;
        }
    },
    food: function(bean:Bean, difficulty: IDifficulty): number{
        return 0.5 + (bean.discrete_food / difficulty.bean_life.vital_thresh.food.sufficient )
    },
    shelter: function(bean:Bean, difficulty: IDifficulty): number{
        return 1 + (bean.discrete_stamina / difficulty.bean_life.vital_thresh.shelter.sufficient )
    },
    medicine:function(bean:Bean, difficulty: IDifficulty): number{
        return 0.75 + (bean.discrete_health / difficulty.bean_life.vital_thresh.medicine.sufficient )
    },
    fun:function(bean:Bean, difficulty: IDifficulty): number{
        return 2 + (bean.lastHappiness / 100 * 1.25 )
    }
}

export function GetPriorities(bean: Bean, difficulty: IDifficulty): IPriorityQueue<IActivityData>{
    const queue = new DumbPriorityQueue<IActivityData>([]);
    let node = new PriorityNode<IActivityData>({act: 'work', good: JobToGood(bean.job)} as IActivityData, GetPriority.work(bean));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'food'} as IActivityData, GetPriority.food(bean, difficulty));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'shelter'} as IActivityData, GetPriority.shelter(bean, difficulty));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'medicine'} as IActivityData, GetPriority.medicine(bean, difficulty));
    queue.enqueue(node);
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'fun'} as IActivityData, GetPriority.fun(bean, difficulty));
    queue.enqueue(node);
    return queue;
}

export function ActivityIcon(data: IActivityData): string{
    switch(data.act){
        case 'work':
            if (data.good)
                return '💪 '+ GoodIcon[data.good];
            else
                return '💪';
        case 'buy':
            if (data.good == 'shelter')
                return '😴';
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
            if (data.good == 'shelter')
                return 'sleeping 😴';
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
export interface IBean extends ISeller, IMover, IAgent{    
    key: number;
    cityKey: number;
    name: string;
    community: TraitCommunity;
    ideals: TraitIdeals;
    ethnicity: TraitEthno;
    faith: TraitFaith;
    shelter: TraitShelter;
    health: TraitHealth;
    discrete_food: number;
    discrete_sanity: number;
    discrete_stamina: number;
    cash: number;
    dob: IDate;
    sanity: TraitSanity;
    lifecycle: 'alive'|'dead'|'abducted'
}

export interface IMover{
    key: number;
    speed: number;
    direction: Vector;
    markers: Point[];
    destinationKey: number;
}

export function Step(geo: Geography, mover: IMover){
    if (mover.markers.length){
        const pos = geo.movers['bean'][mover.key];
        const target = mover.markers[0];
        const newPos = move_towards(pos, target, mover.speed);
        geo.movers['bean'][mover.key] = newPos;
        if (newPos.x == target.x && newPos.y == target.y){
            mover.markers.pop();
        }
    }
}

/**
 * fills out "markers" and "destinationKey" with random building of type
 * @param geo 
 * @param mover 
 * @param buildingType 
 */
export function RouteRandom(geo: Geography, mover: IMover, buildingType: BuildingTypes): Point[]|null{
    const destination: IBuilding|undefined = geo.book.getRandomBuildingOfType(buildingType);
    if (destination === undefined) return null;
    mover.destinationKey = destination.key;
    return Route(geo, mover, destination);
}

/**
 * fills out "markers" property with points to walk to destination
 * @param geo 
 * @param mover 
 * @param buildingType 
 */
export function Route(geo: Geography, mover: IMover, destination: IBuilding){
    const start = geo.movers['bean'][mover.key];
    const nearestHex = pixel_to_hex(geo.hex_size, geo.petriOrigin, start);
    return hex_linedraw(nearestHex, destination.address).map((h) => hex_to_pixel(geo.hex_size, geo.petriOrigin, h)).map((x, i, a) => {
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
export function Approach(geo: Geography, mover: IMover){

}