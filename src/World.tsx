import * as React from 'react';
import { GetRandom, RandomEthno } from './WorldGen';
import { maxHeaderSize } from 'http';
import { Bean } from './Bean';

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

    public getAliveBeans(): Bean[]{
        return this.cities.reduce((list, c) => {
            return list.concat(c.beans.filter(x => x.alive));
        }, [] as Bean[]);
    }

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
        
        this.economy.resetSeasonalDemand();

        this.cities.forEach(c => {
            c.beans.forEach(b => {
                if (b.alive)             
                    b.work(this.law, c, this.economy);
            });
        });
        // console.log(JSON.stringify(this.economy.book, (key, value) => {
        //     if (key != 'seller') return value;
        //     else return undefined;
        // }, ' '));
        const shuffled = shuffle(this.getAliveBeans());
        shuffled.forEach((b) => {
            b.eat(this.economy);
            b.weather(this.economy);
            b.age(this.economy);
        })
        this.calculateComputedState();
    }
}
function shuffle(array: Array<any>) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
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
    onCitizenDeath(b: Bean){
        if (b.cash > 0){
            const shuffled = shuffle(this.beans.filter((x) => x.alive));
            if (shuffled.length > 0) {
                shuffled[0].cash += b.cash;
                b.cash = 0;
            }
        }
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
export interface Listing{
    sellerCityKey: number;
    sellerBeanKey: number;
    price: number;
    seller: Bean;
    quantity: number;
}
export type TraitGood = 'food'|'shelter'|'medicine'|'fun';
export class Economy {
    book: {[key in TraitGood]: Listing[]} = {
        food: [] as Listing[],
        shelter: [] as Listing[],
        medicine: [] as Listing[],
        fun: [] as Listing[],
    }
    unfulfilledSeasonalDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    constructor(){

    }
    public resetSeasonalDemand(){
        this.unfulfilledSeasonalDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    }
    tryTransact(buyer: Bean, good: TraitGood): {bought: number, price: number}|null {
        const demand = 1;
        if (this.book[good].length > 0){
            if (this.book[good][0].price <= buyer.cash){
                const purchase = this.book[good].splice(0, 1)[0];
                buyer.cash -= purchase.price;
                purchase.seller.cash += purchase.price;
                purchase.seller.seasonSinceLastSale--;
                return {
                    bought: demand,
                    price: purchase.price
                }
            }
        }
        this.unfulfilledSeasonalDemand[good] += demand;
        return null;
    }
    addList(seller: Bean, good: TraitGood, price: 1) {
        this.book[good].push({
            sellerCityKey: seller.cityKey,
            sellerBeanKey: seller.key,
            price: 1,
            seller: seller,
            quantity: 1
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