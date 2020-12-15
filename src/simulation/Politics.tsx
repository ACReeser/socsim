import { Trait, TraitCommunity, TraitIdeals } from "../World";
import { IInstitution, IOrganization } from "./Institutions";
import { Government, LawAxis } from "./Government";


export interface Party extends IInstitution{
    slogan: string;
    community: TraitCommunity;
    ideals: TraitIdeals;
    
    availablePolicies: Policy[]; 
    proposedPolicy?: Policy;
    availableCampaigns: Campaign[];
    activeCampaigns: Campaign[];

    platform: {[key in LawAxis]: IPolicy};

    politicalCapital: number;
    materialCapital: number;
    labor: number;
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
    public labor: number = 10;
    public activeHQs: number[] = [];
    public platform: {[key in LawAxis]: IPolicy} = {} as {[key in LawAxis]: IPolicy};

    constructor(){
    }
    fundOrganizations(): void{
        this.organizations.forEach((org) => {
            if (this.materialCapital >= org.seasonalBudget){
                this.materialCapital -= org.seasonalBudget;
                org.cash += org.seasonalBudget;
            }
        });
    }
    // differingPolicies(law: Government): IPolicy[]{
    //     return Object.keys(this.platform).filter((key: string) => {
    //         const ax = key as LawAxis;
    //         return this.platform[ax] != law.laws[ax];
    //     }).map((key) => this.platform[key as LawAxis]);
    // }
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
    axis?: LawAxis;
}
export interface Campaign {
    key: string; 
    fx: PoliticalEffect[];
    cityKey?: number;

    seasonalCost: number;
}
export interface IPolicy{
    key: string, 
    name: string, 
    community?: TraitCommunity, 
    ideals?: TraitIdeals, 
    axis: LawAxis,
    hint?: string
}