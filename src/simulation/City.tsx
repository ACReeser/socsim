import { IBeanContainer, Tile, Trait, TraitEthno, TraitJob, TraitEmote } from "../World";
import { Bean } from "./Bean";
import { Economy } from "./Economy";
import { Government } from "./Government";
import { GenerateBean, GetRandom, GetRandomNumber } from "../WorldGen";
import { ICityPartyHQ, Party } from "./Politics";
import { Geography, HexPoint, IBuilding, JobToBuilding, Point, Vector } from "./Geography";
import { IDate } from "./Time";
import { shuffle } from "./Utils";
import { BuildingJobSlot } from "./Occupation";
import { IEventBus, Live, LiveList, PubSub } from "../events/Events";
import { WorldSound } from "../WorldSound";
import { isEnterprise } from "./Institutions";
import { SecondaryBeliefData, TraitBelief } from "./Beliefs";


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
export class Pickup{
    constructor(public key: number, public point: Point, public type: TraitEmote){}
    public velocity: Vector = {x: 0, y: 0};
    public onMove = new PubSub<Point>();
}


export class City extends Geography implements Tile, IBeanContainer {
    public name: string = '';
    public url: string = '';
    public type: string = '';
    public key: number = 0;
    public beans = new LiveList<Bean>([]);
    public historicalBeans = new LiveList<Bean>([]);
    public readonly pickups = new LiveList<Pickup>([]);
    public ufos: UFO[] = [];
    public pickupSeed = 0;
    public beanSeed = 0;
    public houses: any[] = [];
    public partyHQ?: ICityPartyHQ;
    public yearsPartyDonations: number = 0;

    /// computed properties
    public majorityEthnicity: TraitEthno = 'circle';
    public costOfLiving: number = 1;

    constructor(private sfx: WorldSound, public readonly economy: Economy){
        super();
    }

    public law?: Government;
    public environment?: IDate;
    public eventBus?: IEventBus;
    public pickupMagnetPoint = new Live<Point|undefined>(undefined);

    tryGetJob(bean: Bean, job: TraitJob): boolean{
        if(job === 'jobless') return false;
        const allOfType = this.book.getBuildings().filter((x) => x.type === JobToBuilding[job]);
        
        for (let i = 0; i < allOfType.length; i++) {
            const building = allOfType[i];
            const slots = building.openSlots();
            if (slots.length > 0){
                const slot = slots.shift() as BuildingJobSlot;
                building.job_slots[slot] = bean.key;
                bean.employerEnterpriseKey = building.key;
                if (isEnterprise(building) && building.ownerBeanKey == null){
                    building.ownerBeanKey = bean.key;
                }
                return true;
            }
        }

        return false;
    }
    unsetJob(bean: Bean){
        if (bean.job === 'jobless') return;
        const all = this.book.getBuildings();
        for (let i = 0; i < all.length; i++) {
            const building = all[i];
            if (building.tryFreeBean(bean.key)){
                bean.employerEnterpriseKey = undefined;
                bean.job = 'jobless';
                break;
            }
        }
    }
    addEmotePickup(p: Point, emote: TraitEmote){
        const point = {...p};
        point.x += GetRandomNumber(-10, 10);
        point.y += GetRandomNumber(-10, 10);
        const id = ++this.pickupSeed;
        this.pickups.push(new Pickup(id, point, emote));
    }

    getRandomCitizen(): Bean|null{
        const shuffled = shuffle(this.beans.get);
        if (shuffled.length > 0) {
            return shuffled[0];
        } else {
            return null;
        }
    }
    onCitizenDie(deadBean: Bean){
        if (deadBean.cash > 0){
            if (this.law && this.law.isLaw('death_tax')){
                this.law.treasury.set(this.law.treasury.get + deadBean.cash);
                deadBean.cash = 0;
            } else {
                //inheritance
                const lucky = this.getRandomCitizen();
                if (lucky) {
                    lucky.cash = lucky.cash + deadBean.cash;
                    deadBean.cash = 0;
                }
            }
        }
        this.unsetJob(deadBean);
    }
    breedBean(parent: Bean) {
        const job: TraitJob = Math.random() <= .5 ? parent.job : GetRandom(['doc', 'farmer', 'builder', 'jobless']);
        const bean = GenerateBean(this, undefined, job);
        bean.ethnicity = parent.ethnicity;
        bean.name = bean.name.split(' ')[0] + ' ' + parent.name.split(' ')[1];
        bean.cash = parent.cash / 2;
        parent.cash /= 2;
        bean.bornInPetri = true;
        if (this.environment)
            bean.dob = {year: this.environment?.year, season: this.environment?.season, day: this.environment?.day, hour: this.environment?.hour};
        this.beans.push(bean);
    }
    getTaxesAndDonations(party: Party, economy: Economy){
    }
    calculate(economy: Economy, law: Government) {
        this.costOfLiving = economy.getCostOfLiving();
        const c = this.beans.get.reduce((count: {circle: number, square: number, triangle: number}, bean) => {
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
        return this.beans.get.filter((b) => {
            if (b.key == source.key) return false;

            const p = b.point;
            const q = source.point;
            const squared = Math.pow(p.x - q.x, 2)+Math.pow(p.y - q.y, 2);

            return squared < 1600 && squared > 600;
        });
    }
    getPopulationTraitsList(scannedBeans: {[beanKey: number]: boolean}, beans = this.beans.get): {icon: string, noun: string, count: number}[]{
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
}