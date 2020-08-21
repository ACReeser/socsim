import { Trait, Axis } from "./World";


export interface Party {
    name: string;
    availablePolicies: Policy[]; 
    proposedPolicy?: Policy;
    availableCampaigns: Campaign[];
    activeCampaigns: Campaign[];

    politicalCapital: number;
    materialCapital: number;
}

export class BaseParty implements Party{
    public name: string = "Worker's Wheat Party";
    public availablePolicies: Policy[] = [];
    public proposedPolicy?: Policy;
    public availableCampaigns: Campaign[] = [];
    public activeCampaigns: Campaign[] = [];
    public politicalCapital: number = 10;
    public materialCapital: number = 10;


}

export interface PoliticalEffect {
    key: Trait;
    /**
     * magnitude (-3 to +3)
     */
    mag: number;
}
export interface Policy {
    key: string; 
    fx: PoliticalEffect[];
    axis?: Axis;
}
export interface Campaign {
    key: string; 
    fx: PoliticalEffect[];
    cityKey?: number;

    seasonalCost: number;
}