import { IWorldState } from "../state/features/world";
import { ICity } from "./City";
import { IEconomy } from "./Economy";
import { BuildingToGood, BuildingTypes, HexPoint, IBuilding, Point } from "./Geography";
import { EnterpriseType, IEnterprise } from "./Institutions";
import { BuildingJobSlot } from "./Occupation";

const EnterpriseBuildings: BuildingTypes[] = ['farm', 'hospital', 'house', 'theater'];

export function BuildingOpenSlots(b: IBuilding): number[]{
    return [0,1,2,3,4,5].filter((s, i) => {
        return b.jobs[+s] == null && (i < 3 || b.upgraded);
    }).map((x) => +x);
}

export function BuildingUsedSlots(b: IBuilding): number[]{
    return [0,1,2,3,4,5].filter((s) => {
        return b.jobs[+s] != null;
    }).map((x) => +x);
}

export function BuildingTryFreeBean(b: IBuilding, beanKey: number): boolean{
    const oldLen = b.jobs.length;
    b.jobs = b.jobs.filter(x => x != beanKey);
    return oldLen === b.jobs.length+1;
}
export function GenerateIBuilding(world: IWorldState, city: ICity, type: BuildingTypes, hex: HexPoint, point: Point, lotKey: number, econ: IEconomy): IBuilding{
    const newBuilding: IBuilding = {
        type: type,
        key: world.buildings.nextID++,
        hex: hex,
        point: {...point},
        lotKey: lotKey,
        jobs: [],
        upgraded: false
    }
    world.buildings.allIDs.push(newBuilding.key);
    world.buildings.byID[newBuilding.key] = newBuilding;
    city.buildingKeys.push(newBuilding.key);
    world.lots.byID[lotKey].buildingKey = newBuilding.key;

    if (EnterpriseBuildings.some(x => type)){
        newBuilding.enterpriseKey = newBuilding.key;
        world.enterprises.allIDs.push(newBuilding.key);
        world.enterprises.byID[newBuilding.key] = {
            cash: 0,
            cityKey: city.key,
            enterpriseType: "company",
            key: newBuilding.key,
            ticksSinceLastSale: 0
        }
    }

    const good = BuildingToGood[type];
    
    if (good != 'fun')
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