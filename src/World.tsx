import * as React from 'react';
import { GetRandom, RandomEthno } from './WorldGen';

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

}

export type TraitCommunity = 'state'|'ego';
export type TraitIdeals = 'prog'|'trad';
export type TraitEthno = 'circle'|'square'|'triangle';
export type TraitFaith = 'book'|'music'|'heart'|'noFaith';

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith;
export type Axis = 'vote'|'healthcare'|'faith'|'trade';

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
    wealth: number;
    health: number;
    food: number;
}
export class Bean implements IBean{
    public key: number = 0;
    public cityKey: number = 0;
    public community: TraitCommunity = 'ego';
    public ideals: TraitIdeals = 'trad';
    public ethnicity: TraitEthno = RandomEthno();
    public faith?: TraitFaith;
    public wealth: number = 0;
    public health: number = 0;
    public food: number = 0;
    /**
     * happiness! 0-100
     */
    getBaseSentiment(homeCity: City): number{
        return 0;
    }
    getTotalSentiment(homeCity: City, law: Law): number{
        let sent = this.getBaseSentiment(homeCity);
        const traits = this._getTraitMap();
        sent = this.getSentimentPolicies(sent, traits, law.policies);
        return sent;
    }
    getSentimentPolicies(sentiment: number, traits: {[x:string]:boolean}, policies: Policy[]){
        policies.forEach((policy) => {
            policy.fx.forEach((fx) => {
                if (traits[fx.key])
                sentiment += fx.mag *10
            });
        });
        return sentiment;
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
    proposedPolicy: Policy;
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