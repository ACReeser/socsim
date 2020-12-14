import { TraitCommunity, TraitIdeals } from "../World";
import { IPolicy } from "./Politics";

export type LawGroup = 'Taxation'|'Welfare'|'Economics'|'Crime'|'Culture';
export type LawAxis = 'wel_food'|'wel_house'|'wel_health'|'tax_basic'|'tax_second'|'econ_ex'|'econ_labor'|'econ_sub'|'cul_rel'|'cul_theo'|'cul_ed'|'law_vote'|'law_bribe'|'law_imm'|'all';

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
    ideals?: TraitIdeals,
    community?: TraitCommunity,
    name: string;
    hint?: string;
    description?: string;
}
export const LawData: {[key in LawKey]: ILawData} = {
    'eat_cake':{
        key: 'eat_cake', group: 'Welfare', name: 'Let Them Eat Cake', ideals: 'trad', community: 'ego', axis: 'wel_food', hint: 'No state solution for hunger'},
    'food_bank':{
        key: 'food_bank', group: 'Welfare', name: 'Food Bank', ideals: 'prog', community: 'ego', axis: 'wel_food'},
    'food_stamps':{
        key: 'food_stamps', group: 'Welfare', name: 'Food Stamps', ideals: 'trad', community: 'state', axis: 'wel_food'},
    'univ_rations':{
        key: 'univ_rations', group: 'Welfare', name: 'Universal Rations', ideals: 'prog', community: 'state', axis: 'wel_food'},
    'outside':{
        key: 'outside', group: 'Welfare', name: 'Sleep Outside', community: 'ego', ideals: 'trad', axis: 'wel_house'},
    'homeless_shelters':{
        key: 'homeless_shelters', group: 'Welfare', name: 'Homeless Shelters', community: 'ego', ideals: 'prog', axis: 'wel_house'},
    'housing_subsidy':{
        key: 'housing_subsidy', group: 'Welfare', name: 'Housing Subsidy', community: 'state', ideals: 'trad', axis: 'wel_house'},
    'state_apartments':{
        key: 'state_apartments', group: 'Welfare', name: 'State Apartments', community: 'state', ideals: 'prog', axis: 'wel_house'},
    'stay_healthy':{
        key: 'stay_healthy', group: 'Welfare', name: 'Stay Healthy', community: 'ego', ideals: 'trad', axis: 'wel_health'},
    'clinics':{
        key: 'clinics', group: 'Welfare', name: 'Charity Clinics', community: 'ego', ideals: 'prog', axis: 'wel_health'},
    'medical_aid':{
        key: 'medical_aid', group: 'Welfare', name: 'Medical Aid', community: 'state', ideals: 'trad', axis: 'wel_health'},
    'univ_health':{
        key: 'univ_health', group: 'Welfare', name: 'Universal Healthcare', community: 'state', ideals: 'prog', axis: 'wel_health'},
    'hands_off':{
        key: 'hands_off', group: 'Economics', name: 'Laissez-faire', community: 'ego', ideals:'trad', axis: 'econ_sub'},
    'grain_sub':{
        key: 'grain_sub', group: 'Economics', name: 'Grain Subsidy', community: 'state', axis: 'econ_sub'},
    'arts':{
        key: 'arts', group: 'Economics', name: 'Arts Patronage', community: 'ego', ideals: 'prog', axis: 'econ_sub'},
    'theocracy':{
        key: 'theocracy', group: 'Culture', name: 'State Religion', community: 'state', ideals: 'trad', axis: 'cul_rel'},
    'secularism':{
        key: 'secularism', group: 'Culture', name: 'Secularism', community: 'ego', axis: 'cul_rel'},
    'atheism':{
        key: 'atheism', group: 'Culture', name: 'State Atheism', community: 'state', ideals: 'prog', axis: 'cul_rel'},
    'mythology':{
        key: 'mythology', group: 'Culture', name: 'Temple of Myth 🌊', axis: 'cul_theo'},
    'futurism':{
        key: 'futurism', group: 'Culture', name: 'Church of the Future ☀️', axis: 'cul_theo'},
    'drama':{
        key: 'drama', group: 'Culture', name: 'Chapel of Drama ☘️', axis: 'cul_theo'},
    // '':{key: // , group: '', name: 'Religious Schooling', community: 'state', ideals: 'trad', axis: 'cul_ed'},
    // '':{key: // , group: '', name: 'University Grants', community: 'ego', axis: 'cul_ed'},
    // '':{key: // , group: '', name: 'College For All', community: 'state', ideals: 'prog', axis: 'cul_ed'},
    'poll_tax':{
        key: 'poll_tax', group: 'Taxation', name: 'Poll Tax', community:'state', ideals: 'trad', axis: 'tax_basic'},
    'sales_tax':{
        key: 'sales_tax', group: 'Taxation', name: 'Sales Tax', community: 'ego', axis: 'tax_basic'},
    'wealth_tax':{
        key: 'wealth_tax', group: 'Taxation', name: 'Wealth Tax', community: 'state', ideals: 'prog', axis: 'tax_basic'},
    'vice_tax':{
        key: 'vice_tax', group: 'Taxation', name: 'Vice Tax', ideals: 'trad', axis: 'tax_second'},
    'prop_tax':{
        key: 'prop_tax', group: 'Taxation', name: 'Property Tax', ideals: 'prog', axis: 'tax_second'},
    'death_tax':{
        key: 'death_tax', group: 'Taxation', name: 'Death Tax', ideals: 'prog', axis: 'tax_second'},
}

export class Government{
    public get laws(): ILaw[] {
        return Object.values(this.lawTree);
    }
    public set laws(val: ILaw[]) {
        val.forEach((v) => {
            this.lawTree[v.axis] = v;
        })
    }
    public lawTree: {[key in LawAxis]: ILaw} = {} as {[key in LawAxis]: ILaw};
}