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
export type BeanDeathCause = 'vaporization'|'exposure'|'starvation'|'sickness';
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
        costs.push(sign+(cost.tortrons*qty)+' Antihedons');
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
            scrubHedons: PlayerResources,
            resource: {[key in PlayerMarketAction]: PlayerResources},
            beliefs: {[key in BeliefCommonality]: PlayerResources}
        }
    },
    bean_life: {
        vital_thresh: {[key in TraitGood]: IThreshold},
        degrade_per_tick: {
            food: number,
            health: number,
            stamina: number,
            fun: number
        },
        penalty: {
            homeless_health: number,
            starving_health: number
        },
        death_chance: {
            [cause in BeanDeathCause]: number
        }
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
            brainimplant_secondary: { sanity: 1},
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
            scrubHedons: {
                energy: 5
            },
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
            'food': {warning: 0.6, sufficient: 1, abundant: 3},
            'shelter': {warning: 0.6, sufficient: 1, abundant: 7},
            'medicine': {warning: 0.6, sufficient: 1, abundant: 3},
            'fun': {warning: 0.1, sufficient: 1, abundant: 3},
        },
        degrade_per_tick: {
            food: 1/12,
            health: 1/20,
            stamina: 1,
            fun: 1/12
        },
        penalty: {
            homeless_health: 1/20,
            starving_health: 1/24
        },
        death_chance: {
            starvation: 1/8,
            sickness: 1/8,
            exposure: 1/8,
            vaporization: 1
        }
    },
    report_card_progression: []
};