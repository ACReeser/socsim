import { Bean } from "./Bean";
import { City } from "./City";
import { BuildingTypes, HexPoint, IBuilding, Point } from "./Geography";
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
    public job_slots: {[key in BuildingJobSlot]: number|null} = {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
    }
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
        const workers = this.getBeans();
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
            case 'cooperative':
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
    getBeans(): Bean[]{
        const beans: Bean[] = [];
        for(const bKey in this.getBeanKeys()){
            const bean = this.city?.beans.find((y) => y.key === +bKey);
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
        return Object.keys(this.job_slots).filter((s, i) => {
            return this.job_slots[+s as BuildingJobSlot] === null && (i < 3 || this.upgraded);
        }).map((x) => +x);
    }
    usedSlots(): BuildingJobSlot[]{
        return Object.keys(this.job_slots).filter((s) => {
            return this.job_slots[+s as BuildingJobSlot] != null;
        }).map((x) => +x);
    }
    tryFreeBean(beanKey: number): boolean{
        const usedSlots = this.usedSlots();
        for (let i = 0; i < usedSlots.length; i++) {
            const slot = usedSlots[i];
            const beanInSlot = this.job_slots[slot];
            if (beanInSlot === beanKey){
                this.job_slots[slot] = null;
                return true;
            }
        }
        return false;
    }
}