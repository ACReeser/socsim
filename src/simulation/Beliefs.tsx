import { TraitCommunity, TraitFaith, TraitIdeals } from "../World";

export type BeliefCommonality = 'common'|'uncommon'|'rare';

export type TraitBelief = 'Diligence'| // happy from work
'Natalism'| // increased % of having kids
'Naturalism'|
'Hedonism'| //more entertainment
'Progressivism'|
'Libertarianism'|
'Parochialism'|
'Cosmopolitanism'|
'Capitalism'|
'Socialism'|
'Communism'|
// 'Tribalism'| 
// 'Globalism'| 
// 'Pacifism'| 
'Neuroticism'| // takes extra sanity damage
'Dogmatism'| 
// 'Mysticism'| 
 'Paranoia'| 
// 'Evangelism'| 
// 'Fanaticism'| // doesn't like beings that don't share narrative 
'Authority'| //less crime, more crime reports
'Anarchism'| // breaks rules easily
//'Sadism'| 
'Antagonism'|
'Enthusiasm'|
'Gossip'|'Extroversion'|
'Charity'| // % to donate
'Gluttony'|
'Wanderlust'|
'Germophobia'|
'Greed'; // steal easier

// 'talkative'|
// 'friendly'| // likes all beings more
// 'realistic'| // lower happiness
// 'athletic'| // takes less health damage
// 'open-minded'| // beliefs are easily changed

