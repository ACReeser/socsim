import { Live } from "../events/Events";
import { TraitCommunity, TraitGood, TraitIdeals } from "../World";
import { Bean } from "./Bean";
import { SecondaryBeliefData, TraitBelief } from "./Beliefs";
import { IPolicy } from "./Politics";

export type LawGroup = 'Taxation'|'Welfare'|'Economics'|'Crime'|'Culture';
export type LawAxis = 'wel_food'|'wel_house'|'wel_health'|'tax_basic'|'tax_second'|'econ_sub'|'cul_rel'|'cul_theo'|'crime_theo';

export type LawType = 'civil'|'criminal';

export type LawKey = 'food_aid'
|'medical_aid'
|'poll_tax'
// |'wealth_tax'
// |'food_bank'
// |'univ_rations'
// |'housing_subsidy'
// |'state_apartments'
// |'clinics'
// |'grain_sub'
// |'arts'
// |'theocracy'
// |'secularism'
// |'atheism'
// |'mythology'
// |'futurism'
// |'drama'
|'sales_tax'
// |'vice_tax'
// |'prop_tax'
|'death_tax';

export type LawPrereq = TraitBelief|TraitBelief[];

export function PlayerCanSeePrereqs(prereqs: LawPrereq[], seen: Map<string, boolean>){
    return prereqs.length === 0 || prereqs.some((x) => PlayerKnowsPrereq(x, seen));
}
export function PlayerMeetsPrereqs(prereqs: LawPrereq[], seen: Map<string, boolean>){
    return prereqs.length === 0 || prereqs.every((x) => PlayerKnowsPrereq(x, seen));
}
export function PlayerKnowsPrereq(prereq: LawPrereq, seen: Map<string, boolean>){
    return Array.isArray(prereq) ? prereq.some((x) => PlayerKnowsBelief(x, seen)) : PlayerKnowsBelief(prereq, seen);
}
export function PlayerKnowsBelief(prereq: TraitBelief, seen: Map<string, boolean>){
    return seen.has(prereq);
}
export function PrereqKey(prereq: LawPrereq){
    return Array.isArray(prereq) ? prereq.join('/') : prereq;
}
export function PrereqString(prereq: LawPrereq){
    return Array.isArray(prereq) ? prereq.map(x => BeliefString(x)).join(' / ') : BeliefString(prereq);
}
export function BeliefString(prereq: TraitBelief){
    return SecondaryBeliefData[prereq].icon+' '+SecondaryBeliefData[prereq].noun;
}

export type LawPunishment = 'fine'|'imprison'|'death';

