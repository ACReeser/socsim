import * as React from 'react';

export interface World {
    cities: City[];
    law: Law;
    party: Party;
}

export interface Tile {
    name?: string, 
    url: string, 
    type: string,
    key: number
}

export interface City extends Tile {

}

export type TraitCommunity = 'state'|'ego';
export type TraitIdeals = 'prog'|'trad';
export type TraitEthno = 'circle'|'square'|'triangle';
export type TraitFaith = 'book'|'music'|'heart';

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith;
export type Axis = 'vote'|'healthcare'|'faith'|'trade';

/**
 * a bean is a citizen with preferences
 */
export interface Bean{
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

export interface Law {
    policies: Policy[];
}

export interface Party {
    name: string;
    availablePolicies: Policy[];
    proposedPolicy: Policy;
    availableCampaigns: Campaign[];
    activeCampaigns: Campaign[];
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