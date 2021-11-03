import { EntityAddToSlice } from "../state/entity.state";
import { IWorldState } from "../state/features/world";
import { ICity } from "./City";
import { IEconomy } from "./Economy";
import { BuildingToGood, BuildingTypes, HexPoint, Point } from "./Geography";

export type DwellingKind = 'apartment'|// communal urban
'townhouse'| // individual urban
'house'| // (detached) rural
'loft' // mixedUse urban
;

export const DwellingKindToIcon = {
    apartment: '🚪',
    house: '🏡',
    townhouse: '🏘️',
    loft: '🚪'
}

export interface IBuilding{
    key: number;
    hex: HexPoint,
    point: Point;
    type: BuildingTypes;
    employeeBeanKeys: number[];
    upgradedJobs: boolean, // more jobs in 1 place
    upgradedStorage: boolean, //store more goods
    upgradedLoft: boolean, //add 1 dwelling
    enterpriseKey?: number,
    lotKey: number,
    dwellingKeys?: number[]
}

export interface IDwelling{
    key: number,
    occupantKey?: number,
    buildingKey: number,
    kind: DwellingKind
}

const EnterpriseBuildings: BuildingTypes[] = ['farm', 'hospital', 'theater'];

export function BuildingNumOfOpenJobs(b: IBuilding): number{
    return BuildingMaximumJobs(b) - b.employeeBeanKeys.length;
}
export const BuildingJobs: {[key in BuildingTypes]: number} = {
    'church': 0,
    'courthouse': 0,
    'park': 0,
    'house': 0,
    'farm': 3,
    'hospital': 3,
    'theater': 3,
    'nature': 0
};
export function BuildingMaximumJobs(b: IBuilding): number{
    const multiplier = b.upgradedJobs ? 2: 1;
    return BuildingJobs[b.type] * multiplier;
}

export function BuildingTryFreeBean(b: IBuilding, beanKey: number): boolean{
    const oldLen = b.employeeBeanKeys.length;
    b.employeeBeanKeys = b.employeeBeanKeys.filter(x => x != beanKey);
    return oldLen === b.employeeBeanKeys.length+1;
}
export function GenerateIBuilding(world: IWorldState, city: ICity, type: BuildingTypes, hex: HexPoint, point: Point, lotKey: number, econ: IEconomy): IBuilding{
    const newBuilding: IBuilding = {
        type: type,
        key: world.buildings.nextID++,
        hex: hex,
        point: {...point},
        lotKey: lotKey,
        employeeBeanKeys: [],
        upgradedLoft: false,
        upgradedJobs: false,
        upgradedStorage: false
    }
    world.buildings.allIDs.push(newBuilding.key);
    world.buildings.byID[newBuilding.key] = newBuilding;
    city.buildingKeys.push(newBuilding.key);
    const lot = world.lots.byID[lotKey];
    lot.buildingKey = newBuilding.key;

    if (EnterpriseBuildings.some(x => x === type)){
        newBuilding.enterpriseKey = newBuilding.key;
        world.enterprises.allIDs.push(newBuilding.key);
        world.enterprises.byID[newBuilding.key] = {
            cash: 0,
            cityKey: city.key,
            enterpriseType: "company",
            buildingKey: newBuilding.key,
            key: newBuilding.key,
            ticksSinceLastSale: 0
        }
    }
    if (type === 'house'){
        const kind = world.districts.byID[lot.districtKey].kind === 'urban' ? 'townhouse' : 'house';
        const dwellingKeys: number[] = [];
        for (let i = 0; i < 3; i++) {
            const newDwell: IDwelling = {
                key: 0,
                buildingKey: newBuilding.key,
                kind: kind
            };
            EntityAddToSlice(world.dwellings, newDwell);
            dwellingKeys.push(newDwell.key);
        }
        newBuilding.dwellingKeys = dwellingKeys;
    }

    const good = BuildingToGood[type];
    
    if (good && good != 'fun')
    {
        world.economy.market.listings[good].push({
            price: 1,
            quantity: 3,
            sellerCityKey: city.key,
            sellerEnterpriseKey: newBuilding.key
        });
    }
    return newBuilding;
}