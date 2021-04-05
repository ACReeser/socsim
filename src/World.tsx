import * as React from 'react';
import { Bean } from './simulation/Bean';
import { Economy } from './simulation/Economy';
import { Policy, Party, BaseParty, ICityPartyHQ } from './simulation/Politics';
import { IInstitution, IOrganization, Charity } from './simulation/Institutions';
import { IEvent, EventBus, LiveList } from './events/Events';
import { Season, IDate, Hour } from './simulation/Time';
import { Government } from './simulation/Government';
import { Player, TechData } from './simulation/Player';
import { accelerate_towards, accelerator_coast, Geography, move_towards } from './simulation/Geography';
import { City, Pickup } from './simulation/City';
import { shuffle } from './simulation/Utils';
import { Act, IActListener, IChatData } from './simulation/Agent';
import { IDifficulty, PlayerResources } from './Game';
import { type } from 'os';
import { GetHedonReport, IsBeliefDivergent, SecondaryBeliefData, TraitBelief } from './simulation/Beliefs';
import { WorldSound } from './WorldSound';
import { GetMarketTraits, MarketTraitListing } from './simulation/MarketTraits';

export interface IBeanContainer{
    /**
     * all beans ever, including dead ones
     */
    historicalBeans: LiveList<Bean>;
    /**
     * current non-dead beans
     */
    beans: LiveList<Bean>;
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
const PickupPhysics = {
    Brake: { x: .94, y: .94},
    AccelerateS: 60,
    MaxSpeed: 9,
    CollisionDistance: 10
}
export const BeanPhysics = {
    Brake: { x: .94, y: .94},
    AccelerateS: 10,
    MaxSpeed: 4,
    CollisionDistance: 10
}
const MaxHedonHistory = 5;
export class World implements IWorld, IBeanContainer, IActListener{
    public readonly bus = new EventBus();
    public readonly economy: Economy = new Economy(this.bus);
    public cities: City[] = [];
    public law: Government = new Government();
    public institutions: IInstitution[] = [];
    public marketTraitsForSale: LiveList<MarketTraitListing> = new LiveList<MarketTraitListing>([]);
    public party: Party = new BaseParty();
    public date: IDate = {year: 1, season: Season.Spring, day: 1, hour: 1};

    public alien: Player = new Player();
    public sfx = new WorldSound();

    public get beans(): LiveList<Bean>{
        return new LiveList(this.cities.reduce((list, c) => {
            return list.concat(c.beans.get);
        }, [] as Bean[]));
    }
    public get historicalBeans(): LiveList<Bean>{
        return new LiveList(this.cities.reduce((list, c) => {
            return list.concat(c.historicalBeans.get);
        }, [] as Bean[]));
    }
    public get organizations(): IOrganization[]{
        return this.institutions.reduce((list, institute) => {
            return list.concat(institute.organizations);
        }, [] as IOrganization[]);
    }

    constructor(){
        this.bus.death.subscribe(this.onBeanDie);
        this.marketTraitsForSale.set(GetMarketTraits());
    }

    /**
     * update 'pushed' state
     */
    public calculateComputedState(){
        this.cities.forEach(c => {
            c.calculate(this.economy, this.law);
            c.beans.get.forEach(b => b.calculateBeliefs(this.economy, c, this.law, this.party));
        });
    }

