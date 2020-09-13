import { Trait, Axis, TraitCommunity, TraitIdeals } from "./World";
import { IInstitution, IOrganization } from "./simulation/Institutions";


export interface Party extends IInstitution{
    slogan: string;
    community: TraitCommunity;
    ideals: TraitIdeals;
    
    availablePolicies: Policy[]; 
    proposedPolicy?: Policy;
    availableCampaigns: Campaign[];
    activeCampaigns: Campaign[];

    politicalCapital: number;
    materialCapital: number;

    seasonalIncome: number;
}

export class BaseParty implements Party{
    key = 1;
    playerKey = 1;
    organizations: IOrganization[] = [];
    public name: string = "Citizen's Party";
    public slogan: string = "Vote for us!";
    public community: TraitCommunity = 'state';
    public ideals: TraitIdeals = 'trad';
    public availablePolicies: Policy[] = [];
    public proposedPolicy?: Policy;
    public availableCampaigns: Campaign[] = [];
    public activeCampaigns: Campaign[] = [];
    public politicalCapital: number = 10;
    public materialCapital: number = 20;


    public seasonalIncome: number = 0;
    fundOrganizations(): void{
        this.organizations.forEach((org) => {
            if (this.materialCapital >= org.seasonalBudget){
                this.materialCapital -= org.seasonalBudget;
                org.cash += org.seasonalBudget;
            }
        });
    }
}

export interface ICityPartyHQ{
    cityKey: number;
}
export class CityPartyHQ implements ICityPartyHQ{
    cityKey: number = 0;
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