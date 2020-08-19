import * as React from 'react';
import { GetRandom, RandomEthno } from './WorldGen';
import { maxHeaderSize } from 'http';

export enum Season {Spring, Summer, Fall, Winter}

export interface IWorld {
    cities: City[];
    law: Law;
    party: Party;
    year: number;
    season: Season;
    electionIn: number;
}
export class World implements IWorld{
    public cities: City[] = [];
    public law: {
        policies: Policy[]
    } = { 
        policies: [] 
    };
    public economy: Economy = new Economy();
    public party: Party = {} as Party;
    public year = 1;
    public season = Season.Spring;
    public electionIn = 7;

    /**
     * update 'pushed' state
     */
    public calculateComputedState(){
        this.cities.forEach(c => {
            c.beans.forEach(b => b.updateTotalSentiment(c, this.law));
        });
    }

    /**
     * simulates a season passing, setting a lot of state
     */
    public next(){
        this.electionIn--;
        if (this.electionIn <= 0){
            this.electionIn = 8;
        }
        this.season++;
        if (this.season > 3){
            this.year++;
            this.season = 0;
        }
        this.cities.forEach(c => {
            c.beans.forEach(b => {
                if (b.job == 'jobless')
                    b.tryFindJob(this.law, c);
                    
                b.work(this.law, c, this.economy);
            });
        });
        // console.log(JSON.stringify(this.economy.book, (key, value) => {
        //     if (key != 'seller') return value;
        //     else return undefined;
        // }, ' '));
        this.cities.forEach(c => {
            c.beans.forEach(b => {
                b.eat(c, this.economy);
                b.weather(c, this.economy);
                b.age(c, this.economy);
            });
        });
        this.calculateComputedState();
    }
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
export type TraitJob = 'farmer'|'builder'|'doc'|'entertainer'|'cleric'|'polit'|'jobless';

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
export function JobToGood(job: TraitJob): TraitGood{
    switch(job){
        case 'builder': return 'shelter';
        case 'doc': return 'medicine';
        case 'entertainer': return 'fun';
        default: case 'farmer': return 'food';
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
    public alive: boolean = true;

    public ethnicity: TraitEthno = RandomEthno();

    //maslow
    public discrete_food: number = 1;
    public get food(): TraitFood {
        if (this.discrete_food >= 3)
        return 'stuffed';
        else if (this.discrete_food >= 1)
        return 'sated'
        else
        return 'hungry';
    }
    public shelter: TraitShelter = 'crowded';
    public discrete_health: number = 2;
    public get health(): TraitHealth {
        if (this.discrete_health >= 3)
        return 'fresh';
        else if (this.discrete_health >= 1)
        return 'bruised'
        else
        return 'sick';
    }
    //values
    public community: TraitCommunity = 'ego';
    public ideals: TraitIdeals = 'trad';
    //other
    public job: TraitJob = 'jobless';
    public faith?: TraitFaith;
    public cash: number = 3;
    public lastSentiment: number = 0;
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
    updateTotalSentiment(homeCity: City, law: Law): void{
        const sentiment = this.getTotalSentiment(homeCity, law);
        this.lastSentiment = sentiment;
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
    getFace(): string{
        if (!this.alive)
            return '💀';
        if (this.food == 'hungry')
            return '😣';
        if (this.shelter == 'podless')
            return '🥶';
        if (this.health == 'sick')
            return '🤢';
        if (this.lastSentiment < 0)
            return '☹️';
        if (this.lastSentiment >= 1)
            return '🙂';
        if (this.job == 'jobless')
            return '😧';
        return '😐';
    }
    tryFindJob(law: { policies: Policy[]; }, c: City) {
        if (Math.random() > 0.5) {
            this.job = GetRandom(['builder', 'doc', 'farmer']);
        }
    }
    work(law: { policies: Policy[]; }, c: City, econ: Economy) {
        if (this.job != 'jobless'){
            econ.addList(this, JobToGood(this.job), 1);
        }
    }
    eat(c: City, economy: Economy) {
        if (this.job == 'farmer'){
            this.discrete_food += 1;
        } else {
            const groceries = economy.tryTransact(this, 'food');
            if (groceries)
                this.discrete_food += groceries.bought;
        }
        this.discrete_food -= 1;
    }
    weather(c: City, economy: Economy) {
        // const rent = economy.tryTransact(this, 'shelter');
        // if (rent)
        //     this.discrete_food += rent.bought;
    }
    age(c: City, economy: Economy) {
        if (this.job == 'doc'){
            this.discrete_health += 0.5;
        } else {
            const meds = economy.tryTransact(this, 'medicine');
            if (meds)
                this.discrete_health += meds.bought;
        }
        this.discrete_health -= 0.25;

        if (this.discrete_health < 0 && Math.random() >= 0.25)
            this.die();
    }
    die(){
        this.alive = false;
    }
}

export interface Listing{
    sellerCityKey: number;
    sellerBeanKey: number;
    price: number;
    seller: Bean;
}
export type TraitGood = 'food'|'shelter'|'medicine'|'fun';
export class Economy {
    book: {[key in TraitGood]: Listing[]} = {
        food: [] as Listing[],
        shelter: [] as Listing[],
        medicine: [] as Listing[],
        fun: [] as Listing[],
    }
    tryTransact(buyer: Bean, good: TraitGood): {bought: number, price: number}|null {
        if (this.book[good].length > 0){
            if (this.book[good][0].price <= buyer.cash){
                const purchase = this.book[good].splice(0, 1)[0];
                buyer.cash -= purchase.price;
                purchase.seller.cash += purchase.price;
                return {
                    bought: 1,
                    price: purchase.price
                }
            }
        }
        return null;
    }
    addList(seller: Bean, good: TraitGood, price: 1) {
        this.book[good].push({
            sellerCityKey: seller.cityKey,
            sellerBeanKey: seller.key,
            price: 1,
            seller: seller
        });
        //todo: sort book[good] by price
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