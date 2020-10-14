import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth } from "../World";
import { Vector } from "./Geography";
import { IDate } from "./Time";

export type Act = 'travel'|'chat'|'preach'|'work'|'sleep'|'craze'|'idle';

export interface IActivity {
    a: Act;
    params: {[key: string]: string};
}

export interface IAgent {
    activities: IActivity[];
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
    speed: number;
    direction: Vector;
}