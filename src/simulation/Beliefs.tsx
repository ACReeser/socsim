import { TraitCommunity, TraitFaith, TraitIdeals } from "../World";

export type BeliefCommonality = 'common'|'uncommon'|'rare';
export const CommonalityChances: {[b in BeliefCommonality]: number} = {
    'common': 3,
    'uncommon': 2,
    'rare': 1
};

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
    rarity: BeliefCommonality,
    idealPro?: Array<TraitIdeals|TraitCommunity>,
    idealCon?: Array<TraitIdeals|TraitCommunity>
}
export const PrimaryBeliefData: {[key in TraitIdeals|TraitCommunity]: IBeliefData} = {
    prog: {
        noun: 'Progressivism', adj: 'Progressive', icon: '⚖️',
        description: "Strives to help others", rarity: 'common',
    },
    trad: {
        noun: 'Elitism', adj: 'Elitist', icon: '👑',
        description: "Strives for individual power", rarity: 'common',
    },
    state: {
        noun: 'Collectivism', adj: 'Collectivist', icon: '🕊️',
        description: "Trusts in the social group", rarity: 'common',
    },
    ego: {
        noun: 'Independence', adj: 'Independent', icon: '🦅',
        description: "Trusts only in oneself", rarity: 'common',
    },
}
export const NarrativeBeliefData: {[key in TraitFaith]: IBeliefData} = {
    rocket: {
        noun: 'Futurism', adj: 'Futuristic', icon: '🚀',
        description: "Loves stories of the far future", rarity: 'common',
    },
    dragon: {
        noun: 'Mythology', adj: 'Mythical', icon: '🐲',
        description: "Loves stories of the legendary past", rarity: 'common',
    },
    music: {
        noun: 'Drama', adj: 'Dramatic', icon: '🎵',
        description: "Loves stories of emotional bonding", rarity: 'common',
    },
    noFaith: {
        noun: 'Nihilism', adj: 'Nihilist', icon: '⚫️',
        description: "Hates fairy tales", rarity: 'common',
    },
}
export const SecondaryBeliefData: {[key in TraitBelief]: IBeliefData} = {
    // misc 🎲 traits
    Diligence: {
        noun: 'Diligence', adj: 'Diligence', icon: '💪', rarity: 'common',
        description: "🎲 to 👍 while working", //implemented
        //idealCon: ['trad'], idealPro: ['state', 'ego']
    },
    Natalism: {
        noun: 'Natalism', adj: 'Natalist', icon: '👶', rarity: 'common',
        description: "Extra 🎲 for 👶" //implemented
    },
    Charity: {
        noun: 'Charity', adj: 'Charitable', icon: '😇', rarity: 'uncommon',
        description: "🎲 to gift 💰 to the penniless; and spread 👍", //implemented
        //idealCon: ['trad'], idealPro: ['prog']
    },
    Progressivism: {
        noun: 'Progressivism', adj: 'Progressive', icon: '⚖️', rarity: 'uncommon',
        description: "🎲 to 👍 when paying taxes"
    },
    Libertarianism: {
        noun: 'Libertarianism', adj: 'Libertarian', icon: '🔫', rarity: 'rare',
        description: "🎲 to 💢 when paying taxes",
        //idealCon: ['trad'], idealPro: ['prog']
    },
    Wanderlust: {
        noun: 'Wanderlust', adj: 'Wanderer', icon: '🔭', rarity: 'uncommon',
        description: "🎲 to 👍 when travelling", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Germophobia: {
        noun: 'Germophobia', adj: 'Germophobic', icon: '🤧', rarity: 'rare',
        description: "💢 when sick or working in hospital",
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },

    // work traits
    Parochialism: {
        noun: 'Parochialism', adj: 'Parochial', icon: '🐮', rarity: 'common',
        description: "Extra 👍 working 🌾; 💢 from dense houses",  //first part implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Cosmopolitanism: {
        noun: 'Cosmopolitanism', adj: 'Cosmopolitan', icon: '🍸', rarity: 'common',
        description: "Extra 👍 working 🎻; 💢 from rural houses",  //first part implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Capitalism: {
        noun: 'Capitalism', adj: 'Capitalist', icon: '🎩', rarity: 'common',
        description: "💢 working in co-ops and communes; Extra 👍 when owner", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Socialism: {
        noun: 'Socialism', adj: 'Socialist', icon: '🤝', rarity: 'common',
        description: "Extra 👍 working in co-ops", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },
    Communism: {
        noun: 'Communism', adj: 'Communist', icon: '⚒️', rarity: 'common',
        description: "💢 working in companies", //implemented
        //idealCon: ['trad'], idealPro: ['prog', 'state']
    },

    // Fraud: {
    //     noun: 'Fraud', adj: 'Fraudulent', icon: '🤥',
    //     description: "??",
    //     idealCon: ['trad'], idealPro: ['prog', 'state']
    // },

    // 👍 traits
    Naturalism: {
        noun: 'Naturalism', adj: 'Naturalist', icon: '🛶', rarity: 'uncommon',
        description: "Extra 👍 from 😎; 😎 3x longer" //implemented
    },
    Hedonism: {
        noun: 'Hedonism', adj: 'Hedonistic', icon: '💋', rarity: 'uncommon',
        description: "🎲 to emote extra 👍;🎲 to 💢 when working;", //implemented
        //idealCon: ['prog'], idealPro: ['ego', 'trad']
    },
    Gluttony: {
        noun: 'Gluttony', adj: 'Glutton', icon: '🎃', rarity: 'common',
        description: "Extra 👍 when stuffed; Extra 💢 when hungry;", //implemented
        //idealCon: ['prog'], idealPro: ['ego', 'trad']
    },
    Paranoia: {
        noun: 'Paranoia', adj: 'Paranoid', icon: '👽', rarity: 'uncommon',
        description: "🎲 to 💢 at any time",  //implemented
        //idealCon: ['state'], idealPro: ['ego']
    },

    // 😈 Crime traits
    Authority: {
        noun: 'Authority', adj: 'Authoritarian', icon: '👢', rarity: 'common',
        description: "Less 🎲 for all 😈 Crime", //implemented
        //idealCon: ['ego'], idealPro: ['state']
    },
    Anarchism: {
        noun: 'Anarchism', adj: 'Anarchist', icon: '🖕', rarity: 'uncommon',
        description: "Extra 🎲 for all 😈 Crime", //implemented
        //idealCon: ['state', 'prog'], idealPro: ['ego', 'trad']
    },
    Greed: {
        noun: 'Greed', adj: 'Greedy', icon: '🤑', rarity: 'common',
        description: "Extra 🎲 for theft 😈 Crime; Extra 👍 when rich",
        //idealCon: ['prog'], idealPro: ['trad']
    },
    // Bloodthirst: {
    //     noun: 'Bloodthirst', adj: 'Bloodthirsty', icon: '🩸', rarity: 'common',
    //     description: "🎲 for assault 😈 Crime in a 🗣️"
    // },
    // Pacifism: {
    //     noun: 'Pacifism', adj: 'Pacifist', icon: '😘', rarity: 'common',
    //     description: "will never punish others",
    //     idealCon: ['trad'], idealPro: ['prog']
    // },
    // Mysticism: {
    //     noun: 'Mysticism', adj: 'Mystical', icon: '🔮', rarity: 'common',
    //     description: "🎲 to 👏 in any conversation",
    //     idealCon: ['trad'], idealPro: ['prog']
    // },

    // 🗣️ traits
    Extroversion: {
        noun: 'Extroversion', adj: 'Extrovert', icon: '🤩', rarity: 'common',
        description: "Extra 🎲 to start a 🗣️", //implemented
    },
    Gossip: {
        noun: 'Gossip', adj: 'Gossipy', icon: '📞', rarity: 'common',
        description: "🎲 to spread 💢 in a 🗣️", //implemented
    },
    Antagonism: {
        noun: 'Antagonism', adj: 'Antagonistic', icon: '🤬', rarity: 'common',
        description: "🎲 to spread 💢 in a 🗣️" //implemented
    },
    Enthusiasm: {
        noun: 'Enthusiasm', adj: 'Enthusiastic', icon: '🥳', rarity: 'common',
        description: "🎲 to spread 👍 in a 🗣️" //implemented
    },
    // Globalism: {
    //     noun: 'Globalism', adj: 'Globalist', icon: '🌍', rarity: 'common',
    //     description: "🎲 to 👍 other hair colors in a 🗣️",
    //     idealCon: ['trad'], idealPro: ['prog', 'state']
    // },
    // Tribalism: {
    //     noun: 'Tribalism', adj: 'Tribal', icon: '🏰', rarity: 'common',
    //     description: "🎲 to 💢 other hair colors in a 🗣️",
    //     idealCon: ['prog'], idealPro: ['state', 'ego']
    // },

    // Evangelism: {
    //     noun: 'Evangelism', adj: 'Evangelist', icon: '📣', rarity: 'common',
    //     description: "+50% persuasion of 🎭",
    //     idealCon: ['ego'], idealPro: ['state']
    // },
    // Fanaticism: {
    //     noun: 'Fanaticism', adj: 'Fanatical', icon: '👺', rarity: 'common',
    //     description: "🎲 to 💢 other 🎭",
    //     idealCon: ['prog'], idealPro: []
    // },

    // Depression: {
    //     noun: 'Depression', adj: 'Depressive', icon: '😓', rarity: 'common',
    //     description: "🎲 to 💢 when unhappy",
    // },
    // Optimism: {
    //     noun: 'Optimism', adj: 'Optimistic', icon: '😺', rarity: 'common',
    //     description: "🎲 to 👍 when unhappy",
    // },
    // Xenophobia: {
    //     noun: 'Xenophobia', adj: 'Xenophobic', icon: '🛑', rarity: 'common',
    //     description: "🎲 to 💢 when living with other hair colors",
    // },

    // super bad traits
    // Sadism: {
    //     noun: 'Sadism', adj: 'Sadistic', icon: '😈', rarity: 'common',
    //     description: "🎲 to ☠️ other after a 🗣️"
    // },
    // Vandalism: {
    //     noun: 'Vandalism', adj: 'Vandal', icon: '💩', rarity: 'common',
    //     description: "🎲 to destroy goods"
    // },
    // Delirium: {
    //     noun: 'Delirium', adj: 'Delirious', icon: '😪', rarity: 'common',
    //     description: "Chooses actions at random"
    // },
    // DelusionalMania: {
    //     noun: 'Delusional Mania', adj: 'Delusional Maniac', icon: '😵', rarity: 'common',
    //     description: "🎲 to ☠️ nearby subjects"
    // },
    // Catatonia: {
    //     noun: 'Catatonia', adj: 'Catatonic', icon: '😶', rarity: 'common',
    //     description: "-50% walk speed. Cannot work."
    // },

    // meta-traits
    Neuroticism: {
        noun: 'Neuroticism', adj: 'Neurotic', icon: '😱', rarity: 'rare',
        description: "+100% 🧠 damage", //implemented
    },
    Dogmatism: {
        noun: 'Dogmatism', adj: 'Dogmatic', icon: '🐶', rarity: 'uncommon',
        description: "Cannot change beliefs", //implemented
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

export const BeliefsAll = Object.keys(SecondaryBeliefData).map((x) => x as TraitBelief);

/**
 * static list of beliefs with rarity
 * 
 * common traits are duplicated many times within the array
 * rarer traits have fewer duplications or a singular instance 
 */
export const RandomBeliefBucket = Object.keys(SecondaryBeliefData).reduce((list, str) => {
    const t = str as TraitBelief;
    const slots = CommonalityChances[SecondaryBeliefData[t].rarity];
    for (let i = 0; i < slots; i++) {
        list.push(t);
    }
    return list;
}, [] as TraitBelief[]);

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