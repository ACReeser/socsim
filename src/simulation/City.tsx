import { IBeanContainer, Tile, Trait, TraitEthno, TraitJob } from "../World";
import { Bean } from "./Bean";
import { Economy } from "./Economy";
import { Government } from "./Government";
import { GenerateBean, GetRandom } from "../WorldGen";
import { ICityPartyHQ, Party } from "./Politics";
import { Geography, HexPoint, IBuilding, JobToBuilding } from "./Geography";
import { IDate } from "./Time";
import { shuffle } from "./Utils";
import { BuildingJobSlot } from "./Occupation";


export function reportIdeals(beans: Bean[]): {avg: number, winner: Trait}{
    return _report(beans, 'ego' as Trait, (b) => b.ideals);
}
export function reportCommunity(beans: Bean[]): {avg: number, winner: Trait}{
    return _report(beans, 'state' as Trait, (b) => b.community);
}
export function reportEthno(beans: Bean[]): {avg: number, winner: Trait}{
    return _report(beans, 'circle' as Trait, (b) => b.ethnicity);
}
export function _report(beans: Bean[], defWin: Trait, beanPropGet: (bean: Bean) => Trait): {avg: number, winner: Trait}{
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


export class City extends Geography implements Tile, IBeanContainer {
    public name: string = '';
    public url: string = '';
    public type: string = '';
    public key: number = 0;
    public get beans(): Bean[] {
        return this.historicalBeans.filter((x) => x.alive);
    }
    public set beans(beans: Bean[]){
        throw "can't set city beans";
    }
    public historicalBeans: Bean[] = [];
    public ufos: UFO[] = [];
    public houses: any[] = [];
    public partyHQ?: ICityPartyHQ;
    public yearsPartyDonations: number = 0;

    /// computed properties
    public majorityEthnicity: TraitEthno = 'circle';
    public costOfLiving: number = 1;

    public economy?: Economy;
    public law?: Government;
    public environment?: IDate;
    public doOnCitizenDie: Array<(b: Bean, c: City) => void> = [];

    tryGetJob(bean: Bean, job: TraitJob): boolean{
        if(job === 'jobless') return false;
        const buildingType = JobToBuilding[job];
        const all = this.byType[buildingType].all;
        
        for (let i = 0; i < all.length; i++) {
            const building = all[i];
            const slots = building.openSlots();
            if (slots.length > 0){
                const slot = slots.shift() as BuildingJobSlot;
                building.job_slots[slot] = bean.key;
                return true;
            }
        }

        return false;
    }
    unsetJob(bean: Bean){
        if (bean.job === 'jobless') return;
        const buildingType = JobToBuilding[bean.job];
        const all = this.byType[buildingType].all;
        for (let i = 0; i < all.length; i++) {
            const building = all[i];
            if (building.tryFreeBean(bean.key))
                break;
        }
    }

    getRandomCitizen(): Bean|null{
        const shuffled = shuffle(this.beans);
        if (shuffled.length > 0) {
            return shuffled[0];
        } else {
            return null;
        }
    }
    onCitizenDie(deadBean: Bean){
        if (deadBean.cash > 0){
            const lucky = this.getRandomCitizen();
            if (lucky) {
                lucky.cash = lucky.cash + deadBean.cash;
                deadBean.cash = 0;
            }
        }
        this.doOnCitizenDie.forEach((x) => x(deadBean, this));
    }
    breedBean(parent: Bean) {
        const job: TraitJob = Math.random() <= .5 ? parent.job : GetRandom(['doc', 'farmer', 'builder', 'jobless']);
        const bean = GenerateBean(this, this.historicalBeans.length, undefined, job);
        bean.ethnicity = parent.ethnicity;
        this.tryGetJob(bean, job);
        bean.cash = parent.cash / 2;
        parent.cash /= 2;
        bean.bornInPetri = true;
        if (this.environment)
            bean.dob = {year: this.environment?.year, season: this.environment?.season, day: this.environment?.day};
        this.historicalBeans.push(bean);
    }
    getTaxesAndDonations(party: Party, economy: Economy){
    }
    calculate(economy: Economy, law: Government) {
        this.costOfLiving = economy.getCostOfLiving();
        const c = this.beans.reduce((count: {circle: number, square: number, triangle: number}, bean) => {
            switch(bean.ethnicity){
                case 'circle': count.circle++;break;
                case 'square': count.square++;break;
                case 'triangle': count.triangle++;break;
            }
            return count;
        }, {circle: 0, square: 0, triangle: 0});
        if (c.circle > c.square && c.circle > c.triangle){
            this.majorityEthnicity = 'circle';
        } else if (c.square > c.circle && c.square > c.triangle){
            this.majorityEthnicity = 'square';
        } else {
            this.majorityEthnicity = 'triangle';
        }
    }
    getNearestNeighbors(source: Bean): Bean[] {
        return this.beans.filter((b) => {
            if (b.key == source.key) return false;

            const p = this.movers.bean[b.key];
            const q = this.movers.bean[source.key];
            const squared = Math.pow(p.x - q.x, 2)+Math.pow(p.y - q.y, 2);

            return squared < 1600 && squared > 600;
        });
    }
}