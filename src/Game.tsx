import { BuildingTypes } from "./simulation/Geography";

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
export interface IDifficulty{
    cost: {
        emptyHex: {[key in PlayerEmptyHexAction]: {[key in BuildingTypes]: ResourceTriad}},
        hex: {[key in PlayerHexAction]: ResourceTriad} 
        bean: {[key in PlayerBeanAction]: ResourceTriad}
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
    
            },
            brainwash: {},
            abduct: {},
            gift: {},
            empower: {},
            disappear: {},
            siphon: {},
        }
    }
}

function a(){

}