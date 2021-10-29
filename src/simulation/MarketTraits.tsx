import { PlayerResources } from "../Game";
import { GetRandom, GetRandomNumber } from "../WorldGen";
import { BeliefCommonality, RandomBeliefBucket, SecondaryBeliefData, TraitBelief } from "./Beliefs";

export interface MarketTraitListing {
    cost: PlayerResources;
    trait: TraitBelief;
}
export const CommonalityBaseCost: {[b in BeliefCommonality]: number} = {
    'common': 3,
    'uncommon': 5,
    'rare': 7,
    'unique': 99,
};
export const CommonalityRandomMaxCost: {[b in BeliefCommonality]: number} = {
    'common': 3,
    'uncommon': 5,
    'rare': 7,
    'unique': 99,
};

export function GetMarketTraits(seed: string): MarketTraitListing[]{
    const newTraits: MarketTraitListing[] = [];
    for (let i = 0; i < 3; i++) {
        const b = GetRandom(seed, RandomBeliefBucket);
        newTraits.push(getMarketTraitListing(seed, b));
    }
    return newTraits;
}

function getMarketTraitListing(seed: string, b: TraitBelief): MarketTraitListing{
    const rare = SecondaryBeliefData[b].rarity;
    return {
        trait: b,
        cost: {
            hedons: CommonalityBaseCost[rare] + GetRandomNumber(seed, 0, CommonalityRandomMaxCost[rare])
        }
    }
}