import { BuildingTypes } from "./simulation/Geography";
import { IThreshold, TraitGood } from "./World";

export type PlayerEmptyHexAction = 'build';
export type PlayerHexAction = 'kidnap';
export type PlayerBeanAction = 'scan'|'brainwash'|'abduct'|'disappear'|'siphon'|'empower'|'gift';
export type PlayerGovernmentAction = '';
export type PlayerAction = PlayerHexAction|PlayerBeanAction;

export interface ResourceTriad{
    energy?: number;
    bots?: number;
    psi?: number;
}
export function triadToString(cost: ResourceTriad, sign: '+'|''|'-'){
    const costs = [];
    if (cost.energy){
        costs.push(sign+cost.energy+' Energy');
    }
    if (cost.bots){
        costs.push(sign+cost.bots+' Bots');
    }
    if (cost.psi){
        costs.push(sign+cost.psi+' Psi');
    }
    return costs.join(' ');
}
export interface SecondaryResources{
    research?: number;
    leadership?: number;
}
export interface IDifficulty{
    cost: {
        emptyHex: {[key in PlayerEmptyHexAction]: {[key in BuildingTypes]: ResourceTriad}},
        hex: {[key in PlayerHexAction]: ResourceTriad} 
        bean: {[key in PlayerBeanAction]: ResourceTriad}
    },
    bean_life: {
        vital_thresh: {[key in TraitGood]: IThreshold}
    }
}
export const DefaultDifficulty: IDifficulty = {
    cost: {
        emptyHex: {
            build: {
                house: {
                    energy: 3,
                    bots: 3
                },
                farm: {
                    energy: 3,
                    bots: 3
                },
                theater: {
                    energy: 4,
                    bots: 4
                },
                hospital: {
                    energy: 4,
                    bots: 4
                },
                church: {
                    energy: 4,
                    bots: 4
                },
                courthouse: {
                    energy: 999,
                    bots: 999
                }
            }
        },
        hex: {
            kidnap: {
                energy: 4
            },
        },
        bean: {
            scan: {
                energy: 1
            },
            brainwash: {},
            abduct: {},
            gift: {},
            empower: {},
            disappear: {},
            siphon: {},
        }
    },
    bean_life: {
        vital_thresh: {
            'food': {sufficient: 1, abundant: 3},
            'shelter': {sufficient: 1, abundant: 3},
            'medicine': {sufficient: 1, abundant: 3},
            'fun': {sufficient: 1, abundant: 3},
        }
    }
};