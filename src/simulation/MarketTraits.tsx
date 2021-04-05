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
    'rare': 7
};
export const CommonalityRandomMaxCost: {[b in BeliefCommonality]: number} = {
    'common': 3,
    'uncommon': 5,
    'rare': 7
};

export function GetMarketTraits(): MarketTraitListing[]{
    const newTraits: MarketTraitListing[] = [];
    for (let i = 0; i < 3; i++) {
        const b = GetRandom(RandomBeliefBucket);
        newTraits.push(getMarketTraitListing(b));
    }
    return newTraits;
}

function getMarketTraitListing(b: TraitBelief): MarketTraitListing{
    const rare = SecondaryBeliefData[b].rarity;
    return {
        trait: b,
        cost: {
            hedons: CommonalityBaseCost[rare] + GetRandomNumber(0, CommonalityRandomMaxCost[rare])
        }
    }
}