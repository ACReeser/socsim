import { IWorldState } from "../state/features/world";
import { Bean } from "./Bean";
import { City, ICity } from "./City";
import { IEconomy } from "./Economy";
import { BuildingToGood, BuildingTypes, HexPoint, IBuilding, Point } from "./Geography";
import { EnterpriseType, IEnterprise } from "./Institutions";
import { BuildingJobSlot } from "./Occupation";

export class Building implements IBuilding, IEnterprise{
    public city?: City;
    public key: number = 0;
    public cityKey: number = 0;
    public address: HexPoint = {q: 0, r: 0};
    public type: BuildingTypes = 'farm';
    public occupied_slots: Point[] = [];
    public empty_slots: Point[] = [];
    public upgraded: boolean = false;
    public job_slots: {[key in BuildingJobSlot]: number|undefined} = {
    } as {[key in BuildingJobSlot]: number|undefined};
    public enterpriseType: EnterpriseType = 'company';
    public ownerBeanKey?: number | undefined;
    public ticksSinceLastSale: number = 0;
    public bank: number = 0;
    get cash(): number{
        return this.bank;
    }
    set cash(revenue: number){
        this.bank += revenue;
        this.distributeCash();
    }
    distributeCash(){
        const workers = this.getWorkerBeans();
        switch(this.enterpriseType){
            case 'company':
                if (workers.length < 1) {
                    //noop;
                } else if (workers.length === 1){
                    workers[0].cash += this.bank;
                    this.bank = 0;
                }
                else {
                    const share = this.bank / (workers.length + 0.5);
                    this.bank = 0;
                    let owner = workers.find(x => x.key === this.ownerBeanKey);
                    if (owner == null){
                        owner = workers[0];
                        this.ownerBeanKey = owner.key;
                    }
                    workers.forEach(x => {
                        if (x === owner){
                            x.cash += share * 1.5;
                        } else {
                            x.cash += share;
                        }
                    });
                }
                break;
            case 'co-op':
                const share = this.bank / workers.length;
                this.bank = 0;
                workers.forEach(x => {
                    x.cash += share;
                });
                break;
            case 'commune':
                const commShare = this.bank / workers.length;
                this.bank = 0;
                workers.forEach(x => {
                    x.cash += commShare;
                });
                break;
        }
    }
    getWorkerBeans(): Bean[]{
        const beans: Bean[] = [];
        for(const bKey in this.getBeanKeys()){
            const bean = this.city?.beans.get.find((y) => y.key === +bKey);
            if (bean){
                beans.push(bean);
            }
        }
        return beans;
    }
    getBeanKeys(): number[]{
        const ids: number[] = [];
        const keys = Object.keys(this.job_slots);
        for(const key in keys){
            const slot = +key as BuildingJobSlot;
            const val = this.job_slots[slot];
            if (val != null){
                ids.push(val);
            }
        }
        return ids;
    }
    openSlots(): BuildingJobSlot[]{
        return BuildingOpenSlots(this);
    }
    usedSlots(): BuildingJobSlot[]{
        return BuildingUsedSlots(this);
    }
    tryFreeBean(beanKey: number): boolean{
        return BuildingTryFreeBean(this, beanKey);
    }
}

export function BuildingOpenSlots(b: IBuilding): BuildingJobSlot[]{
    return [0,1,2,3,4,5].filter((s, i) => {
        return b.job_slots[+s as BuildingJobSlot] == null && (i < 3 || b.upgraded);
    }).map((x) => +x);
}

export function BuildingUsedSlots(b: IBuilding): BuildingJobSlot[]{
    return [0,1,2,3,4,5].filter((s) => {
        return b.job_slots[+s as BuildingJobSlot] != null;
    }).map((x) => +x);
}

export function BuildingTryFreeBean(b: IBuilding, beanKey: number): boolean{
    const usedSlots = BuildingUsedSlots(b);
    for (let i = 0; i < usedSlots.length; i++) {
        const slot = usedSlots[i];
        const beanInSlot = b.job_slots[slot];
        if (beanInSlot === beanKey){
            b.job_slots[slot] = undefined;
            return true;
        }
    }
    return false;
}
export function GenerateIBuilding(world: IWorldState, city: ICity, type: BuildingTypes, hex: HexPoint, econ: IEconomy): IBuilding{
    const newBuilding: IBuilding = {
        type: type,
        key: world.buildings.nextID++,
        address: hex,
        job_slots: {} as {[key in BuildingJobSlot]: number|undefined},
        upgraded: false
    }
    world.buildings.allIDs.push(newBuilding.key);
    world.buildings.byID[newBuilding.key] = newBuilding;
    city.buildingKeys.push(newBuilding.key);
    city.buildingMap[`${hex.q},${hex.r}`] = newBuilding.key;
    const good = BuildingToGood[type];
    // todo redux todo
    // if (good != 'fun')
    //     EconomyEmployAndPrice(econ, newBuilding, good, EnterpriseStartingListing, GetFairGoodPrice(econ, good))
    return newBuilding;
}