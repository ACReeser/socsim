import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitFood, TraitJob, City, JobToGood, IHappinessModifier, TraitToModifier, MaslowScore, GetHappiness } from "./World";
import { RandomEthno, GetRandom } from "./WorldGen";
import { Economy, ISeller } from "./Economy";
import { Policy, Party } from "./Politics";
import { IEvent } from "./events/Events";
import { IDate, withinLastYear } from "./simulation/Time";
import { Government } from "./simulation/Government";
import { IAgent, IBean, IMover } from "./simulation/Agent";


const BabyChance = 0.05;
const SeasonsUntilEviction = 1;
export class Bean implements IBean, ISeller, IMover, IAgent{
    public key: number = 0;
    public cityKey: number = 0;
    public alive: boolean = true;
    public dob: IDate = {year: 0, season: 0, day: 1};
    public name: string = 'Human Bean';
    public sanity = 1;

    public activity_queue = [];
    public speed = 0;
    public direction = {x: 0,y:0}; 
    public markers = [];
    public destinationKey = 0;


    public city: City|null = null;

    public ethnicity: TraitEthno = RandomEthno();
    public lastApproval: IDate = {year: -1, season: 0, day: 0};

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
    public partyLoyalty: number = 0.2;
    /**
     * -100-100
     */
    public lastHappiness: number = 0;
    /**
     * -100-100
     */
    public lastSentiment: number = 0;
    /**
     * -100-100
     */
    public lastPartySentiment: number = 0;
    public seasonSinceLastSale: number = 0;
    public seasonSinceLastRent: number = 0;
    public lastApprovalDate: IDate = {year: -1, season: 0, day: 0};
    public lastInsultDate: IDate = {year: -1, season: 0, day: 0};
    public fairGoodPrice: number = 1;
    get isInCrisis(): boolean{
        return this.food == 'hungry' ||
        this.shelter == 'podless' ||
        this.health == 'sick';
    }
    getHappinessModifiers(econ: Economy, homeCity: City, law: Government): IHappinessModifier[]{
        const mods: IHappinessModifier[] = [
            TraitToModifier[this.food],
            TraitToModifier[this.shelter],
            TraitToModifier[this.health],
        ];
        if (this.ideals == 'trad' && this.ethnicity != homeCity.majorityEthnicity) {
            mods.push({reason: 'Xenophobic', mod: -.1});
        }
        if (this.cash < 1) {
            mods.push({reason: 'Penniless', mod: MaslowScore.Deficient});
        } else if (this.cash > econ.getCostOfLiving() * 3){
            mods.push({reason: 'Upper Class', mod: 0.3});
        } else if (this.cash > econ.getCostOfLiving() * 2){
            mods.push({reason: 'Middle Class', mod: 0.15});
        }
        if (this.job == 'jobless') {
            mods.push({reason: 'Unemployed', mod: MaslowScore.Deficient});
        }

        return mods;
    }
    getSentimentModifiers(econ: Economy, homeCity: City, law: Government, party: Party): {
        party: IHappinessModifier[],
        law: IHappinessModifier[]
    }{
        const result = {party: [] as IHappinessModifier[], law: [] as IHappinessModifier[]};

        if (this.community == party.community){
            result.party.push({reason: 'Same Community', mod: 0.15});
        }
        if (this.ideals == party.ideals){
            result.party.push({reason: 'Same Ideals', mod: 0.15});
        } else if (this.community != party.community){
            result.party.push({reason: 'Incompatible Values', mod: -0.15});
        }
        if (homeCity.environment && withinLastYear(homeCity.environment, this.lastApprovalDate)){
            result.party.push({reason: 'Public Endorsement', mod: 0.2});   
        }
        party.differingPolicies(law).forEach((policy) => {
            if (policy.community && policy.community == this.community){
                result.party.push({reason: 'Likes '+policy.name, mod: 0.1});
            } else if (policy.ideals && policy.ideals == this.ideals){
                result.party.push({reason: 'Likes '+policy.name, mod: 0.1});
            }
        });
        return result;
    }
    calculateBeliefs(econ: Economy, homeCity: City, law: Government, party: Party): void{
        this.lastHappiness = GetHappiness(this.getHappinessModifiers(econ, homeCity, law));
        const sent = this.getSentimentModifiers(econ, homeCity, law, party);
        this.lastSentiment = GetHappiness(sent.law);
        this.lastPartySentiment = GetHappiness(sent.party);

        if (this.job == 'jobless'){
            this.fairGoodPrice = 1;
        } else {
            const myGood = JobToGood(this.job);
            this.fairGoodPrice = econ.getFairGoodPrice(myGood);
        }
    }
    /**
     * non-normalized multiplier
     */
    getSentimentPolicies(traits: {[x:string]:boolean}, policies: Policy[]){
        let multiplier = 100;
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
        if (this.lastHappiness < 0)
            return '☹️';
        if (this.lastHappiness >= 50)
            return '🙂';
        return '😐';
    }
    getIdea(costOfLiving: number): {bad: boolean, idea: string}|null {
        if (this.food == 'hungry')
            return {bad: true, idea: '🍗'};
        if (this.health == 'sick')
            return {bad: true, idea: '💊'};
        if (this.shelter == 'podless')
            return {bad: true, idea: '🏠'};
        if (this.canBaby(costOfLiving))
            return {bad: false, idea: '👶'};
        return null;        
    }
    tryFindRandomJob(law: Government) {
        if (Math.random() > 0.5) {
            this.job = GetRandom(['builder', 'doc', 'farmer']);
        }
    }
    canInsult(): boolean{
        return Boolean(this.city && this.city.environment && !withinLastYear(this.city.environment, this.lastInsultDate));
    }
    canSupport(): boolean{
        return Boolean(this.city && this.city.environment && !withinLastYear(this.city.environment, this.lastApprovalDate));
    }
    work(law: Government, econ: Economy) {
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
            this.buyFood(economy);
        }