export interface ILaw{
    /**
     * convenience grouping property
     */
    group: LawGroup;
    /**
     * "slot" for law
     */
    axis: LawAxis;
    /**
     * specific law selected
     */
    key: LawKey;
}
export interface IGovernment{
    laws: ILaw[];
    lawTree: {[key in LawAxis]: ILaw};
}
export interface ILawData extends ILaw{
    prereqs: LawPrereq[];
    name: string;
    hint?: string;
    description?: string;
    icon?: string;
}
export const LawAxisData: {[key in LawAxis]: {name: string}} = {
    'wel_food': {name: 'Food Welfare'},
    'wel_house': {name: 'Housing Welfare'},
    'wel_health': {name: 'Healthcare'},
    'tax_basic': {name: 'Taxation'},
    'tax_second': {name: 'Advanced Taxation'},
    'econ_sub': {name: 'Subsidies'},
    'cul_rel': {name: 'Culture'},
    'cul_theo': {name: 'State Narrative'},
    crime_theo: {name: 'Persecution'}
}
export const LawData: {[key in LawKey]: ILawData} = {
    'food_aid':{
        key: 'food_aid', group: 'Welfare', name: 'Food Aid', axis: 'wel_food', icon: '👨‍🌾',
        description: 'The government buys Hungry Subjects food.', prereqs: [['Gluttony','Parochialism'], ['Charity', 'Socialism']]},
    'medical_aid':{
        key: 'medical_aid', group: 'Welfare', name: 'Med Aid', axis: 'wel_health', icon: '👩‍⚕️',
        description: 'The government buys Sick Subjects medicine.', prereqs: ['Charity', 'Cosmopolitanism']},
    // 'food_bank':{
    //     key: 'food_bank', group: 'Welfare', name: 'Food Bank', axis: 'wel_food',
    //     description: 'Hungry Subjects are provided food purchased by the government.'
    // },
    // 'food_stamps':{
    //     key: 'food_stamps', group: 'Welfare', name: 'Food Stamps', axis: 'wel_food',
    //     description: 'Hungry Subjects are provided money by the government to purchase food.'},
    // 'univ_rations':{
    //     key: 'univ_rations', group: 'Welfare', name: 'Universal Rations', axis: 'wel_food',
    //     description: 'All Subjects are provided small amounts of food from the government.'},
    // 'outside':{
    //     key: 'outside', group: 'Welfare', name: 'Sleep Outside', axis: 'wel_house',
    //     description: 'Homeless Subjects must sleep in the cold.'},
    // 'homeless_shelters':{
    //     key: 'homeless_shelters', group: 'Welfare', name: 'Homeless Shelters', axis: 'wel_house',
    //     description: 'Homeless Subjects are provided shelter purchased by the government.'},
    // 'housing_subsidy':{
    //     key: 'housing_subsidy', group: 'Welfare', name: 'Housing Subsidy', axis: 'wel_house',
    //     description: 'Homeless Subjects are provided money by the government to purchase shelter.'},
    // 'state_apartments':{
    //     key: 'state_apartments', group: 'Welfare', name: 'State Apartments', axis: 'wel_house'},
    // 'stay_healthy':{
    //     key: 'stay_healthy', group: 'Welfare', name: 'Stay Healthy', axis: 'wel_health',
    //     description: 'Sick Subjects must pay for their own medical care.'},
    // 'clinics':{
    //     key: 'clinics', group: 'Welfare', name: 'Charity Clinics', axis: 'wel_health',
    //     description: 'Sick Subjects are provided medicine purchased by the government.'},
    // 'medical_aid':{
    //     key: 'medical_aid', group: 'Welfare', name: 'Medical Aid', axis: 'wel_health',
    //     description: 'Sick Subjects are provided money by the government to pay for medical care.'},
    // 'univ_health':{
    //     key: 'univ_health', group: 'Welfare', name: 'Universal Healthcare', axis: 'wel_health',
    //     description: 'All Subjects are provided medical care by the government.'},
    // 'hands_off':{
    //     key: 'hands_off', group: 'Economics', name: 'Laissez-faire', axis: 'econ_sub',
    //     description: 'No industries receive subsidies.'},
    // 'grain_sub':{
    //     key: 'grain_sub', group: 'Economics', name: 'Grain Subsidy', axis: 'econ_sub',
    //     description: 'Farmers are provided money.'},
    // 'arts':{
    //     key: 'arts', group: 'Economics', name: 'Arts Patronage', axis: 'econ_sub'},
    // 'theocracy':{
    //     key: 'theocracy', group: 'Crime', name: 'Illegal Narratives', axis: 'crime_theo',
    //     description: "It is illegal for subjects to speak about other universal narratives."},
    // 'secularism':{
    //     key: 'secularism', group: 'Culture', name: 'Secularism', axis: 'cul_theo',
    //     description: "The government does not endorse a particular universal narrative."},
    // 'atheism':{
    //     key: 'atheism', group: 'Culture', name: 'State Nihilism', axis: 'cul_theo'},
    // 'mythology':{
    //     key: 'mythology', group: 'Culture', name: 'State Mythology 🐲', axis: 'cul_theo'},
    // 'futurism':{
    //     key: 'futurism', group: 'Culture', name: 'State Futurism 🚀', axis: 'cul_theo'},
    // 'drama':{
    //     key: 'drama', group: 'Culture', name: 'State Drama 🎵', axis: 'cul_theo'},
    // '':{key: // , group: '', name: 'Religious Schooling', 'state', idealPro: [ 'trad', axis: 'cul_ed'},
    // '':{key: // , group: '', name: 'University Grants', 'ego', axis: 'cul_ed'},
    // '':{key: // , group: '', name: 'College For All', 'state', idealPro: [ 'prog', axis: 'cul_ed'},
    'poll_tax':{
        key: 'poll_tax', group: 'Taxation', name: 'Head Tax', axis: 'tax_basic', prereqs: [], icon: '👑',
        description: 'Subjects must pay a flat tax.'},
    'sales_tax':{
        key: 'sales_tax', group: 'Taxation', name: 'Sales Tax', axis: 'tax_basic', prereqs: [], icon: '💸',
        description: 'Subjects must pay a percentage tax for every transaction.'},
    // 'wealth_tax':{
    //     key: 'wealth_tax', group: 'Taxation', name: 'Wealth Tax', axis: 'tax_basic',
    //     description: 'Rich subjects must pay a percentage tax on their excess cash.'},
    // 'vice_tax':{
    //     key: 'vice_tax', group: 'Taxation', name: 'Vice Tax', axis: 'tax_second',
    //     description: 'Entertainment goods have a flat tax.'},
    // 'prop_tax':{
    //     key: 'prop_tax', group: 'Taxation', name: 'Property Tax', axis: 'tax_second',
    //     description: 'Subjects must pay a tax on housing.'},
    'death_tax':{
        key: 'death_tax', group: 'Taxation', name: 'Death Tax', axis: 'tax_second', prereqs: [], icon: '☠️',
        description: 'Dead subjects pay a portion of their cash to the government.'},
}

export type LawGroupToLaws = {
    [key in LawGroup]: ILaw[]
};
const SalesTaxPercentage = 0.05;
export class Government{
    public get laws(): ILaw[] {
        return Object.values(this.lawTree).flatMap(law => law ? [law] : []);
    }
    public set laws(val: ILaw[]) {
        val.forEach((v) => {
            this.lawTree[v.axis] = v;
        });
    }
    public getLawsByGroup(): LawGroupToLaws {
        return this.laws.reduce((d, x) => {
            d[x.group].push(x);
            return d;
        }, {
            Taxation: [] as ILaw[],
            Welfare: [] as ILaw[],
            Economics: [] as ILaw[],
            Crime: [] as ILaw[],
            Culture: [] as ILaw[]
        });
    }
    public lawTree: {[key in LawAxis]: ILaw|undefined} = {} as {[key in LawAxis]: ILaw|undefined};
    public treasury: Live<number> = new Live<number>(0);

    isLaw(l: LawKey): boolean{
        return this.lawTree[LawData[l].axis]?.key === l;
    }

    enact(l: LawKey): void {
        const data = LawData[l];
        this.lawTree[data.axis] = data;
    }

    revoke(l: LawKey): void {
        const data = LawData[l];
        this.lawTree[data.axis] = undefined;
    }

    get salesTaxPercentage(): number{
        return this.isLaw('sales_tax') ? SalesTaxPercentage : 0;
    }
    
    PurchaseQualifiesForWelfare(bean: Bean, good: TraitGood): boolean{
        switch(good){
            case 'food':
                return (bean.food === 'starving' || bean.food === 'hungry') && this.isLaw('food_aid');
            case 'medicine':
                return (bean.health === 'sick' || bean.health === 'sickly') && this.isLaw('medical_aid');
        }
        return false;
    }
    CanPayWelfare(price: number): boolean{
        return this.treasury.get >= price;
    }
}