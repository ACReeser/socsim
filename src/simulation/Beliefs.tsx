import { TraitCommunity, TraitIdeals } from "../World";

export type TraitBelief = 'diligent'| //125% productive
'talkative'| // 100% chance to stop and talk
'athletic'| // takes less health damage
'parental'| // increased % of having kids
'open-minded'| // beliefs are easily changed
'afraid'| // takes extra sanity damage
'partisan'| // doesn't like beings that don't share ideals 
'friendly'| // likes all beings more
'chaotic'| // breaks rules easily
'optimistic'| // extra happiness
'realistic'| // lower happiness
'greedy'; // steal easier

export type BeliefSubject = 'self'|'other';
export const BeliefSubjectText: {[key in BeliefSubject]: string} ={
    other: 'People',
    self: 'I'
}
export const BeliefSubjectIcon: {[key in BeliefSubject]: string} ={
    other: '👇',
    self: '👀'
}
export type BeliefVerb = 'are'|'arenot';
export type BeliefSubjectVerbTree = {[key in BeliefSubject]: {[key in BeliefVerb]: string}};
export const BeliefVerbIcon: {[key in BeliefVerb]: string} ={
    are: '✔️',
    arenot: '🛑'
}
export const BeliefVerbText: BeliefSubjectVerbTree ={
    self: {
        are: 'can be',
        arenot: "shouldn't be"
    },
    other: {
        are: 'should be',
        arenot: 'cannot be'
    }
}
export interface BeliefData {
    text: string,
    description?: BeliefSubjectVerbTree,
    community?: TraitCommunity,
    ideal?: TraitIdeals
}
export const BeliefAdjData: {[key in TraitBelief]: BeliefData} = {
    diligent: {
        text: 'Diligent'
    },
    greedy: {
        text: 'Greedy'
    },
    afraid: {
        text: 'Afraid'
    },
    athletic: {
        text: 'Athletic'
    },
    chaotic: {
        text: 'Chaotic'
    },
    friendly: {
        text: 'Friendly'
    },
    optimistic: {
        text: 'Optimistic'
    },
    "open-minded": {
        text: 'Open-Minded'
    },
    parental: {
        text: 'Parental'
    },
    partisan: {
        text: 'Partisan'
    },
    realistic: {
        text: 'Realistic'
    },
    talkative: {
        text: 'Talkative'
    },
};

export interface BeliefSubjectOption {key: BeliefSubject};
export interface BeliefVerbOption {key: BeliefVerb};
export interface BeliefAdjOption {key: TraitBelief};

export const BeliefSubjectAll: BeliefSubject[] = ['self', 'other'];
export const BeliefVerbAll: BeliefVerb[] = ['are', 'arenot'];
export const BeliefsAll = Object.keys(BeliefAdjData).map((x) => x as TraitBelief);

export interface Belief{
    subject: BeliefSubject;
    verb: BeliefVerb;
    adj: TraitBelief;
}