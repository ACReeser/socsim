import { PubSub } from "../events/Events";
import { MoverStoreInstance } from "../MoverStoreSingleton";
import { IWorldState } from "../state/features/world";
import { Trait, TraitEmote } from "../World";
import { GetRandom } from "../WorldGen";
import { IBean } from "./Agent";
import { SecondaryBeliefData, TraitBelief } from "./Beliefs";
import { GetCostOfLiving, IEconomy } from "./Economy";
import { BuildingTypes, HexPoint, IBuilding, Point, Vector } from "./Geography";
import { IPickup } from "./Pickup";
import { BuildingTryFreeBean } from "./RealEstate";


export function reportIdeals(beans: IBean[]): {avg: number, winner: Trait}{
    return _report(beans, 'ego' as Trait, (b) => b.ideals);
}
export function reportCommunity(beans: IBean[]): {avg: number, winner: Trait}{
    return _report(beans, 'state' as Trait, (b) => b.community);
}
export function reportEthno(beans: IBean[]): {avg: number, winner: Trait}{
    return _report(beans, 'circle' as Trait, (b) => b.ethnicity);
}
export function _report(beans: IBean[], defWin: Trait, beanPropGet: (bean: IBean) => Trait): {avg: number, winner: Trait}{
    const result = { avg: 0, winner: defWin };
    const all = beans.reduce((stash: any, bean) => {
        const value = beanPropGet(bean);
        if (stash[value] == null) { stash[value] = 1;}
        else { stash[value]++}
        return stash;
    }, {});
    Object.keys(all).forEach((trait) => {
        if (all[trait] > result.avg) {
            result.avg = all[trait];
            result.winner = trait as Trait;
        }
    });
    result.avg /= beans.length;
    return result;
}

export class UFO{
    constructor(public key: number, public point: HexPoint, public action: string){}
}
export class Pickup implements IPickup{
    constructor(public key: number, public point: Point, public type: TraitEmote){}
    public velocity: Vector = {x: 0, y: 0};
    public onMove = new PubSub<Point>();
}

export interface ICity{
    key: number,
    name: string,
    petriRadius: number,
    petriOrigin: Point,
    hex_size: Point,
    deadBeanKeys: number[],
    beanKeys: number[],
    ufoKeys: number[],
    buildingKeys: number[],
    pickupMagnetPoint: Point|undefined,
    hexes: HexPoint[],
    districtKeys: number[],
    buildingMap: {[hexKey: string]: number},
    pickupKeys: number[],
    costOfLiving: number
}

export function CalculateCityComputed(city: ICity, economy: IEconomy){
    city.costOfLiving = GetCostOfLiving(economy);
}
/**
 * SIDE-EFFECTS
 * @param bean 
 * @param world 
 */
export function BeanLoseJob(bean: IBean, world: IWorldState){
    if (bean.employerEnterpriseKey){
        const building = world.buildings.byID[bean.employerEnterpriseKey];
        const enterprise = world.enterprises.byID[bean.employerEnterpriseKey];
        if (enterprise.ownerBeanKey == bean.key){
            enterprise.ownerBeanKey = building.jobs.find(x => x != bean.key);
        }
        BuildingUnsetJob(building, bean);
    }
}
export function BuildingUnsetJob(building: IBuilding, bean: IBean){
    if (bean.job === 'jobless') return;
    if (BuildingTryFreeBean(building, bean.key)){
        bean.employerEnterpriseKey = undefined;
        bean.job = 'jobless';
    }
}
export function CityGetPopulationTraitsList(scannedBeans: {[beanKey: number]: boolean}, beans: IBean[]): {icon: string, noun: string, count: number}[]{
    return Array.from(
        beans.reduce((m, b) => {
            if (scannedBeans[b.key]){
                b.beliefs.forEach((t) => {
                    const prev = m.get(t) || 0;
                    m.set(t, prev+1);
                });
            } else {
                m.set('Unknown', (m.get('Unknown') || 0) + 1);
            }
            return m;
        }, new Map<TraitBelief|'Unknown', number>()).entries()
    ).sort(([aT, aC], [bT, bC]) => bC - aC).map(([t, c]) => {
        return t === 'Unknown' ? {
            icon: '❔',
            noun: 'Unknown',
            count: c
        } : {
            icon: SecondaryBeliefData[t].icon,
            noun: SecondaryBeliefData[t].noun,
            count: c
        }
    });
}
export function CityGetRandomBuildingOfType(city: ICity, world: IWorldState, buildingType: BuildingTypes): IBuilding|undefined{
    const keysOfType: number[] = city.buildingKeys.filter(x => world.buildings.byID[x].type === buildingType);
    if (keysOfType.length < 1)
        return undefined;
    const r = GetRandom(world.seed, keysOfType);
    return world.buildings.byID[r]
}
export function CityGetRandomEntertainmentBuilding(city: ICity, world: IWorldState): IBuilding|undefined{
    const keysOfType: number[] = city.buildingKeys.filter(x => world.buildings.byID[x].type === 'nature' || world.buildings.byID[x].type === 'park' || world.buildings.byID[x].type === 'theater');
    if (keysOfType.length < 1)
        return undefined;
    const r = GetRandom(world.seed, keysOfType);
    return world.buildings.byID[r]
}
export function CityGetNearestNeighbors(city: ICity, source: IBean): number[]{
    const q = MoverStoreInstance.Get('bean', source.key).current;
    if (!q)
        return [];
    return city.beanKeys.filter((bKey) => {
        if (bKey == source.key) return false;

        const p = MoverStoreInstance.Get('bean', bKey).current;
        if (!p)
            return false;
        const squared = Math.pow(p.point.x - q.point.x, 2)+Math.pow(p.point.y - q.point.y, 2);

        return squared < 1600 && squared > 600;
    });
}