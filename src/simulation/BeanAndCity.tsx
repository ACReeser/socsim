import { IWorldState } from "../state/features/world";
import { TraitJob } from "../World";
import { IBean } from "./Agent";
import { BuildingToJob, IBuilding, JobToBuilding } from "./Geography";
import { IEnterprise, isEnterprise } from "./Institutions";
import { BuildingJobSlot } from "./Occupation";
import { BuildingOpenSlots } from "./RealEstate";
import { shuffle } from "./Utils";

export function BeanTryFindJob(world: IWorldState, bean: IBean): boolean{
    const city = world.cities.byID[bean.cityKey];

    const openSlotBuildings = shuffle(city.buildingKeys.map(
        x => world.buildings.byID[x]
        ).filter(
        x => {
            const canHire = ['farm', 'house', 'theater', 'hospital'].includes(x.type);
            const isHiring = BuildingOpenSlots(x).length > 0;
            return canHire && isHiring;
        }));
    
    
    for (let i = 0; i < openSlotBuildings.length; i++) {
        const building = openSlotBuildings[i];
        const slots = BuildingOpenSlots(building);
        if (slots.length > 0){
            BeanSetJob(bean, building, world.enterprises.byID[building.key]);
            return true;
        }
    }
    return false;
}
export function BeanTrySetJob(world: IWorldState, bean: IBean, job: TraitJob): boolean{
    if (job === 'jobless') 
        return false;
    const city = world.cities.byID[bean.cityKey];

    const allOfType = city.buildingKeys.map(x => world.buildings.byID[x]).filter((x) => x.type === JobToBuilding[job]);
    
    for (let i = 0; i < allOfType.length; i++) {
        const building = allOfType[i];
        const slots = BuildingOpenSlots(building);
        if (slots.length > 0){
            BeanSetJob(bean, building, world.enterprises.byID[building.key]);
            return true;
        }
    }
    return false;
}
export function BeanSetJob(bean: IBean, building: IBuilding, enterprise: IEnterprise){
    building.jobs.push(bean.key);
    bean.employerEnterpriseKey = building.key;
    if (enterprise && enterprise.ownerBeanKey == null){
        enterprise.ownerBeanKey = bean.key;
    }
    bean.job = BuildingToJob[building.type];
}