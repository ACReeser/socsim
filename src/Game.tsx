import { BuildingTypes } from "./simulation/Geography";
import { RubricKeys } from "./simulation/Player";
import { IThreshold, TraitGood } from "./World";

export type PlayerEmptyHexAction = 'build';
export type PlayerHexAction = 'beam';
export type PlayerBeanAction = 'scan'|'brainwash_ideal'|'brainimplant_secondary'|'brainwash_secondary'|'abduct'|'vaporize'|'siphon'|'empower'|'gift';
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
    },
    report_card_progression: RubricKeys[]
}
export const DefaultDifficulty: IDifficulty = {
    cost: {
        emptyHex: {
            build: {
                house: {
                    energy: 1,
                    bots: 3
                },
                farm: {
                    energy: 1,
                    bots: 3
                },
                theater: {
                    energy: 1,
                    bots: 4
                },
                hospital: {
                    energy: 1,
                    bots: 4
                },
                church: {
                    energy: 1,
                    bots: 4
                },
                courthouse: {
                    energy: 999,
                    bots: 999
                }
            }
        },
        hex: {
            beam: {
                energy: 3
            },
        },
        bean: {
            scan: {
                energy: 1
            },
            ['brainwash_ideal']: { psi: 4},
            ['brainimplant_secondary']: { psi: 3},
            ['brainwash_secondary']: {psi: 2},
            abduct: {
                bots: 3,
                psi: 1
            },
            gift: {},
            empower: {},
            vaporize: {
                energy: 2,
                bots: 4
            },
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
    },
    report_card_progression: []
};