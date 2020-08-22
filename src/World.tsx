import * as React from 'react';
import { GetRandom, RandomEthno, GenerateBean } from './WorldGen';
import { maxHeaderSize } from 'http';
import { Bean, IBean } from './Bean';
import { Economy } from './Economy';
import { Policy, Party, BaseParty } from './Politics';
import { IInstitution, IOrganization, Charity } from './simulation/Institutions';

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
    institutions: IInstitution[];
}
export class World implements IWorld, IBeanContainer{
    public cities: City[] = [];
    public law: {
        policies: Policy[]
    } = { 
        policies: [] 
    };
    public economy: Economy = new Economy();
    public institutions: IInstitution[] = [];
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
    public get organizations(): IOrganization[]{
        return this.institutions.reduce((list, institute) => {
            return list.concat(institute.organizations);
        }, [] as IOrganization[]);
    }

    /**
     * update 'pushed' state
     */
    public calculateComputedState(){
        this.cities.forEach(c => {
            c.beans.forEach(b => b.calculateBeliefs(this.economy, c, this.law));
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

        this.institutions.forEach((i) => i.fundOrganizations());

        shuffle(this.beans).forEach((b: Bean) => {
            b.work(this.law, this.economy);
        });

        this.organizations.forEach((org) => org.work(this.law, this.economy));
        // console.log(JSON.stringify(this.economy.book, (key, value) => {
        //     if (key != 'seller') return value;
        //     else return undefined;
        // }, ' '));
        shuffle(this.beans).forEach((b: Bean) => {
            let e = b.eat(this.economy);
            if (e) this.yearsEvents.push(e);
            e = b.weather(this.economy);
            if (e) this.yearsEvents.push(e);
            e = b.age(this.economy);
            if (e) this.yearsEvents.push(e);
            e = b.maybeBaby(this.economy);
            if (e) this.yearsEvents.push(e);
        });
        this.calculateComputedState();
    }
    addCharity(good: TraitGood, budget: number) {
        const charity = new Charity();
        charity.good = good;
        charity.seasonalBudget = budget;
        this.party.organizations.push(charity);
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
    public doOnCitizenDie: Array<(b: Bean, c: City) => void> = [];

    public avgSentiment(){

    }
    getRandomCitizen(): Bean|null{
        const shuffled = shuffle(this.beans);
        if (shuffled.length > 0) {
            return shuffled[0];
        } else {
            return null;
        }
    }
    onCitizenDie(deadBean: Bean){
        if (deadBean.cash > 0){
            const lucky = this.getRandomCitizen();
            if (lucky) {
                lucky.cash = lucky.cash + deadBean.cash;
                deadBean.cash = 0;
            }
        }
        this.doOnCitizenDie.forEach((x) => x(deadBean, this));
    }
    breedBean(parent: Bean) {
        let bean = GenerateBean(this, this.historicalBeans.length);
        bean.ethnicity = parent.ethnicity;
        bean.job = Math.random() <= .5 ? parent.job : GetRandom(['doc', 'farmer', 'builder', 'jobless']);
        bean.cash = parent.cash / 2;
        parent.cash /= 2;
        this.historicalBeans.push(bean);
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