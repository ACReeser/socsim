import { Agent } from "https";
import { Bean, DaysUntilSleepy } from "./Bean";
import { getRandomSlotOffset } from "../petri-ui/Building";
import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitGood, GoodToThreshold, JobToGood, TraitSanity } from "../World";
import { GetRandom } from "../WorldGen";
import { BuildingTypes, Geography, GoodToBuilding, HexPoint, hex_linedraw, hex_to_pixel, IBuilding, JobToBuilding, move_towards, pixel_to_hex, Point, Vector } from "./Geography";
import { IDate } from "./Time";
import { PubSub } from "../events/Events";

export type Act = 'travel'|'work'|'sleep'|'chat'|'soapbox'|'craze'|'idle'|'buy';

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
                const points = RouteRandom(agent.city, agent, GoodToBuilding['food']);
                return TravelState.create(points, {act: 'buy', good: 'food'});
            }
            if (agent.daysSinceSlept >= DaysUntilSleepy){
                const points = RouteRandom(agent.city, agent, GoodToBuilding['shelter']) 
                return TravelState.create(points, {act: 'buy', good: 'shelter'});
            }
            if (agent.discrete_health <= GoodToThreshold['medicine'].sufficient*2){
                const points = RouteRandom(agent.city, agent, GoodToBuilding['medicine']) 
                return TravelState.create(points, {act: 'buy', good: 'medicine'});
            }
            const points = RouteRandom(agent.city, agent, JobToBuilding[agent.job]);
            return TravelState.create(points, {act: 'work', good: JobToGood(agent.job)});
        }
        return this;
    }
}

export class TravelState extends AgentState{
    static create(destinations: Point[], intent: IActivityData){ 
        return new TravelState({act: 'travel', destinations: destinations, intent: intent})}
    _act(agent: IAgent, deltaMS: number){
        
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
    _act(agent: IAgent, deltaMS: number): AgentState{
        if (this.Elapsed > 1500 && agent instanceof Bean && this.data.good && agent.city?.economy){
            agent.buy[this.data.good](agent.city.economy);
            return IdleState.create();
        }
        return this;
    }
}
export class ChatState extends AgentState{
    static create(intent: IActivityData){ return new ChatState({act: 'chat', intent: intent})}
    _act(agent: IAgent, deltaMS: number): AgentState{
        
        return this;
    }
}

// ISSUE! can't use the "generic" constructor if the "specific" constructor exists!
const ActToState: {[key in Act]: (data: IActivityData) => AgentState} = {
    'idle': (data) => new IdleState(data),
    'work': (data) => new WorkState(data),
    'chat': (data) => new ChatState(data),
    'travel': (data) => new TravelState(data),
    'craze': (data) => new BuyState(data),
    'buy': (data) => new BuyState(data),
    'sleep': (data) => new BuyState(data),
    'soapbox': (data) => new BuyState(data),
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