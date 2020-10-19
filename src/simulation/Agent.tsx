import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth } from "../World";
import { GetRandom } from "../WorldGen";
import { BuildingTypes, Geography, HexPoint, hex_linedraw, hex_to_pixel, IBuilding, move_towards, pixel_to_hex, Point, Vector } from "./Geography";
import { IDate } from "./Time";

export type Act = 'travel'|'work'|'sleep'|'chat'|'soapbox'|'craze'|'idle';

/**
 * cruise == interruptible travel towards destination
 * 
 * approach == uninterruptible travel into destination slot
 */
export type Travel = 'cruise'|'approach';

export interface IActivity {
    a: Act;
    params: {[key: string]: string};
}

export interface IAgent {
    activity_queue: IActivity[];
}

/**
 * targetLocations: []
 */

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
    mover.markers = hex_linedraw(nearestHex, address).map((h) => hex_to_pixel(geo.hex_size, geo.petriOrigin, h));
}
export function Approach(geo: Geography, mover: IMover){

}