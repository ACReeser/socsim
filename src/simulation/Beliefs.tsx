import { TraitCommunity, TraitFaith, TraitIdeals } from "../World";

export type TraitBelief = 'Diligence'| // happy from work
'Natalism'| // increased % of having kids
'Authority'| 
'Hedonism'| 
'Tribalism'| 
'Globalism'| 
'Pacifism'| 
'Neuroticism'| // takes extra sanity damage
'Dogmatism'| 
'Mysticism'| 
'Paranoia'| 
'Evangelism'| 
'Fanaticism'| // doesn't like beings that don't share narrative 
'Anarchism'| // breaks rules easily
'Sadism'| 
'Charity'| // % to donate
'Greed'; // steal easier

// 'talkative'|
// 'friendly'| // likes all beings more
// 'realistic'| // lower happiness
// 'athletic'| // takes less health damage
// 'open-minded'| // beliefs are easily changed

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
export interface IBeliefData {
    noun: string,
    adj: string,
    icon: string,
    description?: string,
    idealPro?: Array<TraitIdeals|TraitCommunity>,
    idealCon?: Array<TraitIdeals|TraitCommunity>
}
export const PrimaryBeliefData: {[key in TraitIdeals|TraitCommunity]: IBeliefData} = {
    prog: {
        noun: 'Progressivism', adj: 'Progressive', icon: '⚖️'
    },
    trad: {
        noun: 'Elitism', adj: 'Elitist', icon: '👑'
    },
    state: {
        noun: 'Collectivism', adj: 'Collectivist', icon: '🕊️'
    },
    ego: {
        noun: 'Independence', adj: 'Independent', icon: '🦅'
    },
}
export const NarrativeBeliefData: {[key in TraitFaith]: IBeliefData} = {
    rocket: {
        noun: 'Futurism', adj: 'Futuristic', icon: '🚀',
        description: "Enjoys stories about the far future"
    },
    dragon: {
        noun: 'Mythology', adj: 'Mythical', icon: '🐲',
        description: "Enjoys stories about the legendary past"
    },
    music: {
        noun: 'Drama', adj: 'Dramatic', icon: '🎵',
        description: "Enjoys stories about emotional bonding"
    },
    noFaith: {
        noun: 'Nihilism', adj: 'Nihilist', icon: '⚫️',
        description: "Derives no pleasure from fairy tales"
    },
}
export const SecondaryBeliefData: {[key in TraitBelief]: IBeliefData} = {
    Diligence: {
        noun: 'Diligence', adj: 'Diligence', icon: '💪',
        description: "🎲 to gain 🙂 while working"
    },
    Greed: {
        noun: 'Greed', adj: 'Greedy', icon: '💰',
        description: "+10% Crime 🎲"
    },
    Neuroticism: {
        noun: 'Neuroticism', adj: 'Neurotic', icon: '😱',
        description: "🎲 to 👎 in any conversation"
    },
    Anarchism: {
        noun: 'Anarchism', adj: 'Anarchist', icon: '🖕',
        description: "+33% Crime 🎲"
    },
    Charity: {
        noun: 'Charity', adj: 'Charitable', icon: '😇',
        description: "🎲 to gift 💰 to the penniless"
    },
    Globalism: {
        noun: 'Globalism', adj: 'Globalist', icon: '🌍'
    },
    Natalism: {
        noun: 'Natalism', adj: 'Natalist', icon: '👶'
    },
    Authority: {
        noun: 'Authority', adj: 'Authoritarian', icon: '👢'
    },
    Hedonism: {
        noun: 'Hedonism', adj: 'Hedonistic', icon: '💋'
    },
    Tribalism: {
        noun: 'Tribalism', adj: 'Tribal', icon: '🏰'
    },
    Dogmatism: {
        noun: 'Dogmatism', adj: 'Dogmatic', icon: '🐶'
    },
    Mysticism: {
        noun: 'Mysticism', adj: 'Mystical', icon: '🔮'
    },
    Pacifism: {
        noun: 'Pacifism', adj: 'Pacifist', icon: '😘'
    },
    Paranoia: {
        noun: 'Paranoia', adj: 'Paranoid', icon: '👽'
    },
    Evangelism: {
        noun: 'Evangelism', adj: 'Evangelist', icon: '📣'
    },
    Fanaticism: {
        noun: 'Fanaticism', adj: 'Fanatical', icon: '👺'
    },
    Sadism: {
        noun: 'Sadism', adj: 'Sadistic', icon: '😈'
    },
};

export interface BeliefSubjectOption {key: BeliefSubject};
export interface BeliefVerbOption {key: BeliefVerb};
export interface BeliefAdjOption {key: TraitBelief};

export const BeliefSubjectAll: BeliefSubject[] = ['self', 'other'];
export const BeliefVerbAll: BeliefVerb[] = ['are', 'arenot'];
export const BeliefsAll = Object.keys(SecondaryBeliefData).map((x) => x as TraitBelief);

export interface Belief{
    subject: BeliefSubject;
    verb: BeliefVerb;
    adj: TraitBelief;
}