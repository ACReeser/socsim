import * as React from 'react';
import { GetRandom, RandomEthno, GenerateBean } from './WorldGen';
import { maxHeaderSize } from 'http';
import { Bean, IBean } from './Bean';
import { Economy } from './Economy';
import { Policy, Party, BaseParty, ICityPartyHQ } from './Politics';
import { IInstitution, IOrganization, Charity } from './simulation/Institutions';
import { IEvent, EventBus } from './events/Events';

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

export interface IWorld extends IEnvironment{
    cities: City[];
    law: Law;
    party: Party;
    electionIn: number;
    institutions: IInstitution[];
    bus: EventBus;
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
    public year = 0;
    public season = Season.Spring;
    public electionIn = 11;
    public yearsEvents: IEvent[] = [];
    public bus = new EventBus();

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
            c.calculate(this.economy, this.law);
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
            this.inflate();
            this.resetYearlyCounters();
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
        this.cities.forEach((c) => c.getTaxesAndDonations(this.party, this.economy));
        shuffle(this.beans).forEach((b: Bean) => {
            b.maybeOverconsume(this.economy);
        });
        this.calculateComputedState();
    }
    inflate() {
        const allMoney = this.beans.reduce((sum, b) => sum+b.cash, 0) + this.organizations.reduce((sum, o) => sum + o.cash, 0);
        const percent = allMoney / 100;
        const yearlyInflationDollars = Math.round(percent * 1);
        if (yearlyInflationDollars > 0){
            const richest = this.beans.reduce((obj: {winner?: Bean, max: number}, b) => {
                if (b.cash > obj.max){
                    obj.winner = b;
                    obj.max = b.cash;
                }
                return obj;
            }, {max: 0});
            if (richest.winner){
                richest.winner.cash += yearlyInflationDollars;
            }
        }
    }
    resetYearlyCounters() {
        this.yearsEvents = [];
        this.cities.forEach((c) => {
            c.yearsPartyDonations = 0;
        })
    }
    addCharity(good: TraitGood, name: string, budget: number) {
        const charity = new Charity();
        charity.name = name;
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

export interface IEnvironment{
    year: number;
    season: Season;
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
    public partyHQ?: ICityPartyHQ;
    public yearsPartyDonations: number = 0;
    public majorityEthnicity: TraitEthno = 'circle';

    public environment?: IEnvironment;
    public doOnCitizenDie: Array<(b: Bean, c: City) => void> = [];

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
        bean.partyLoyalty = Math.max(parent.partyLoyalty * 0.4, 0.2);
        bean.cash = parent.cash / 2;
        parent.cash /= 2;
        if (this.environment)
            bean.dob = this.environment?.year * 4 + this.environment?.season;
        this.historicalBeans.push(bean);
    }
    getTaxesAndDonations(party: Party, economy: Economy){
        if (this.partyHQ){
            this.beans.forEach((b) => {
                const donation = b.maybeDonate(economy);
                party.materialCapital += donation;
                this.yearsPartyDonations += donation;
            });
        }
    }
    calculate(economy: Economy, law: { policies: Policy[]; }) {
        const c = this.beans.reduce((count: {circle: number, square: number, triangle: number}, bean) => {
            switch(bean.ethnicity){
                case 'circle': count.circle++;break;
                case 'square': count.square++;break;
                case 'triangle': count.triangle++;break;
            }
            return count;
        }, {circle: 0, square: 0, triangle: 0});
        if (c.circle > c.square && c.circle > c.triangle){
            this.majorityEthnicity = 'circle';
        } else if (c.square > c.circle && c.square > c.triangle){
            this.majorityEthnicity = 'square';
        } else {
            this.majorityEthnicity = 'triangle';
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

export enum MaslowScore {Deficient= -.25, Sufficient=0, Abundant=.15}

export interface IHappinessModifier{
    reason: string;
    /**
     * -1 to 1, where 0 is "no effect" and +/-1 is +/-100%
     */
    mod: number;
}

export function GetHappiness(array: IHappinessModifier[]){
    const clampedPercent = Math.min(
        1,
        Math.max(
            -1,
            array.reduce((sum, hapMod) => {
                sum += hapMod.mod;
                return sum
            }, 0)
        )
    );

    return (clampedPercent * 100);
}

export const TraitToModifier: {[trait: string]: IHappinessModifier} = {
    'podless': {reason: 'Homeless', mod: MaslowScore.Deficient},
    'crowded': {reason: 'Renting', mod: MaslowScore.Sufficient},
    'homeowner': {reason: 'Homeowner', mod: MaslowScore.Abundant},
    'sick': {reason: 'Sick', mod: MaslowScore.Deficient},
    'bruised': {reason: 'Bruised', mod: MaslowScore.Sufficient},
    'fresh': {reason: 'Healthy', mod: MaslowScore.Abundant},
    'hungry': {reason: 'Hungry', mod: MaslowScore.Deficient},
    'sated': {reason: 'Sated', mod: MaslowScore.Sufficient},
    'stuffed': {reason: 'Stuffed', mod: MaslowScore.Abundant},
}

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