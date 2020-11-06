import { Agent } from "https";
import { Bean, DaysUntilSleepy } from "./Bean";
import { getRandomSlotOffset } from "../petri-ui/Building";
import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitGood, GoodToThreshold, JobToGood, TraitSanity, GoodIcon } from "../World";
import { GetRandom } from "../WorldGen";
import { BuildingTypes, Geography, GoodToBuilding, HexPoint, hex_linedraw, hex_to_pixel, IBuilding, JobToBuilding, move_towards, pixel_to_hex, Point, Vector } from "./Geography";
import { IDate } from "./Time";
import { PubSub } from "../events/Events";
import { PriorityNode, PriorityQueue } from "./Priorities";
import { IDifficulty } from "../Game";

export type Act = 'travel'|'work'|'sleep'|'chat'|'soapbox'|'craze'|'idle'|'buy'|'crime';

/**
 * cruise == interruptible travel towards destination
 * 
 * approach == uninterruptible travel into destination slot
 */
export type Travel = 'cruise'|'approach';

export interface IActivityData {
    act: Act;
    elapsed?: number;
    location?: Point, //FROM Point
    destinations?: Point[]; //point to travel to??
    intent?: IActivityData; //when travelling, what do you intend to do next
    good?: TraitGood; //good to buy or work
    timeSpent?: number; //time spent on this action
    travel?: Travel;
}

export interface IAgent {
    state: AgentState;
    onAct?: PubSub<number>;
    jobQueue: PriorityQueue<AgentState>;
}
export function ChangeState(agent: IAgent, newState: AgentState){
    if ((agent as any)['key'] === 0)
    //console.log(`from ${agent.state.data.act} to ${newState.data.act} in ${agent.state.Elapsed}`);
    agent.state.exit(agent);
    agent.state = newState;
    agent.state.enter(agent);
}
export function Act(agent: IAgent, deltaMS: number): void{
    const result = agent.state.act(agent, deltaMS);
    if (agent.onAct)
        agent.onAct.publish(deltaMS);
    if (result != agent.state){
        ChangeState(agent, result);
    }
}

export abstract class AgentState{
    constructor(public data: IActivityData){}
    public get Elapsed(): number {return this.data.elapsed || 0;}
    enter(agent: IAgent){
        this.data.elapsed = 0;
    }
    act(agent: IAgent, deltaMS: number): AgentState{
        const newState = this._act(agent, deltaMS);
        this.data.elapsed = this.Elapsed + deltaMS;
        return newState;
    }
    abstract _act(agent: IAgent, deltaMS: number): AgentState;
    exit(agent: IAgent){

    }
}
export class IdleState extends AgentState{
    static create(){ return new IdleState({act: 'idle'})}
    _act(agent: IAgent, deltaMS: number): AgentState{
        if (this.Elapsed < 200){
            return this;
        }
        if (agent instanceof Bean && agent.city){
            if (agent.discrete_food <= GoodToThreshold['food'].sufficient*2){
                
                return TravelState.createFromIntent(agent, {act: 'buy', good: 'food'});
            }
            if (agent.daysSinceSlept >= DaysUntilSleepy){
                
                return TravelState.createFromIntent(agent, {act: 'buy', good: 'shelter'});
            }
            if (agent.discrete_health <= GoodToThreshold['medicine'].sufficient*2){
                
                return TravelState.createFromIntent(agent, {act: 'buy', good: 'medicine'});
            }
            
            return TravelState.createFromIntent(agent, {act: 'work', good: JobToGood(agent.job)});
        }
        return this;
    }
}

export function IntentToDestination(agent: IAgent, intent: IActivityData): Point[]{
    if (!(agent instanceof Bean) || agent.city == null)
        return [];

    switch(intent.act){
        case 'buy':
            if (intent.good)
                return RouteRandom(agent.city, agent, GoodToBuilding[intent.good]);
        case 'work':
            return RouteRandom(agent.city, agent, JobToBuilding[agent.job]);
    }
    return [];
}

