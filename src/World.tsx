import * as React from 'react';
import { Season, IDate } from './simulation/Time';
import { Act, IBean, IChatData } from './simulation/Agent';
import { IDifficulty, PlayerResources } from './Game';
import { type } from 'os';
import { GetHedonReport, IsBeliefDivergent, SecondaryBeliefData, TraitBelief } from './simulation/Beliefs';
import { WorldSfxInstance, WorldSound } from './WorldSound';
import { GetMarketTraits, MarketTraitListing } from './simulation/MarketTraits';
import { IWorldState } from './state/features/world';

export const PickupPhysics = {
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
export const MaxHedonHistory = 5;

export interface IEnvironment{
    year: number;
    season: Season;
}

export interface ITile {
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
export type TraitStamina = 'sleepy'|'awake'|'rested';
export type TraitHousing = 'homeless'|'housed';
export type TraitHealth = 'sick'|'sickly'|'bruised'|'fresh';
export type TraitSanity = 'psychotic'|'disturbed'|'stressed'|'sane';
export type TraitJob = 'farmer'|'builder'|'doc'|'entertainer'|'cleric'|'polit'|'jobless'|'cop';

export type Trait = TraitCommunity|TraitIdeals|TraitEthno|TraitFaith|TraitFood|TraitStamina|TraitHealth|TraitSanity|TraitHousing;

export const TraitIcon: {[key in Trait]: string} = {
    'state': '🕊️', 'ego': '🦅',
    'prog': '⚖️', 'trad': '👑',
    'circle': '🤎', 'square': '💛', 'triangle': '🧡',
    'rocket': '🚀', 'music': '🎵', 'dragon': '🐲',
    'noFaith': '⚫️',
    'starving': '🍴', 'hungry': '🍽️', 'sated': '🥜', 'stuffed': '🥩',
    'homeless': '🌨️', 'housed': '🚪', 'sleepy': '🌙', 'awake': '☀️', 'rested': '🌞',
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

export interface IThreshold {warning: number, sufficient: number, abundant: number}
export const GoodToThreshold: {[key in TraitGood]: IThreshold} = {
    'food': {warning: 0.5, sufficient: 1, abundant: 3},
    'medicine': {warning: 0.5, sufficient: 1, abundant: 3},
    'fun': {warning: 0.1, sufficient: 1, abundant: 3},
}

export function JobToGood(job: TraitJob): TraitGood{
    switch(job){
        case 'doc': return 'medicine';
        case 'entertainer': return 'fun';
        default: case 'farmer': return 'food';
    }
}
export function GoodToJob(good: TraitGood): TraitJob{
    switch(good){
        case 'medicine': return 'doc';
        case 'fun': return 'entertainer';
        default: case 'food': return 'farmer';
    }
}
export type TraitGood = 'food'|'medicine'|'fun';
export const GoodIcon: {[key in TraitGood]: string} ={
    'food': '🥪',
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

export function WorldInflate(world: IWorldState){
    const beans = world.beans.allIDs.reduce((arr, key) => { arr.push(world.beans.byID[key]); return arr;}, [] as IBean[])
    const allMoney = beans.reduce((sum, b) => sum+b.cash, 0);
    const percent = allMoney / 100;
    const yearlyInflationDollars = Math.round(percent * 1);
    if (yearlyInflationDollars > 0){
        const richest = beans.reduce((obj: {winner?: IBean, max: number}, b) => {
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