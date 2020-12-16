import { TraitCommunity, TraitIdeals } from "../World";
import { IPolicy } from "./Politics";

export type LawGroup = 'Taxation'|'Welfare'|'Economics'|'Crime'|'Culture';
export type LawAxis = 'wel_food'|'wel_house'|'wel_health'|'tax_basic'|'tax_second'|'econ_sub'|'cul_rel'|'cul_theo'|'crime_theo';

export type LawKey = 'eat_cake'
|'food_bank'
|'food_stamps'
|'univ_rations'
|'outside'
|'homeless_shelters'
|'housing_subsidy'
|'state_apartments'
|'stay_healthy'
|'clinics'
|'medical_aid'
|'univ_health'
|'hands_off'
|'grain_sub'
|'arts'
|'theocracy'
|'secularism'
|'atheism'
|'mythology'
|'futurism'
|'drama'
|'poll_tax'
|'sales_tax'
|'wealth_tax'
|'vice_tax'
|'prop_tax'
|'death_tax';

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
    idealPro?: Array<TraitIdeals|TraitCommunity>,
    idealCon?: Array<TraitIdeals|TraitCommunity>,
    name: string;
    hint?: string;
    description?: string;
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
    'eat_cake':{
        key: 'eat_cake', group: 'Welfare', name: 'Let Them Eat Cake', idealPro: [ 'trad', 'ego' ], axis: 'wel_food',
        description: 'Hungry Subjects must go without any relief.', hint: 'No state solution for hunger'},
    'food_bank':{
        key: 'food_bank', group: 'Welfare', name: 'Food Bank', idealPro: [ 'prog', 'ego'], axis: 'wel_food',
        description: 'Hungry Subjects are provided food purchased by the government.'
    },
    'food_stamps':{
        key: 'food_stamps', group: 'Welfare', name: 'Food Stamps', idealPro: [ 'trad', 'state'], axis: 'wel_food',
        description: 'Hungry Subjects are provided money by the government to purchase food.'},
    'univ_rations':{
        key: 'univ_rations', group: 'Welfare', name: 'Universal Rations', idealPro: [ 'prog', 'state'], axis: 'wel_food',
        description: 'All Subjects are provided small amounts of food from the government.'},
    'outside':{
        key: 'outside', group: 'Welfare', name: 'Sleep Outside', idealPro: [ 'trad','ego'], axis: 'wel_house',
        description: 'Homeless Subjects must sleep in the cold.'},
    'homeless_shelters':{
        key: 'homeless_shelters', group: 'Welfare', name: 'Homeless Shelters', idealPro: [ 'prog','ego'], axis: 'wel_house',
        description: 'Homeless Subjects are provided shelter purchased by the government.'},
    'housing_subsidy':{
        key: 'housing_subsidy', group: 'Welfare', name: 'Housing Subsidy', idealPro: [ 'trad','state'], axis: 'wel_house',
        description: 'Homeless Subjects are provided money by the government to purchase shelter.'},
    'state_apartments':{
        key: 'state_apartments', group: 'Welfare', name: 'State Apartments', idealPro: [ 'prog','state'], axis: 'wel_house'},
    'stay_healthy':{
        key: 'stay_healthy', group: 'Welfare', name: 'Stay Healthy', idealPro: [ 'trad','ego'], axis: 'wel_health',
        description: 'Sick Subjects must pay for their own medical care.'},
    'clinics':{
        key: 'clinics', group: 'Welfare', name: 'Charity Clinics', idealPro: [ 'prog','ego'], axis: 'wel_health',
        description: 'Sick Subjects are provided medicine purchased by the government.'},
    'medical_aid':{
        key: 'medical_aid', group: 'Welfare', name: 'Medical Aid', idealPro: [ 'trad','state'], axis: 'wel_health',
        description: 'Sick Subjects are provided money by the government to pay for medical care.'},
    'univ_health':{
        key: 'univ_health', group: 'Welfare', name: 'Universal Healthcare', idealPro: [ 'prog','state'], axis: 'wel_health',
        description: 'All Subjects are provided medical care by the government.'},
    'hands_off':{
        key: 'hands_off', group: 'Economics', name: 'Laissez-faire', idealPro: ['ego', 'trad'], axis: 'econ_sub',
        description: 'No industries receive subsidies.'},
    'grain_sub':{
        key: 'grain_sub', group: 'Economics', name: 'Grain Subsidy', idealPro: ['state'], axis: 'econ_sub',
        description: 'Farmers are provided money.'},
    'arts':{
        key: 'arts', group: 'Economics', name: 'Arts Patronage', idealPro: [ 'prog', 'ego' ], axis: 'econ_sub'},
    'theocracy':{
        key: 'theocracy', group: 'Crime', name: 'Illegal Narratives', idealPro: [ 'trad', 'state' ], axis: 'crime_theo',
        description: "It is illegal for subjects to speak about other universal narratives."},
    'secularism':{
        key: 'secularism', group: 'Culture', name: 'Secularism', idealPro: ['ego'], axis: 'cul_theo',
        description: "The government does not endorse a particular universal narrative."},
    'atheism':{
        key: 'atheism', group: 'Culture', name: 'State Nihilism', axis: 'cul_theo'},
    'mythology':{
        key: 'mythology', group: 'Culture', name: 'State Mythology 🐲', idealPro: [ 'trad' ], axis: 'cul_theo'},
    'futurism':{
        key: 'futurism', group: 'Culture', name: 'State Futurism 🚀', idealPro: [ 'prog' ], axis: 'cul_theo'},
    'drama':{
        key: 'drama', group: 'Culture', name: 'State Drama 🎵', idealPro: [ 'state' ], axis: 'cul_theo'},
    // '':{key: // , group: '', name: 'Religious Schooling', 'state', idealPro: [ 'trad', axis: 'cul_ed'},
    // '':{key: // , group: '', name: 'University Grants', 'ego', axis: 'cul_ed'},
    // '':{key: // , group: '', name: 'College For All', 'state', idealPro: [ 'prog', axis: 'cul_ed'},
    'poll_tax':{
        key: 'poll_tax', group: 'Taxation', name: 'Poll Tax', idealPro: [ 'trad', 'state' ], axis: 'tax_basic',
        description: 'Subjects must pay a flat tax every month.'},
    'sales_tax':{
        key: 'sales_tax', group: 'Taxation', name: 'Sales Tax', idealPro: [ 'ego' ], axis: 'tax_basic',
        description: 'Subjects must pay a percentage tax for every transaction.'},
    'wealth_tax':{
        key: 'wealth_tax', group: 'Taxation', name: 'Wealth Tax', idealPro: [ 'prog', 'state' ], axis: 'tax_basic',
        description: 'Rich subjects must pay a percentage tax on their excess cash.'},
    'vice_tax':{
        key: 'vice_tax', group: 'Taxation', name: 'Vice Tax', idealPro: [ 'trad'], axis: 'tax_second',
        description: 'Entertainment goods have a flat tax.'},
    'prop_tax':{
        key: 'prop_tax', group: 'Taxation', name: 'Property Tax', idealPro: [ 'prog'], axis: 'tax_second',
        description: 'Subjects must pay a tax on housing.'},
    'death_tax':{
        key: 'death_tax', group: 'Taxation', name: 'Death Tax', idealPro: [ 'prog'], axis: 'tax_second',
        description: 'Dead subjects pay a portion of their cash to the government.'},
}

export type LawGroupToLaws = {
    [key in LawGroup]: ILaw[]
};
export class Government{
    public get laws(): ILaw[] {
        return Object.values(this.lawTree);
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
    public lawTree: {[key in LawAxis]: ILaw} = {} as {[key in LawAxis]: ILaw};
}