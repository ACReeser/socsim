import { Trait, Axis, TraitCommunity, TraitIdeals } from "./World";
import { IInstitution, IOrganization } from "./simulation/Institutions";
import { Government } from "./simulation/Government";


export interface Party extends IInstitution{
    slogan: string;
    community: TraitCommunity;
    ideals: TraitIdeals;
    
    availablePolicies: Policy[]; 
    proposedPolicy?: Policy;
    availableCampaigns: Campaign[];
    activeCampaigns: Campaign[];

    platform: {[key in Axis]: IPolicy};

    politicalCapital: number;
    materialCapital: number;

    seasonalIncome: number;
    seasonalActions: number;
    activeHQs: number[];

    differingPolicies(law: Government): IPolicy[];
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
    public activeHQs: number[] = [];
    public platform: {[key in Axis]: IPolicy} = {} as {[key in Axis]: IPolicy};

    public seasonalIncome: number = 0;
    public seasonalActions: number = 0;
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
    differingPolicies(law: Government): IPolicy[]{
        return Object.keys(this.platform).filter((key: string) => {
            const ax = key as Axis;
            return this.platform[ax] != law.policyTree[ax];
        }).map((key) => this.platform[key as Axis]);
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
export interface IPolicy{
    key: string, 
    name: string, 
    community?: TraitCommunity, 
    ideals?: TraitIdeals, 
    axis: Axis,
    hint?: string
}
export const NoPolicy: IPolicy = {key: '-1', name: 'No Policy', axis: 'all'};
export const Policies: IPolicy[] = [
 NoPolicy,
 {key: '0', name: 'Let Them Eat Cake', ideals: 'trad', community: 'ego', axis: 'wel_food', hint: 'No state solution for hunger'},
 {key: '1', name: 'Food Bank', ideals: 'prog', community: 'ego', axis: 'wel_food'},
 {key: '2', name: 'Food Stamps', ideals: 'trad', community: 'state', axis: 'wel_food'},
 {key: '3', name: 'Universal Rations', ideals: 'prog', community: 'state', axis: 'wel_food'},

 {key: '4', name: 'Sleep Outside', community: 'ego', ideals: 'trad', axis: 'wel_house'},
 {key: '5', name: 'Homeless Shelters', community: 'ego', ideals: 'prog', axis: 'wel_house'},
 {key: '6', name: 'Housing Subsidy', community: 'state', ideals: 'trad', axis: 'wel_house'},
 {key: '7', name: 'State Apartments', community: 'state', ideals: 'prog', axis: 'wel_house'},

 {key: '8', name: 'Stay Healthy', community: 'ego', ideals: 'trad', axis: 'wel_health'},
 {key: '9', name: 'Charity Clinics', community: 'ego', ideals: 'prog', axis: 'wel_health'},
 {key: '10', name: 'Medical Aid', community: 'state', ideals: 'trad', axis: 'wel_health'},
 {key: '11', name: 'Universal Healthcare', community: 'state', ideals: 'prog', axis: 'wel_health'},

 {key: '12', name: 'Tariffs', community: 'state', axis: 'econ_ex'},
 {key: '13', name: 'Free Market', community: 'ego', axis: 'econ_ex'},
 
 {key: '14', name: 'Legal Slavery', ideals: 'trad', axis: 'econ_labor'},
 {key: '15', name: 'Right to Work', community: 'ego', ideals: 'trad', axis: 'econ_labor'},
 {key: '16', name: 'Right to Strike', community: 'ego', ideals: 'prog', axis: 'econ_labor'},

 {key: '17', name: 'Laissez-faire', community: 'ego', ideals:'trad', axis: 'econ_sub'},
 {key: '18', name: 'Grain Subsidy', community: 'state', axis: 'econ_sub'},
 {key: '19', name: 'Arts Patronage', community: 'ego', ideals: 'prog', axis: 'econ_sub'},

 {key: '20', name: 'State Religion', community: 'state', ideals: 'trad', axis: 'cul_rel'},
 {key: '21', name: 'Secularism', community: 'ego', axis: 'cul_rel'},
 {key: '22', name: 'State Atheism', community: 'state', ideals: 'prog', axis: 'cul_rel'},

 {key: '23', name: 'Temple of Water 🌊', axis: 'cul_theo'},
 {key: '24', name: 'Church of Sun ☀️', axis: 'cul_theo'},
 {key: '25', name: 'Chapel of Clover ☘️', axis: 'cul_theo'},

 {key: '26', name: 'Religious Schooling', community: 'state', ideals: 'trad', axis: 'cul_ed'},
 {key: '27', name: 'University Grants', community: 'ego', axis: 'cul_ed'},
 {key: '28', name: 'College For All', community: 'state', ideals: 'prog', axis: 'cul_ed'},

 {key: '29', name: 'Landowners Vote', community: 'state', ideals: 'trad', axis: 'law_vote', hint: 'only homeowners vote'},
 {key: '30', name: 'Poll Tax', community: 'ego', ideals: 'trad', axis: 'law_vote', hint: 'voting requires small amount of cash'},
 {key: '31', name: 'Universal Suffrage', ideals: 'prog', axis: 'law_vote', hint: 'all citizens vote'},

 {key: '32', name: 'Scandalous Bribes', community: 'state', ideals: 'trad', axis: 'law_bribe', hint: '5% chance bribery causes scandal'},
 {key: '33', name: 'Legal Bribery', community: 'ego', axis: 'law_bribe', hint: 'Bribery has no consequences'},
 {key: '34', name: 'Anti-Corruption', community: 'state', ideals: 'prog', axis: 'law_bribe', hint: '25% chance bribery results in fine'},

 {key: '35', name: 'Closed Borders', ideals: 'trad', axis: 'law_imm'},
 {key: '36', name: 'Best and Brightest', community: 'state', ideals: 'prog', axis: 'law_imm'},
 {key: '37', name: 'Huddle Masses', community: 'ego', ideals: 'prog', axis: 'law_imm'},

 {key: '38', name: 'Head Tax', community:'state', ideals: 'trad', axis: 'tax_basic'},
 {key: '39', name: 'Sales Tax', community: 'ego', axis: 'tax_basic'},
 {key: '40', name: 'Wealth Tax', community: 'state', ideals: 'prog', axis: 'tax_basic'},

 {key: '38', name: 'Vice Tax', ideals: 'trad', axis: 'tax_second'},
 {key: '39', name: 'Property Tax', ideals: 'prog', axis: 'tax_second'},
 {key: '40', name: 'Death Tax', ideals: 'prog', axis: 'tax_second'},

];
export const PolicyTree: {
    [key in Axis]: IPolicy[]
} = Policies.reduce((dict, pol) => {
    if (!dict[pol.axis])
        dict[pol.axis] =[];
    dict[pol.axis].push(pol);
    return dict;
}, {} as {[key in Axis]: IPolicy[]});

export function PolicyByKey(key: string): IPolicy|undefined{
    return Policies.find((p) => p.key == key);
}