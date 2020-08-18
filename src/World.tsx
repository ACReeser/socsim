import * as React from 'react';
import { GetRandom, RandomEthno } from './WorldGen';
import { maxHeaderSize } from 'http';

export enum Season {Spring, Summer, Fall, Winter}

export interface World {
    cities: City[];
    law: Law;
    party: Party;
    year: number;
    season: Season;
    electionIn: number;
}

export interface Tile {
    name?: string, 
    url: string, 
    type: string,
    key: number
}

export class City implements Tile {
    public name: string = '';
    public url: string = '';
    public type: string = '';
    public key: number = 0;
    public beans: Bean[] = [];

    public avgSentiment(){

    }

    reportIdeals(): {avg: number, winner: Trait}{
        return this._report('ego' as Trait, (b) => b.ideals);
    }
    reportCommunity(): {avg: number, winner: Trait}{
        return this._report('state' as Trait, (b) => b.community);
    }
    reportEthno(): {avg: number, winner: Trait}{
        return this._report('circle' as Trait, (b) => b.ethnicity);
    }
    _report(defWin: Trait, beanPropGet: (bean: Bean) => Trait): {avg: number, winner: Trait}{
        const result = { avg: 0, winner: defWin };
        const all = this.beans.reduce((stash: any, bean) => {
            const value = beanPropGet(bean);
            if (stash[value] == null) { stash[value] = 1;}
            else { stash[value]++}
            return stash;
        }, {});
        Object.keys(all).forEach((trait) => {
            if (all[trait] > result.avg) {
                result.avg = all[trait];
                result.winner = trait as Trait;
            }
        });
        result.avg /= this.beans.length;
        return result;
    }
}

export type TraitCommunity = 'state'|'ego';
export type TraitIdeals = 'prog'|'trad';
export type TraitEthno = 'circle'|'square'|'triangle';
export type TraitFaith = 'book'|'music'|'heart'|'noFaith';
export type TraitFood = 'hungry'|'sated'|'stuffed';
export type TraitShelter = 'podless'|'crowded'|'homeowner';
export type TraitHealth = 'sick'|'bruised'|'fresh';

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith;
export type Axis = 'vote'|'healthcare'|'faith'|'trade';

export enum MaslowScore {Deficient= -2, Sufficient=0, Abundant=1}

export function ShelterScore(shelter: TraitShelter): number{
    switch(shelter){
        case 'podless': return MaslowScore.Deficient;
        default: case 'crowded': return MaslowScore.Sufficient;
        case 'homeowner': return MaslowScore.Abundant;
    }
}
export function HealthScore(health: TraitHealth): number{
    switch(health){
        case 'sick': return MaslowScore.Deficient;
        default: case 'bruised': return MaslowScore.Sufficient;
        case 'fresh': return MaslowScore.Abundant;
    }
}
export function FoodScore(food: TraitFood): number{
    switch(food){
        case 'hungry': return MaslowScore.Deficient;
        default: case 'sated': return MaslowScore.Sufficient;
        case 'stuffed': return MaslowScore.Abundant;
    }
}

/**
 * a bean is a citizen with preferences
 */
export interface IBean{
    key: number;
    cityKey: number;
    community: TraitCommunity;
    ideals: TraitIdeals;
    ethnicity: TraitEthno;
    faith?: TraitFaith;
    shelter: TraitShelter;
    health: TraitHealth;
    discrete_food: number;
    cash: number;
}

const MaslowHappinessWeight = 2;
const ValuesHappinessWeight = 1;
const TotalWeight = MaslowHappinessWeight + ValuesHappinessWeight;

export class Bean implements IBean{
    public key: number = 0;
    public cityKey: number = 0;
    public community: TraitCommunity = 'ego';
    public ideals: TraitIdeals = 'trad';
    public ethnicity: TraitEthno = RandomEthno();
    public faith?: TraitFaith;
    public shelter: TraitShelter = 'crowded';
    public health: TraitHealth = 'bruised';
    public discrete_food: number = 0;
    public get food(): TraitFood {
        if (this.discrete_food >= 3)
            return 'stuffed';
        else if (this.discrete_food >= 1)
            return 'sated'
        else
            return 'hungry';
    }
    public cash: number = 0;
    /**
     * normalized multiplier, 0-1
     */
    getMaslowSentiment(homeCity: City): number{
        let maslow = ShelterScore(this.shelter) + HealthScore(this.health) + FoodScore(this.food);
        //minimum of -6, max of 3, so 10 "buckets"
        return maslow / 10; //so divide by 10 to normalize
    }
    /**
     * non-normalized multiplier
     */
    getTotalSentiment(homeCity: City, law: Law): number{
        const maslow = this.getMaslowSentiment(homeCity) * MaslowHappinessWeight;
        const traits = this._getTraitMap();
        const values = this.getSentimentPolicies(traits, law.policies) * ValuesHappinessWeight;
        return (maslow + values) / TotalWeight;
    }
    /**
     * non-normalized multiplier
     */
    getSentimentPolicies(traits: {[x:string]:boolean}, policies: Policy[]){
        let multiplier = 0;
        policies.forEach((policy) => {
            policy.fx.forEach((fx) => {
                if (traits[fx.key])
                multiplier += fx.mag * 10; //-30 to +30
            });
        });
        return multiplier / 100;
    }
    _getTraitMap(){
        let traits = {[this.community]: true, [this.ideals]:  true, [this.ethnicity]: true};
        if (this.faith)
            traits[this.faith] = true;
        return traits;
    }
}

export interface Law {
    policies: Policy[];
}

export interface Party {
    name: string;
    availablePolicies: Policy[]; 
    proposedPolicy?: Policy;
    availableCampaigns: Campaign[];
    activeCampaigns: Campaign[];

    politicalCapital: number;
    materialCapital: number;
}

export interface PoliticalEffect {
    key: Trait;
    /**
     * magnitude (-3 to +3)
     */
    mag: number;
}
export interface Policy {
    key: string; 
    fx: PoliticalEffect[];
    axis?: Axis;
}
export interface Campaign {
    key: string; 
    fx: PoliticalEffect[];
    cityKey?: number;
}