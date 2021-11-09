import { TraitCommunity, TraitIdeals } from "../World";


export interface Party{
    slogan: string;
    community: TraitCommunity;
    ideals: TraitIdeals;

    leadership: number;
}