    /**
     * simulates a season passing, setting a lot of state
     */
    public simulate_world(){
        this.date.hour++
        if (this.date.hour > Hour.Evening){
            this.date.hour = 0;
            this.date.day++;
            this.beans.get.forEach((x) => {
                if (x.hedonHistory.length >= MaxHedonHistory) {
                    x.hedonHistory.pop();
                }
                x.hedonHistory.unshift({});
            });
            if (this.date.day % 7 === 0){
                this.marketTraitsForSale.set(GetMarketTraits());
                this.publishEvent({message: 'New traits in the Emotion Market!', icon: '🛍️', trigger: 'marketrefresh'});
            }
        }
        if (this.date.day > 30){
            this.date.day = 1;
            this.economy.resetMonthlyDemand();
            this.date.season++;
        }
        if (this.date.season > 3){
            this.date.year++;
            this.inflate();
            this.resetYearlyCounters();
            this.date.season = 0;
        }

        this.alien.bots.amount += this.alien.bots.income;
        this.alien.energy.amount += this.alien.energy.income;
        if (this.alien.hasResearched('fast_resources')){
            this.alien.bots.amount += this.alien.bots.income*0.5;
            this.alien.energy.amount += this.alien.energy.income*0.5;
        }
        if (this.alien.currentlyResearchingTech){
            const tech = this.alien.currentlyResearchingTech;
            if(this.alien.techProgress[tech] == null){
                this.alien.techProgress[tech] = {
                    researchPoints: 0
                }
            }
            const max = TechData[tech].techPoints;
            const current = this.alien.techProgress[tech].researchPoints;
            if (current < max)
                this.alien.techProgress[tech].researchPoints += this.alien.abductedBeans.length;
            if (current >= max)
                this.alien.currentlyResearchingTech = undefined;
        }
        

        this.organizations.forEach((org) => org.work(this.law, this.economy));
        
        this.beans.get.forEach((b: Bean, i: number) => {
            b.age(this.economy, this.alien.difficulty);
            const e = b.maybeBaby(this.economy);
            if (e) {
                this.publishEvent(e);
                this.sfx.play('squeak');
            }
            if (b.job === 'jobless')
                b.tryFindRandomJob(this.law);
            
            b.happiness = GetHedonReport(b.hedonHistory);
        });
        this.cities.forEach((c) => c.getTaxesAndDonations(this.party, this.economy));
        this.calculateComputedState();
        this.alien.checkGoals(this);
        this.alien.checkReportCard(this);
    }
    simulate_beans(deltaMS: number){
        this.beans.get.forEach((b) => {
            Act(b, deltaMS, this.alien.difficulty, this);
        });
    }
    simulate_pickups(deltaMS: number){
        const city = this.cities[0];
        const pickups = city.pickups.get;
        //go backwards because we'll modify the array as we go
        for(let i = pickups.length - 1; i >= 0; i--) {
            const pickup = pickups[i];
            let collide = false;
            const magnet = city.pickupMagnetPoint.get;
            if (magnet){
                collide = accelerate_towards(
                    pickup, 
                    magnet, 
                    PickupPhysics.AccelerateS * deltaMS/1000, 
                    PickupPhysics.MaxSpeed, 
                    PickupPhysics.CollisionDistance,
                    PickupPhysics.Brake);
            } else {
                accelerator_coast(pickup, PickupPhysics.Brake);
            }
            if (collide){
                const amt = EmotionWorth[pickup.type];
                this.alien.hedons.amount += amt;
                this.alien.hedons.change.publish({change: amt});
                city.pickups.remove(pickup);
                this.sfx.play(pickup.type);
            } else {
                pickup.onMove.publish(pickup.point);
            }
        }
    }
    onChat = (b: Bean, chat: IChatData) => {
        if (this.party && chat.preachBelief){
            if (IsBeliefDivergent(chat.preachBelief, this.party.ideals, this.party.community)){
                this.publishEvent({
                    icon: '🚨', trigger: 'speechcrime',
                    message: `Speechcrime! ${b.name} is talking about ${SecondaryBeliefData[chat.preachBelief].noun}`,
                    beanKey: b.key
                });
                if (this.alien.speechcrimes[this.date.year] == null)
                    this.alien.speechcrimes[this.date.year] = 1;
                else
                    this.alien.speechcrimes[this.date.year]++;
            }
        }
    }
    onBeanDie = (e: IEvent) => {
        const city = this.cities.find((x) => x.key === e.cityKey);
        if (city){
            const bean = city.historicalBeans.get.find((x) => x.key === e.beanKey);
            if (bean){
                city.onCitizenDie(bean);
                this.economy.onBeanDie(bean);
            }
        }
    }
    onEmote = (b: Bean, emote: TraitEmote) => {
    }
    publishEvent(e: IEvent){
        this.bus[e.trigger].publish(e);
    }
    inflate() {
        const allMoney = this.beans.get.reduce((sum, b) => sum+b.cash, 0) + this.organizations.reduce((sum, o) => sum + o.cash, 0);
        const percent = allMoney / 100;
        const yearlyInflationDollars = Math.round(percent * 1);
        if (yearlyInflationDollars > 0){
            const richest = this.beans.get.reduce((obj: {winner?: Bean, max: number}, b) => {
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
export type TraitFaith = 'rocket'|'music'|'dragon'|'noFaith';
export type TraitFood = 'starving'|'hungry'|'sated'|'stuffed';
export type TraitStamina = 'homeless'|'sleepy'|'awake'|'rested';
export type TraitHealth = 'sick'|'sickly'|'bruised'|'fresh';
export type TraitSanity = 'psychotic'|'disturbed'|'stressed'|'sane';
export type TraitJob = 'farmer'|'builder'|'doc'|'entertainer'|'cleric'|'polit'|'jobless';

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith|TraitFood|TraitStamina|TraitHealth|TraitSanity;

export const TraitIcon: {[key in Trait]: string} = {
    'state': '🕊️', 'ego': '🦅',
    'prog': '⚖️', 'trad': '👑',
    'circle': '🤎', 'square': '💛', 'triangle': '🧡',
    'rocket': '🚀', 'music': '🎵', 'dragon': '🐲',
    'noFaith': '⚫️',
    'starving': '🍴', 'hungry': '🍽️', 'sated': '🥜', 'stuffed': '🥩',
    'homeless': '🌨️', 'sleepy': '🌙', 'awake': '☀️', 'rested': '🌞',
    'sick': '🤢', 'sickly': '😷', 'bruised': '🩹', 'fresh': '💪',
    'psychotic': '🤪', 'disturbed': '🤤', 'stressed':'', 'sane': '🧠',
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

export const TraitToModifier: {[key in TraitFood|TraitStamina|TraitHealth]: IHappinessModifier} = {
    'homeless': {reason: 'Homeless', mod: MaslowHappinessScore.Deficient},
    'sleepy': {reason: 'Renting', mod: MaslowHappinessScore.Sufficient},
    'awake': {reason: 'Homeowner', mod: MaslowHappinessScore.Sufficient},
    'rested': {reason: 'Homeowner', mod: MaslowHappinessScore.Abundant},
    'sick': {reason: 'Sick', mod: MaslowHappinessScore.Deficient},
    'sickly': {reason: 'Sick', mod: MaslowHappinessScore.Sufficient},
    'bruised': {reason: 'Bruised', mod: MaslowHappinessScore.Sufficient},
    'fresh': {reason: 'Healthy', mod: MaslowHappinessScore.Abundant},
    'starving': {reason: 'Hungry', mod: MaslowHappinessScore.Deficient},
    'hungry': {reason: 'Hungry', mod: MaslowHappinessScore.Sufficient},
    'sated': {reason: 'Sated', mod: MaslowHappinessScore.Sufficient},
    'stuffed': {reason: 'Stuffed', mod: MaslowHappinessScore.Abundant},
}
export interface IThreshold {warning: number, sufficient: number, abundant: number}
export const GoodToThreshold: {[key in TraitGood]: IThreshold} = {
    'food': {warning: 0.5, sufficient: 1, abundant: 3},
    'shelter': {warning: 0.5, sufficient: 1, abundant: 7},
    'medicine': {warning: 0.5, sufficient: 1, abundant: 3},
    'fun': {warning: 0.1, sufficient: 1, abundant: 3},
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
    'shelter': '🏠', 
    'medicine': '💊', 
    'fun': '👏'
};

export type TraitEmote = 'happiness'|'unhappiness'|'love'|'hate';
export const EmoteIcon: {[key in TraitEmote]: string} ={
    'love': '💛',
    'happiness': '👍',
    'unhappiness': '💢',
    'hate': '💔'
};
export const EmotionWorth: {[key in TraitEmote]: number} ={
    'love': 5,
    'happiness': 1,
    'unhappiness': -1,
    'hate': -5
};
export const EmotionSanity: {[key in TraitEmote]: number} ={
    'love': 1,
    'happiness': 0.2,
    'unhappiness': 0,
    'hate': -1
};