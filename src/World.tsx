import * as React from 'react';
import { GetRandom, RandomEthno } from './WorldGen';
import { maxHeaderSize } from 'http';
import { Bean, IBean } from './Bean';
import { Economy } from './Economy';
import { Policy, Party, BaseParty } from './Politics';

export enum Season {Spring, Summer, Fall, Winter}

export interface IBeanContainer{
    /**
     * all beans ever, including dead ones
     */
    historicalBeans: Bean[];
    /**
     * current non-dead beans
     */
    beans: Bean[];
}
export interface IEvent{
    icon: string;
    message: string;
}

export interface IWorld {
    cities: City[];
    law: Law;
    party: Party;
    year: number;
    season: Season;
    electionIn: number;
}
export class World implements IWorld, IBeanContainer{
    public cities: City[] = [];
    public law: {
        policies: Policy[]
    } = { 
        policies: [] 
    };
    public economy: Economy = new Economy();
    public party: Party = new BaseParty();
    public year = 1;
    public season = Season.Spring;
    public electionIn = 7;
    public yearsEvents: IEvent[] = [];

    public get beans(): Bean[]{
        return this.cities.reduce((list, c) => {
            return list.concat(c.beans);
        }, [] as Bean[]);
    }
    public get historicalBeans(): Bean[]{
        return this.cities.reduce((list, c) => {
            return list.concat(c.historicalBeans);
        }, [] as Bean[]);
    }

    /**
     * update 'pushed' state
     */
    public calculateComputedState(){
        this.cities.forEach(c => {
            c.beans.forEach(b => b.calculateBeliefs(c, this.law));
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
            this.yearsEvents = [];
            this.season = 0;
        }
        
        this.economy.resetSeasonalDemand();

        shuffle(this.beans).forEach((b: Bean) => {
            b.work(this.law, this.economy);
        });
        console.log(JSON.stringify(this.economy.book, (key, value) => {
            if (key != 'seller') return value;
            else return undefined;
        }, ' '));
        shuffle(this.beans).forEach((b: Bean) => {
            let e = b.eat(this.economy);
            if (e) this.yearsEvents.push(e);
            e = b.weather(this.economy);
            if (e) this.yearsEvents.push(e);
            e = b.age(this.economy);
            if (e) this.yearsEvents.push(e);
        });
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

export class City implements Tile, IBeanContainer {
    public name: string = '';
    public url: string = '';
    public type: string = '';
    public key: number = 0;
    public get beans(): Bean[] {
        return this.historicalBeans.filter((x) => x.alive);
    }
    public set beans(beans: Bean[]){
        throw "can't set city beans";
    }
    public historicalBeans: Bean[] = [];
    public houses: any[] = [];

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
            const shuffled = shuffle(this.beans);
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

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith|TraitFood|TraitShelter|TraitHealth;
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
export function GoodToJob(good: TraitGood): TraitJob{
    switch(good){
        case 'shelter': return 'builder';
        case 'medicine': return 'doc';
        case 'fun': return 'entertainer';
        default: case 'food': return 'farmer';
    }
}
export type TraitGood = 'food'|'shelter'|'medicine'|'fun';

export interface Law {
    policies: Policy[];
}