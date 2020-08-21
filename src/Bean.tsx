import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitFood, TraitJob, City, ShelterScore, HealthScore, FoodScore, Law, JobToGood, IEvent } from "./World";
import { RandomEthno, GetRandom } from "./WorldGen";
import { Economy } from "./Economy";
import { Policy } from "./Politics";


/**
 * a bean is a citizen with preferences
 */
export interface IBean{
    key: number;
    cityKey: number;
    community: TraitCommunity;
    ideals: TraitIdeals;
    ethnicity: TraitEthno;
    faith?: TraitFaith;
    shelter: TraitShelter;
    health: TraitHealth;
    discrete_food: number;
    cash: number;
}

const MaslowHappinessWeight = 2;
const ValuesHappinessWeight = 1;
const TotalWeight = MaslowHappinessWeight + ValuesHappinessWeight;

const BabyChance = 0.05;
export class Bean implements IBean{
    public key: number = 0;
    public cityKey: number = 0;
    public alive: boolean = true;

    public city: City|null = null;

    public ethnicity: TraitEthno = RandomEthno();

    //maslow
    public discrete_food: number = 1;
    public get food(): TraitFood {
        if (this.discrete_food >= 3)
        return 'stuffed';
        else if (this.discrete_food >= 1)
        return 'sated'
        else
        return 'hungry';
    }
    public shelter: TraitShelter = 'crowded';
    public discrete_health: number = 2;
    public get health(): TraitHealth {
        if (this.discrete_health >= 3)
        return 'fresh';
        else if (this.discrete_health >= 1)
        return 'bruised'
        else
        return 'sick';
    }
    //values
    public community: TraitCommunity = 'ego';
    public ideals: TraitIdeals = 'trad';
    //other
    public job: TraitJob = 'jobless';
    public faith?: TraitFaith;
    public cash: number = 3;
    public lastSentiment: number = 0;
    public seasonSinceLastSale: number = 0;
    public seasonSinceLastRent: number = 0;
    public fairGoodPrice: number = 1;
    /**
     * normalized multiplier, 0-1
     */
    getMaslowSentiment(homeCity: City): number{
        let maslow = ShelterScore(this.shelter) + HealthScore(this.health) + FoodScore(this.food);
        //minimum of -6, max of 3, so 10 "buckets"
        return maslow / 10; //so divide by 10 to normalize
    }
    /**
     * non-normalized multiplier
     */
    getTotalSentiment(homeCity: City, law: Law): number{
        const maslow = this.getMaslowSentiment(homeCity) * MaslowHappinessWeight;
        const traits = this._getTraitMap();
        const values = this.getSentimentPolicies(traits, law.policies) * ValuesHappinessWeight;
        return (maslow + values) / TotalWeight;
    }
    calculateBeliefs(econ: Economy, homeCity: City, law: Law): void{
        const sentiment = this.getTotalSentiment(homeCity, law);
        this.lastSentiment = sentiment;
        if (this.job == 'jobless'){
            this.fairGoodPrice = 1;
        } else {
            const myGood = JobToGood(this.job);
            const supply = econ.totalSeasonalSupply[myGood] || 1;
            const demand = econ.totalSeasonalDemand[myGood];
            this.fairGoodPrice = 0.5 + (0.5 * Math.min(demand/supply, 1));
        }
    }
    /**
     * non-normalized multiplier
     */
    getSentimentPolicies(traits: {[x:string]:boolean}, policies: Policy[]){
        let multiplier = 0;
        policies.forEach((policy) => {
            policy.fx.forEach((fx) => {
                if (traits[fx.key])
                multiplier += fx.mag * 10; //-30 to +30
            });
        });
        return multiplier / 100;
    }
    _getTraitMap(){
        let traits = {[this.community]: true, [this.ideals]:  true, [this.ethnicity]: true};
        if (this.faith)
            traits[this.faith] = true;
        return traits;
    }
    getFace(): string{
        if (!this.alive)
            return '💀';
        if (this.food == 'hungry')
            return '😫';
        if (this.health == 'sick')
            return '🤢';
        if (this.shelter == 'podless')
            return '🥶';
        if (this.job == 'jobless')
            return '😧';
        if (this.lastSentiment < 0)
            return '☹️';
        if (this.lastSentiment >= 1)
            return '🙂';
        return '😐';
    }
    getIdea(): {bad: boolean, idea: string}|null {
        if (this.food == 'hungry')
            return {bad: true, idea: '🍗'};
        if (this.health == 'sick')
            return {bad: true, idea: '💊'};
        if (this.shelter == 'podless')
            return {bad: true, idea: '🏠'};
        if (this.canBaby())
            return {bad: false, idea: '👶'};
        return null;        
    }
    tryFindRandomJob(law: { policies: Policy[]; }) {
        if (Math.random() > 0.5) {
            this.job = GetRandom(['builder', 'doc', 'farmer']);
        }
    }
    work(law: { policies: Policy[]; }, econ: Economy) {
        if (this.job == 'jobless'){
            this.tryFindRandomJob(law);
        } else {
            this.seasonSinceLastSale++;
            if (this.seasonSinceLastSale > 2){
                //underemployment
                if (Math.random() > 0.5) {
                    const newJob = econ.mostInDemandJob();
                    if (newJob)
                        this.job = newJob;
                }
            }
            econ.produceAndPrice(this, JobToGood(this.job), 2.5, this.fairGoodPrice);
        }
    }
    eat(economy: Economy): IEvent|null {
        if (this.job == 'farmer'){
            this.discrete_food += 1;
        } else {
            const groceries = economy.tryTransact(this, 'food');
            if (groceries)
                this.discrete_food += groceries.bought;
        }

        this.discrete_food -= 1;
        if (this.discrete_food < 0)
            this.discrete_health -= 0.3;

        return this.maybeDie('starvation', 0.6);
    }
    weather(economy: Economy): IEvent|null {
        if (!this.alive) return null;
        if (this.job == 'builder'){
            this.shelter = 'crowded';
        } else {
            const housing = economy.tryTransact(this, 'shelter');
            if (housing) {
                this.seasonSinceLastRent = 0;
                this.shelter = 'crowded';
            } else if (this.seasonSinceLastRent > 1){
                this.shelter = 'podless';
            } else {
                this.seasonSinceLastRent++;
            }
        }        
        
        if (this.shelter == 'podless')
            this.discrete_health -= 0.1;
        
        return this.maybeDie('exposure', 0.2);
    }
    age(economy: Economy): IEvent|null {
        if (!this.alive) return null;
        if (this.job == 'doc'){
            this.discrete_health += 0.25;
        } else {
            const meds = economy.tryTransact(this, 'medicine');
            if (meds)
                this.discrete_health += meds.bought;
        }
        this.discrete_health -= 0.2;
        this.discrete_health = Math.min(this.discrete_health, 3);
        return this.maybeDie('sickness', 0.4);
    }
    maybeBaby(economy: Economy): IEvent | null {
        if (this.canBaby() &&
            Math.random() <= BabyChance) {
            if (this.city)
                this.city.breedBean(this);
            else
                throw 'bean doesnot have city object';
            return {icon: '🎉', message: 'A new bean is born!'}
        } else {
            return null;
        }
    }
    canBaby(): boolean{
        return this.cash > 8 &&
            this.food != 'hungry' &&
            this.shelter != 'podless' &&
            this.health != 'sick';
    }
    maybeDie(cause: string, chance = 0.5): IEvent|null{
        if (this.discrete_health < 0 && Math.random() <= chance) {
            this.die();
            return {icon: '☠️', message: `A bean died of ${cause}!`};
        } else {
            return null;
        }
    }
    die(){
        this.alive = false;
        this.city?.onCitizenDie(this);
    }
}
