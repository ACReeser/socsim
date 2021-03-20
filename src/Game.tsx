import { BeliefCommonality } from "./simulation/Beliefs";
import { BuildingTypes } from "./simulation/Geography";
import { RubricKeys } from "./simulation/Player";
import { IThreshold, TraitGood } from "./World";

export type PlayerEmptyHexAction = 'build';
export type PlayerHexAction = 'beam'|'upgrade';
export type PlayerBeanAction = 'scan'|'abduct'|'vaporize'|'siphon'|'empower'|'gift';
export type PlayerBeanBrainAction = 'brainwash_ideal'|'brainimplant_secondary'|'brainwash_secondary';
export type PlayerMarketAction = 'energy'|'bots';
export type PlayerGovernmentAction = '';
export type PlayerAction = PlayerHexAction|PlayerBeanAction;

export interface PlayerResources{
    energy?: number;
    bots?: number;
    hedons?: number;
    tortrons?: number;
}
export interface BeanResources{
    sanity?: number;
}
export function triadToString(cost: PlayerResources, sign: '+'|''|'-', qty: number = 1){
    const costs = [];
    if (cost.energy){
        costs.push(sign+(cost.energy*qty)+' Energy');
    }
    if (cost.bots){
        costs.push(sign+(cost.bots*qty)+' Bots');
    }
    if (cost.hedons){
        costs.push(sign+(cost.hedons*qty)+' Hedons');
    }
    if (cost.tortrons){
        costs.push(sign+(cost.tortrons*qty)+' Tortrons');
    }
    return costs.join(' ');
}
export interface SecondaryResources{
    research?: number;
    leadership?: number;
}
export interface IDifficulty{
    cost: {
        emptyHex: {[key in PlayerEmptyHexAction]: {[key in BuildingTypes]: PlayerResources}},
        hex: {[key in PlayerHexAction]: PlayerResources} 
        bean: {[key in PlayerBeanAction]: PlayerResources},
        bean_brain: {[key in PlayerBeanBrainAction]: BeanResources}
        market: {
            resource: {[key in PlayerMarketAction]: PlayerResources},
            beliefs: {[key in BeliefCommonality]: PlayerResources}
        }
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
                },
                park: {
                    energy: 1,
                    bots: 4
                },
                nature: {
                    energy: 1,
                    bots: 4
                }
            }
        },
        hex: {
            beam: {
                energy: 3
            },
            upgrade: {
                energy: 1,
                bots: 4,
            }
        },
        bean_brain: {
            brainwash_ideal: { sanity: 4},
            brainimplant_secondary: { sanity: 3},
            brainwash_secondary: {sanity: 2},
        },
        bean: {
            scan: {
                energy: 1
            },
            abduct: {
                bots: 3
            },
            gift: {},
            empower: {},
            vaporize: {
                energy: 2,
                bots: 4
            },
            siphon: {},
        },
        market: {
            resource: {
                bots: {
                    hedons: 6
                },
                energy: {
                    hedons: 5
                }
            },
            beliefs: {
                common: {},
                uncommon: {},
                rare: {}
            },
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