export class TravelState extends AgentState{
    static createFromIntent(agent: IAgent, intent: IActivityData){
        return this.createFromDestination(IntentToDestination(agent, intent), intent);
    }
    static createFromDestination(destinations: Point[], intent: IActivityData){ 
        return new TravelState({act: 'travel', destinations: destinations, intent: intent});
    }
    _act(agent: IAgent, deltaMS: number): AgentState{
        
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
        } else {
            return this;
        }
    }
}
export class WorkState extends AgentState{
    static create(good: TraitGood){ return new WorkState({act: 'work', good: good})}
    _act(agent: IAgent, deltaMS: number): AgentState{
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
    _act(agent: IAgent, deltaMS: number): AgentState{
        if (!this._bought){
            if (this.sinceLastAttemptMS > 250)
            {
                this.tryBuy(agent);
                if(this.attempts >= 3 && (this.data.good == 'food' || this.data.good == 'medicine') &&
                    agent instanceof Bean &&
                    agent.getCrimeDecision(this.data.good, 'desperation')){
                    return CrimeState.create(this.data.good);
                }
            }
        }
        if (this.Elapsed > 1500)
            return IdleState.create();
        else
            return this;
    }
}
export class ChatState extends AgentState{
    static create(intent: IActivityData){ return new ChatState({act: 'chat', intent: intent})}
    _act(agent: IAgent, deltaMS: number): AgentState{
        
        return this;
    }
}
export class CrimeState extends AgentState{
    static create(good: 'food'|'medicine'){ return new CrimeState({act: 'crime', good: good})}
    _act(agent: IAgent, deltaMS: number): AgentState{
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
    'crime': (data) => new BuyState(data)
}

export const GetPriority = {
    work: function(bean:Bean): number{
        if (bean.city){
            return bean.cash / bean.city.costOfLiving / 2;
        } else {
            return 0;
        }
    },
    food: function(bean:Bean, difficulty: IDifficulty): number{
        return 0.5 + (bean.discrete_food / difficulty.bean_life.vital_thresh.food.sufficient )
    },
    shelter: function(bean:Bean, difficulty: IDifficulty): number{
        return 1 + (1/bean.daysSinceSlept / difficulty.bean_life.vital_thresh.shelter.sufficient )
    },
    medicine:function(bean:Bean, difficulty: IDifficulty): number{
        return 1 + (bean.discrete_health / difficulty.bean_life.vital_thresh.medicine.sufficient )
    },
}

export function GetPriorities(bean: Bean, difficulty: IDifficulty): PriorityQueue<IActivityData>{
    const queue = new PriorityQueue<IActivityData>([]);
    let node = new PriorityNode<IActivityData>({act: 'work', good: JobToGood(bean.job)} as IActivityData, GetPriority.work(bean));
    queue.enqueue(node)
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'food'} as IActivityData, GetPriority.food(bean, difficulty));
    queue.enqueue(node)
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'shelter'} as IActivityData, GetPriority.shelter(bean, difficulty));
    queue.enqueue(node)
    node = new PriorityNode<IActivityData>({act: 'buy', good: 'medicine'} as IActivityData, GetPriority.medicine(bean, difficulty));
    queue.enqueue(node)
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

/**
 * a bean is a citizen with preferences
 */
export interface IBean{    
    key: number;
    cityKey: number;
    name: string;
    community: TraitCommunity;
    ideals: TraitIdeals;
    ethnicity: TraitEthno;
    faith?: TraitFaith;
    shelter: TraitShelter;
    health: TraitHealth;
    discrete_food: number;
    cash: number;
    dob: IDate;
    sanity: TraitSanity;
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
export function RouteRandom(geo: Geography, mover: IMover, buildingType: BuildingTypes){
    const destination: IBuilding = GetRandom(geo.byType[buildingType].all);
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
    const address: HexPoint = geo.byType[destination.type].coordByID[destination.key];
    const start = geo.movers['bean'][mover.key];
    const nearestHex = pixel_to_hex(geo.hex_size, geo.petriOrigin, start);
    return hex_linedraw(nearestHex, address).map((h) => hex_to_pixel(geo.hex_size, geo.petriOrigin, h)).map((x, i, a) => {
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