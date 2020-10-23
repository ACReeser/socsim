import { Agent } from "https";
import { Bean } from "../Bean";
import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitGood, GoodToThreshold } from "../World";
import { GetRandom } from "../WorldGen";
import { BuildingTypes, Geography, GoodToBuilding, HexPoint, hex_linedraw, hex_to_pixel, IBuilding, move_towards, pixel_to_hex, Point, Vector } from "./Geography";
import { IDate } from "./Time";

export type Act = 'travel'|'work'|'sleep'|'chat'|'soapbox'|'craze'|'idle'|'buy';

/**
 * cruise == interruptible travel towards destination
 * 
 * approach == uninterruptible travel into destination slot
 */
export type Travel = 'cruise'|'approach';

export interface IActivityData {
    act: Act;
    points?: Point[]; //point to travel to??
    intent?: IActivityData; //when travelling, what do you intend to do next
    good?: TraitGood; //good to buy or work
    timeSpent?: number; //time spent on this action
    travel?: Travel;
}

export interface IAgent {
    state: AgentState;
}
export function ChangeState(agent: IAgent, newState: AgentState){
    agent.state.exit(agent);
    agent.state = newState;
    agent.state.enter(agent);
}
export function Act(agent: IAgent): void{
    const result = agent.state.act(agent);
    if (result != agent.state){
        ChangeState(agent, result);
    }
}

export abstract class AgentState{
    constructor(public data: IActivityData){}
    enter(agent: IAgent){

    }
    act(agent: IAgent): AgentState{
        
        return this;
    }
    exit(agent: IAgent){

    }
    //todo: add an animate() that gets called in between logic ticks
}
export class IdleState extends AgentState{
    static create(){ return new IdleState({act: 'idle'})}
    act(agent: IAgent): AgentState{
        if (agent instanceof Bean && agent.city){
            if (agent.discrete_food < GoodToThreshold['food'].sufficient){
                const points = RouteRandom(agent.city, agent, GoodToBuilding['food']) 
                return TravelState.create(points, {act: 'buy', good: 'food'});
            }
        }
        return this;
    }
}
export class TravelState extends AgentState{
    static create(points: Point[], intent: IActivityData){ 
        return new TravelState({act: 'travel', points: points, intent: intent})}
    act(agent: IAgent): AgentState{
        if (agent instanceof Bean && agent.city){
            
            if (this.data.points && this.data.points.length){
                const pos = agent.city.how['bean'][agent.key];
                const target = this.data.points[0];
                const newPos = move_towards(pos, target, agent.speed);
                console.log({x: pos.x-newPos.x, y: pos.y-newPos.y});
                if (agent.key === 0){
                }
                agent.city.how['bean'][agent.key] = newPos;
                if (newPos.x == target.x && newPos.y == target.y){
                    this.data.points.shift();
                }
            } else if (this.data.intent){
                return ActToState[this.data.intent.act](this.data.intent);
            }
        }
        return this;
    }
}
export class WorkState extends AgentState{
    static create(good: TraitGood){ return new WorkState({act: 'work', good: good})}
    act(agent: IAgent): AgentState{
        
        return this;
    }
}
export class BuyState extends AgentState{
    static create(good: TraitGood){ return new BuyState({act: 'buy', good: good})}
    act(agent: IAgent): AgentState{
        
        return this;
    }
}
export class ChatState extends AgentState{
    static create(intent: IActivityData){ return new ChatState({act: 'chat', intent: intent})}
    act(agent: IAgent): AgentState{
        
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
    sanity: number;
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
        const pos = geo.how['bean'][mover.key];
        const target = mover.markers[0];
        const newPos = move_towards(pos, target, mover.speed);
        geo.how['bean'][mover.key] = newPos;
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
    const destination: IBuilding = GetRandom(geo.what[buildingType]);
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
    const address: HexPoint = geo.where[destination.type][destination.key];
    const start = geo.how['bean'][mover.key];
    const nearestHex = pixel_to_hex(geo.hex_size, geo.petriOrigin, start);
    return hex_linedraw(nearestHex, address).map((h) => hex_to_pixel(geo.hex_size, geo.petriOrigin, h));
}
export function Approach(geo: Geography, mover: IMover){

}