export type BeliefSubject = 'self'|'other';
export type BeliefVerb = 'are'|'arenot';
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
        description: "Loves stories of the far future"
    },
    dragon: {
        noun: 'Mythology', adj: 'Mythical', icon: '🐲',
        description: "Loves stories of the legendary past"
    },
    music: {
        noun: 'Drama', adj: 'Dramatic', icon: '🎵',
        description: "Loves stories of emotional bonding"
    },
    noFaith: {
        noun: 'Nihilism', adj: 'Nihilist', icon: '⚫️',
        description: "Hates fairy tales"
    },
}
export const SecondaryBeliefData: {[key in TraitBelief]: IBeliefData} = {
    // misc 🎲 traits
    Diligence: {
        noun: 'Diligence', adj: 'Diligence', icon: '💪',
        description: "🎲 to 👍 while working", //implemented
        //idealCon: ['trad'], idealPro: ['state', 'ego']
    },
    Natalism: {
        noun: 'Natalism', adj: 'Natalist', icon: '👶',
        description: "Extra 🎲 for 👶" //implemented
    },
    Charity: {
        noun: 'Charity', adj: 'Charitable', icon: '😇',
        description: "🎲 to gift 💰 to the penniless; and spread 👍", //implemented
        //idealCon: ['trad'], idealPro: ['prog']
    },
    Progressivism: {
        noun: 'Progressivism', adj: 'Progressive', icon: '⚖️',
        description: "🎲 to 👍 when paying taxes"
    },
    Libertarianism: {
        noun: 'Libertarianism', adj: 'Libertarian', icon: '🔫',
        description: "🎲 to 👎 when paying taxes",
        //idealCon: ['trad'], idealPro: ['prog']
    },
    Wanderlust: {
        noun: 'Wanderlust', adj: 'Wanderer', icon: '🔭',
        description: "🎲 to 👍 when travelling", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Germophobia: {
        noun: 'Germophobia', adj: 'Germophobic', icon: '🤧',
        description: "👎 when sick or working in hospital",
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },

    // work traits
    Parochialism: {
        noun: 'Parochialism', adj: 'Parochial', icon: '🐮',
        description: "Extra 👍 working 🌾; 👎 from dense houses",  //first part implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Cosmopolitanism: {
        noun: 'Cosmopolitanism', adj: 'Cosmopolitan', icon: '🍸',
        description: "Extra 👍 working 🎻; 👎 from rural houses",  //first part implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Capitalism: {
        noun: 'Capitalism', adj: 'Capitalist', icon: '🎩',
        description: "👎 working in co-ops and communes; Extra 👍 when owner", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Socialism: {
        noun: 'Socialism', adj: 'Socialist', icon: '🤝',
        description: "Extra 👍 working in co-ops", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Communism: {
        noun: 'Communism', adj: 'Communist', icon: '⚒️',
        description: "👎 working in companies", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },

    // Fraud: {
    //     noun: 'Fraud', adj: 'Fraudulent', icon: '🤥',
    //     description: "??",
    //     idealCon: ['trad'], idealPro: ['prog', 'state']
    // },

    // 👍 traits
    Naturalism: {
        noun: 'Naturalism', adj: 'Naturalist', icon: '🛶',
        description: "Extra 👍 from 😎; 😎 3x longer" //implemented
    },
    Hedonism: {
        noun: 'Hedonism', adj: 'Hedonistic', icon: '💋',
        description: "🎲 to emote extra 👍;🎲 to 👎 when working;", //implemented
        //idealCon: ['prog'], idealPro: ['ego', 'trad']
    },
    Gluttony: {
        noun: 'Gluttony', adj: 'Glutton', icon: '🎃',
        description: "Extra 👍 when stuffed; Extra 👎 when hungry;", //implemented
        //idealCon: ['prog'], idealPro: ['ego', 'trad']
    },
    Paranoia: {
        noun: 'Paranoia', adj: 'Paranoid', icon: '👽',
        description: "🎲 to 👎 at any time",  //implemented
        //idealCon: ['state'], idealPro: ['ego']
    },

    // 😈 Crime traits
    Authority: {
        noun: 'Authority', adj: 'Authoritarian', icon: '👢',
        description: "Less 🎲 for all 😈 Crime", //implemented
        //idealCon: ['ego'], idealPro: ['state']
    },
    Anarchism: {
        noun: 'Anarchism', adj: 'Anarchist', icon: '🖕',
        description: "Extra 🎲 for all 😈 Crime", //implemented
        //idealCon: ['state', 'prog'], idealPro: ['ego', 'trad']
    },
    Greed: {
        noun: 'Greed', adj: 'Greedy', icon: '🤑',
        description: "Extra 🎲 for theft 😈 Crime; Extra 👍 when rich",
        //idealCon: ['prog'], idealPro: ['trad']
    },
    // Bloodthirst: {
    //     noun: 'Bloodthirst', adj: 'Bloodthirsty', icon: '🩸',
    //     description: "🎲 for assault 😈 Crime in a 🗣️"
    // },
    // Pacifism: {
    //     noun: 'Pacifism', adj: 'Pacifist', icon: '😘',
    //     description: "will never punish others",
    //     idealCon: ['trad'], idealPro: ['prog']
    // },
    // Mysticism: {
    //     noun: 'Mysticism', adj: 'Mystical', icon: '🔮',
    //     description: "🎲 to 👏 in any conversation",
    //     idealCon: ['trad'], idealPro: ['prog']
    // },

    // 🗣️ traits
    Extroversion: {
        noun: 'Extroversion', adj: 'Extrovert', icon: '🤩',
        description: "Extra 🎲 to start a 🗣️", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Gossip: {
        noun: 'Gossip', adj: 'Gossipy', icon: '📞',
        description: "🎲 to spread 👎 in a 🗣️", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Antagonism: {
        noun: 'Antagonism', adj: 'Antagonistic', icon: '🤬',
        description: "🎲 to spread 👎 in a 🗣️" //implemented
    },
    Enthusiasm: {
        noun: 'Enthusiasm', adj: 'Enthusiastic', icon: '🥳',
        description: "🎲 to spread 👍 in a 🗣️" //implemented
    },
    // Globalism: {
    //     noun: 'Globalism', adj: 'Globalist', icon: '🌍',
    //     description: "🎲 to 👍 other hair colors in a 🗣️",
    //     idealCon: ['trad'], idealPro: ['prog', 'state']
    // },
    // Tribalism: {
    //     noun: 'Tribalism', adj: 'Tribal', icon: '🏰',
    //     description: "🎲 to 👎 other hair colors in a 🗣️",
    //     idealCon: ['prog'], idealPro: ['state', 'ego']
    // },

    // Evangelism: {
    //     noun: 'Evangelism', adj: 'Evangelist', icon: '📣',
    //     description: "+50% persuasion of 🎭",
    //     idealCon: ['ego'], idealPro: ['state']
    // },
    // Fanaticism: {
    //     noun: 'Fanaticism', adj: 'Fanatical', icon: '👺',
    //     description: "🎲 to 👎 other 🎭",
    //     idealCon: ['prog'], idealPro: []
    // },

    // Depression: {
    //     noun: 'Depression', adj: 'Depressive', icon: '😓',
    //     description: "🎲 to 👎 when unhappy",
    // },
    // Optimism: {
    //     noun: 'Optimism', adj: 'Optimistic', icon: '😺',
    //     description: "🎲 to 👍 when unhappy",
    // },
    // Xenophobia: {
    //     noun: 'Xenophobia', adj: 'Xenophobic', icon: '🛑',
    //     description: "🎲 to 👎 when living with other hair colors",
    // },

    // super bad traits
    // Sadism: {
    //     noun: 'Sadism', adj: 'Sadistic', icon: '😈',
    //     description: "🎲 to ☠️ other after a 🗣️"
    // },
    // Vandalism: {
    //     noun: 'Vandalism', adj: 'Vandal', icon: '💩',
    //     description: "🎲 to destroy goods"
    // },
    // Delirium: {
    //     noun: 'Delirium', adj: 'Delirious', icon: '😪',
    //     description: "Chooses actions at random"
    // },
    // DelusionalMania: {
    //     noun: 'Delusional Mania', adj: 'Delusional Maniac', icon: '😵',
    //     description: "🎲 to ☠️ nearby subjects"
    // },
    // Catatonia: {
    //     noun: 'Catatonia', adj: 'Catatonic', icon: '😶',
    //     description: "-50% walk speed. Cannot work."
    // },

    // meta-traits
    Neuroticism: {
        noun: 'Neuroticism', adj: 'Neurotic', icon: '😱',
        description: "+100% 🧠 damage", //implemented
        idealCon: ['state'], idealPro: ['ego']
    },
    Dogmatism: {
        noun: 'Dogmatism', adj: 'Dogmatic', icon: '🐶',
        description: "Cannot change beliefs", //implemented
        idealCon: ['ego'], idealPro: ['state']
    },
};

export function IsIdealDivergent(con: TraitCommunity|TraitIdeals, utopiaMotive: TraitIdeals, utopiaCommunity: TraitCommunity): boolean{
    switch(con){
        case 'trad':
        case 'prog':
            return con == utopiaMotive;
        case 'state':
        case 'ego':
            return con == utopiaCommunity;
    }
}

export function IsBeliefDivergent(belief: TraitBelief, utopiaMotive: TraitIdeals, utopiaCommunity: TraitCommunity): boolean{
    const data = SecondaryBeliefData[belief];
    return data.idealCon != null && data.idealCon.reduce((isDivergent: boolean, con) => {
        return isDivergent || IsIdealDivergent(con, utopiaMotive, utopiaCommunity);
    }, false);
}

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

export type HedonSourceToVal = {[source: string]: number};
export interface HedonReport {
    flatAverage: number,
    weightedAverage: number,
    maxSource: string,
    minSource: string,
    all: HedonSourceToVal
}

export function GetHedonReport(hedonHistory: HedonSourceToVal[]): HedonReport {
    if (hedonHistory.length === 0){
        return {
            all: {},
            flatAverage: 0,
            weightedAverage: 0,
            maxSource: '',
            minSource: ''
        }
    }
    const all: {[source: string]: number} = {};
    let weightedAverage: number = 0;
    let allSum: number = 0;
    for (let i = 0; i < hedonHistory.length; i++) {
        const day = hedonHistory[i];
        let daySum = 0;
        const sources = Object.keys(day);
        for (let j = 0; j < sources.length; j++) {
            const source = sources[j];
            daySum += day[source];
            if (!all[source]) all[source] = 0;
            all[source] += day[source];
        }
        weightedAverage += daySum / (i + 1);
        allSum += daySum;
    }

    const allSources = Object.keys(all);
    return {
        flatAverage: allSum / hedonHistory.length,
        weightedAverage: weightedAverage,
        maxSource: allSources.reduce((max, source) => {
            if (all[source] > max.val)
                return {source: source, val: all[source]};
            else return max;
        }, {source: '', val: 0}).source,
        minSource: allSources.reduce((max, source) => {
            if (all[source] < max.val)
                return {source: source, val: all[source]};
            else return max;
        }, {source: '', val: 0}).source,
        all: all
    }
}