        this.discrete_food -= 1;
        if (this.discrete_food < 0)
            this.discrete_health -= 0.3;

        return this.maybeDie('starvation', 0.6);
    }
    private buyFood(economy: Economy) {
        const groceries = economy.tryTransact(this, 'food');
        if (groceries)
            this.discrete_food += groceries.bought;
    }

    weather(economy: Economy): IEvent|null {
        if (!this.alive) return null;
        if (this.job == 'builder'){
            this.shelter = 'crowded';
        } else {
            const hasHousing = this.buyHousing(economy);
            if (!hasHousing){
                if (this.seasonSinceLastRent > SeasonsUntilEviction) {
                    this.shelter = 'podless';
                }
                else {
                    this.seasonSinceLastRent++;
                }
            }
        }        
        
        if (this.shelter == 'podless')
            this.discrete_health -= 0.1;
        
        return this.maybeDie('exposure', 0.2);
    }
    private buyHousing(economy: Economy): boolean {
        const housing = economy.tryTransact(this, 'shelter');
        if (housing) {
            this.seasonSinceLastRent = 0;
            this.shelter = 'crowded';
        }
        return housing != null;
    }

    age(economy: Economy): IEvent|null {
        if (!this.alive) return null;
        if (this.job == 'doc'){
            this.discrete_health += 0.25;
        } else {
            this.buyMeds(economy);
        }
        this.discrete_health -= 0.2;
        this.discrete_health = Math.min(this.discrete_health, 3);
        return this.maybeDie('sickness', 0.4);
    }
    private buyMeds(economy: Economy) {
        const meds = economy.tryTransact(this, 'medicine');
        if (meds)
            this.discrete_health += meds.bought;
    }

    maybeOverconsume(economy: Economy){
        const threshold = economy.getCostOfLiving() * 2;
        if (this.food != 'stuffed' && this.cash > threshold){
            this.buyFood(economy);
        }
        if (this.health != 'fresh' && this.cash > threshold){
            this.buyMeds(economy);
        }
    }

    maybeBaby(economy: Economy): IEvent | null {
        if (this.canBaby(economy.getCostOfLiving()) &&
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
    canBaby(costOfLiving: number): boolean{
        return this.cash > costOfLiving * 3 &&
            !this.isInCrisis;
    }
    /**
     * should return 0-1 float, with 1 meaning 100%
     * @param economy 
     */
    chanceToDonate(economy: Economy, direct: boolean = false): number{
        const canDonate = this.cash > economy.getCostOfLiving() * 2 && !this.isInCrisis;
        if (canDonate && this.lastPartySentiment > 0.5){
            const threshold = direct ? 0.2 : 0.5;
            const baseChance = this.lastPartySentiment - threshold;
            return (baseChance) / 2;
        }
        return 0;
    }
    maybeDonate(economy: Economy, direct: boolean = false): number{
        const chance = this.chanceToDonate(economy, direct);
        if (chance > 0){
            const willDonate = Math.random() < chance;
            if (willDonate){
                const donation = 1;
                this.cash -= donation;
                return donation;
            }
        }
        return 0;
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
