import * as React from 'react';
import { GetRandom, RandomEthno, GenerateBean } from './WorldGen';
import { Bean } from './simulation/Bean';
import { Economy } from './simulation/Economy';
import { Policy, Party, BaseParty, ICityPartyHQ } from './simulation/Politics';
import { IInstitution, IOrganization, Charity } from './simulation/Institutions';
import { IEvent, EventBus } from './events/Events';
import { Season, IDate } from './simulation/Time';
import { Government } from './simulation/Government';
import { Player } from './simulation/Player';
import { Geography } from './simulation/Geography';
import { City } from './simulation/City';
import { shuffle } from './simulation/Utils';
import { Act } from './simulation/Agent';
import { IDifficulty } from './Game';
import { type } from 'os';


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

export interface IWorld{
    cities: City[];
    law: Government;
    party: Party;

    institutions: IInstitution[];
    bus: EventBus;
    date: IDate;
    alien: Player;
}
export class World implements IWorld, IBeanContainer{
    public cities: City[] = [];
    public law: Government = new Government();
    public economy: Economy = new Economy();
    public institutions: IInstitution[] = [];
    public party: Party = new BaseParty();
    public date: IDate = {year: 1, season: Season.Spring, day: 1};

    public yearsEvents: IEvent[] = [];
    public bus = new EventBus();
    public alien: Player = new Player();

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
            c.beans.forEach(b => b.calculateBeliefs(this.economy, c, this.law, this.party));
        });
    }

    /**
     * simulates a season passing, setting a lot of state
     */
    public simulate_world(){
        
        this.date.day++;
        if (this.date.day > 30){
            this.date.day = 1;
            this.date.season++;
        }
        if (this.date.season > 3){
            this.date.year++;
            this.inflate();
            this.resetYearlyCounters();
            this.date.season = 0;
        }

        this.alien.bots.amount += this.alien.bots.income / 30;
        this.alien.energy.amount += this.alien.energy.income / 30;
        this.alien.psi.amount += this.alien.psi.income / 30;
        
        this.economy.resetSeasonalDemand();

        this.institutions.forEach((i) => i.fundOrganizations());

        this.organizations.forEach((org) => org.work(this.law, this.economy));
        
        shuffle(this.beans).forEach((b: Bean) => {
            let e = b.age(this.economy);
            if (e) this.yearsEvents.push(e);
            e = b.maybeBaby(this.economy);
            if (e) this.yearsEvents.push(e);
        });
        this.cities.forEach((c) => c.getTaxesAndDonations(this.party, this.economy));
        this.calculateComputedState();
        this.alien.checkGoals(this);
    }
    simulate_beans(deltaMS: number){
        this.beans.forEach((b) => {
            Act(b, deltaMS, this.alien.difficulty);
        })
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


export type TraitCommunity = 'state'|'ego';
export type TraitIdeals = 'prog'|'trad';
export type TraitEthno = 'circle'|'square'|'triangle';
export type TraitFaith = 'book'|'music'|'heart'|'noFaith';
export type TraitFood = 'hungry'|'sated'|'stuffed';
export type TraitShelter = 'podless'|'crowded'|'homeowner';
export type TraitHealth = 'sick'|'bruised'|'fresh';
export type TraitSanity = 'mad'|'confused'|'sane';
export type TraitJob = 'farmer'|'builder'|'doc'|'entertainer'|'cleric'|'polit'|'jobless';

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith|TraitFood|TraitShelter|TraitHealth|TraitSanity;
export type Axis = 'wel_food'|'wel_house'|'wel_health'|'tax_basic'|'tax_second'|'econ_ex'|'econ_labor'|'econ_sub'|'cul_rel'|'cul_theo'|'cul_ed'|'law_vote'|'law_bribe'|'law_imm'|'all';

export const TraitIcon: {[key in Trait]: string} = {
    'state': '🕊️', 'ego': '🦅',
    'prog': '⚖️', 'trad': '👑',
    'circle': '🤎', 'square': '💛', 'triangle': '🧡',
    'book': '', 'music': '', 'heart': '',
    'noFaith': '',
    'hungry': '🍽️', 'sated': '🥜', 'stuffed': '🥩',
    'podless': '🌨️', 'crowded': '🏘️', 'homeowner': '🏡',
    'sick': '🤢', 'bruised': '🩹', 'fresh': '💪',
    'mad': '🤪', 'confused': '🤤', 'sane': '🧠',
}
export enum MaslowHappinessScore {Deficient= -.25, Sufficient=0, Abundant=.15}

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

export const TraitToModifier: {[key in TraitFood|TraitShelter|TraitHealth]: IHappinessModifier} = {
    'podless': {reason: 'Homeless', mod: MaslowHappinessScore.Deficient},
    'crowded': {reason: 'Renting', mod: MaslowHappinessScore.Sufficient},
    'homeowner': {reason: 'Homeowner', mod: MaslowHappinessScore.Abundant},
    'sick': {reason: 'Sick', mod: MaslowHappinessScore.Deficient},
    'bruised': {reason: 'Bruised', mod: MaslowHappinessScore.Sufficient},
    'fresh': {reason: 'Healthy', mod: MaslowHappinessScore.Abundant},
    'hungry': {reason: 'Hungry', mod: MaslowHappinessScore.Deficient},
    'sated': {reason: 'Sated', mod: MaslowHappinessScore.Sufficient},
    'stuffed': {reason: 'Stuffed', mod: MaslowHappinessScore.Abundant},
}
export interface IThreshold {sufficient: number, abundant: number}
export const GoodToThreshold: {[key in TraitGood]: IThreshold} = {
    'food': {sufficient: 1, abundant: 3},
    'shelter': {sufficient: 1, abundant: 7},
    'medicine': {sufficient: 1, abundant: 3},
    'fun': {sufficient: 1, abundant: 3},
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
export const GoodIcon: {[key in TraitGood]: string} ={
    'food': '🥪',
    'shelter': '', 
    'medicine': '💊', 
    'fun': '👏'
};