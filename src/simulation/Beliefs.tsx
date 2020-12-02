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
'Antagonism'|
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
        noun: 'Progressivism', adj: 'Progressive', icon: '⚖️',
        description: "Strives to help others"
    },
    trad: {
        noun: 'Elitism', adj: 'Elitist', icon: '👑',
        description: "Strives for individual power"
    },
    state: {
        noun: 'Collectivism', adj: 'Collectivist', icon: '🕊️',
        description: "Trusts in the social group"
    },
    ego: {
        noun: 'Independence', adj: 'Independent', icon: '🦅',
        description: "Trusts only in oneself"
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
        description: "🎲 to gain 🙂 while working",
        idealCon: ['trad'], idealPro: ['state', 'ego']
    },
    Greed: {
        noun: 'Greed', adj: 'Greedy', icon: '💰',
        description: "+10% Crime 🎲",
        idealCon: ['prog'], idealPro: ['trad']
    },
    Neuroticism: {
        noun: 'Neuroticism', adj: 'Neurotic', icon: '😱',
        description: "+100% 🧠 damage",
        idealCon: ['state'], idealPro: ['ego']
    },
    Anarchism: {
        noun: 'Anarchism', adj: 'Anarchist', icon: '🖕',
        description: "+33% Crime 🎲",
        idealCon: ['state', 'prog'], idealPro: ['ego', 'trad']
    },
    Charity: {
        noun: 'Charity', adj: 'Charitable', icon: '😇',
        description: "🎲 to gift 💰 to the penniless",
        idealCon: ['trad'], idealPro: ['prog']
    },
    Globalism: {
        noun: 'Globalism', adj: 'Globalist', icon: '🌍',
        description: "🎲 to 👏 other hair colors",
        idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Natalism: {
        noun: 'Natalism', adj: 'Natalist', icon: '👶',
        description: "+15% 🎲 for 👶"
    },
    Authority: {
        noun: 'Authority', adj: 'Authoritarian', icon: '👢',
        description: "-10% Crime 🎲",
        idealCon: ['ego'], idealPro: ['state']
    },
    Hedonism: {
        noun: 'Hedonism', adj: 'Hedonistic', icon: '💋',
        description: "🎲 to skip work and gain 🙂",
        idealCon: ['prog'], idealPro: ['ego', 'trad']
    },
    Tribalism: {
        noun: 'Tribalism', adj: 'Tribal', icon: '🏰',
        description: "🎲 to 👎 other hair colors",
        idealCon: ['prog'], idealPro: ['state', 'ego']
    },
    Dogmatism: {
        noun: 'Dogmatism', adj: 'Dogmatic', icon: '🐶',
        description: "cannot be persuaded",
        idealCon: ['ego'], idealPro: ['state']
    },
    Mysticism: {
        noun: 'Mysticism', adj: 'Mystical', icon: '🔮',
        description: "🎲 to 👏 in any conversation",
        idealCon: ['trad'], idealPro: ['prog']
    },
    Pacifism: {
        noun: 'Pacifism', adj: 'Pacifist', icon: '😘',
        description: "will never punish others",
        idealCon: ['trad'], idealPro: ['prog']
    },
    Paranoia: {
        noun: 'Paranoia', adj: 'Paranoid', icon: '👽',
        description: "🎲 to 👎 in any conversation",
        idealCon: ['state'], idealPro: ['ego']
    },
    Evangelism: {
        noun: 'Evangelism', adj: 'Evangelist', icon: '📣',
        description: "+50% persuasion of 🎭",
        idealCon: ['ego'], idealPro: ['state']
    },
    Fanaticism: {
        noun: 'Fanaticism', adj: 'Fanatical', icon: '👺',
        description: "🎲 to 👎 other 🎭",
        idealCon: ['prog'], idealPro: []
    },
    Sadism: {
        noun: 'Sadism', adj: 'Sadistic', icon: '😈',
        description: "🎲 to ☠️ other when receiving 👎"
    },
    Antagonism: {
        noun: 'Antagonism', adj: 'Antagonistic', icon: '🤬',
        description: "+15% Crime 🎲, +25% walk speed"
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