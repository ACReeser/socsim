import { IWorldState } from "../state/features/world";
import { TraitJob } from "../World";
import { GetRandom } from "../WorldGen";
import { IBean } from "./Agent";
import { BuildingUnsetJob } from "./City";
import { BeanDistrictIdeologyBonus } from "./Economy";
import { BuildingToJob, JobToBuilding } from "./Geography";
import { IEnterprise } from "./Institutions";
import { BuildingJobSlot } from "./Occupation";
import { BuildingNumOfOpenJobs, IBuilding } from "./RealEstate";
import { shuffle } from "./Utils";

export function BeanTryFindJob(world: IWorldState, bean: IBean, previousEmployerKey: number|null = null): boolean{
    const city = world.cities.byID[bean.cityKey];
    const employableBuildingKeys = city.buildingKeys.filter(x => BuildingNumOfOpenJobs(world.buildings.byID[x]) > 0);
    if (employableBuildingKeys.length < 1)
        return false;
    const employableBuildings = employableBuildingKeys.map(x => world.buildings.byID[x]);
    const jobs = employableBuildings.map(x => {
        return {
            ideologyBonus: BeanDistrictIdeologyBonus(bean, world.districts.byID[world.lots.byID[x.lotKey].districtKey].kind),
            isEmpty: x.employeeBeanKeys.length === 0,
            openJobs: BuildingNumOfOpenJobs(x),
            building: x
        }
    });
    jobs.sort((a, b) => {
        if (a.isEmpty != b.isEmpty)
            return a.isEmpty ? -1 : 1;
        else if (a.ideologyBonus != b.ideologyBonus)
            return a.ideologyBonus - b.ideologyBonus;
        return a.openJobs - b.openJobs;
    });
    
    if (jobs.length > 0){
        const {building} = jobs[0];
        if (bean.employerEnterpriseKey != null){
            BuildingUnsetJob(world.buildings.byID[bean.employerEnterpriseKey], bean);
        }
        BeanSetJob(bean, building, world.enterprises.byID[building.key]);
        return true;
    }
    return false;
}

export function BeanSetJob(bean: IBean, building: IBuilding, enterprise: IEnterprise){
    building.employeeBeanKeys.push(bean.key);
    bean.employerEnterpriseKey = building.key;
    if (enterprise && enterprise.ownerBeanKey == null){
        enterprise.ownerBeanKey = bean.key;
    }
    bean.job = BuildingToJob[building.type];
}