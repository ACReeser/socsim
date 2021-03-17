import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitShelter, TraitHealth, TraitFood, TraitJob, JobToGood, IHappinessModifier, TraitToModifier, MaslowHappinessScore, GetHappiness, GoodToThreshold, TraitGood, TraitSanity, TraitEmote } from "../World";
import { RandomEthno, GetRandom, GetRandomNumber } from "../WorldGen";
import { Economy, ISeller } from "./Economy";
import { Policy, Party } from "./Politics";
import { IEvent, PubSub } from "../events/Events";
import { IDate, withinLastYear } from "./Time";
import { Government } from "./Government";
import { AgentState, IActivityData, IAgent, IBean, IChatData, IdleState, IMover } from "./Agent";
import { JobToBuilding, Point } from "./Geography";
import { City } from "./City";
import { PriorityQueue } from "./Priorities";
import { SecondaryBeliefData, TraitBelief } from "./Beliefs";
import { IPlayerData } from "./Player";

const BabyChance = 0.01;
const HappyChance = 0.01;
const UnhappyChance = 0.01;
const EmoteCrisisChance = .10;
const EmoteTickRamp = 12;
export const DaysUntilSleepy = 7;
const ChatCooldownMS = 4000;
export type BeanDeathCause = 'vaporization'|'exposure'|'starvation'|'sickness';

const HedonismExtraChance = 0.1;
const HedonismHateWorkChance = 0.1;
export class Bean implements IBean{
    public key: number = 0;
    public cityKey: number = 0;
    public dob: IDate = {year: 0, season: 0, day: 1, hour: 0};
    public bornInPetri: boolean = false;
    public name: string = 'Human Bean';
    public sanity: TraitSanity = 'sane'
    public discrete_sanity: number = 10;
    /**
     * 0-1
     */
    public discrete_fun: number = 0;
    public lifecycle: 'alive'|'dead'|'abducted' = 'alive';
    public get alive(): boolean{
        return this.lifecycle === 'alive';
    }
    public set alive(val: boolean){
        this.lifecycle = val === true ? 'alive' : 'dead';
    }

    public activity_queue: IActivityData[] = [];
    public speed = 60;
    public direction = {x: 0,y:0}; 
    public markers: Point[] = [];
    public destinationKey = 0;


    public city: City|null = null;

    public ethnicity: TraitEthno = RandomEthno();

    //maslow
    public discrete_food: number = 1;
    public get food(): TraitFood {
        if (this.discrete_food >= GoodToThreshold['food'].abundant)
        return 'stuffed';
        else if (this.discrete_food >= GoodToThreshold['food'].sufficient)
        return 'sated'
        else
        return 'hungry';
    }
    public shelter: TraitShelter = 'crowded';
    public discrete_health: number = 2;
    public get health(): TraitHealth {
        if (this.discrete_health >= GoodToThreshold['medicine'].abundant)
        return 'fresh';
        else if (this.discrete_health >= GoodToThreshold['medicine'].sufficient)
        return 'bruised'
        else
        return 'sick';
    }
    //values
    public community: TraitCommunity = 'ego';
    public ideals: TraitIdeals = 'trad';
    //other
    public job: TraitJob = 'jobless';
    public buildingKey?: number;
    public faith: TraitFaith = 'noFaith';
    public beliefs: TraitBelief[] = [];
    public cash: number = 3;
    public partyLoyalty: number = 0.2;
    /**
     * -100 to 100
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
    public ticksSinceLastSale: number = 0;
    public ticksSinceLastRelax: number = 0;
    public ticksSinceLastEmote: number = 0;
    /**
     * days until needs sleep
     */
    public discrete_stamina: number = 7;
    public fairGoodPrice: number = 1;
    public lastChatMS: number = Date.now();
    get isInCrisis(): boolean{
        return this.food == 'hungry' ||
        this.shelter == 'podless' ||
        this.health == 'sick';
    }
    believesIn(belief: TraitBelief): boolean{
        return this.beliefs.indexOf(belief) !== -1;
    }
    loseSanity(amount: number){
        const multiplier = this.believesIn('Neuroticism') ? 2 : 1;
        this.discrete_sanity -= multiplier * amount;
    }
    getHappinessModifiers(econ: Economy, homeCity: City, law: Government): IHappinessModifier[]{
        const mods: IHappinessModifier[] = [
            TraitToModifier[this.food],
            TraitToModifier[this.shelter],
            TraitToModifier[this.health],
            {
                reason: 'Entertainment', mod: this.discrete_fun*.4
            }
        ];
        if (this.ideals == 'trad' && this.ethnicity != homeCity.majorityEthnicity) {
            mods.push({reason: 'Xenophobic', mod: -.1});
        }
        if (this.community == 'ego' && this.job != 'jobless' && 
            homeCity.byType[JobToBuilding[this.job]].all.find(x => x.key === this.buildingKey)?.upgraded) {
            mods.push({reason: 'Hates Building Density', mod: -.1});
        }
        if (this.cash < 1) {
            mods.push({reason: 'Penniless', mod: MaslowHappinessScore.Deficient});
        } else if (this.cash > econ.getCostOfLiving() * 3){
            mods.push({reason: 'Upper Class', mod: 0.3});
        } else if (this.cash > econ.getCostOfLiving() * 2){
            mods.push({reason: 'Middle Class', mod: 0.15});
        }
        if (this.job == 'jobless') {
            mods.push({reason: 'Unemployed', mod: MaslowHappinessScore.Deficient});
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
        if (this.faith != 'noFaith')
            traits[this.faith] = true;
        return traits;
    }
    getFace(): string{
        // if (!this.alive)
        //     return '💀';
        if (this.state.data.act == 'buy' && this.state.data.good == 'shelter'){
            return '😴';
        }
        if (this.state.data.act == 'crime'){
            return '😈';
        }
        if (this.state.data.act == 'relax'){
            return '😎';
        }
        if (this.state.data.act == 'chat'){
            if (this.state.data.chat?.participation === 'speaker'){
                switch(this.state.data?.chat?.type){
                    default: return '😃';
                    case 'gift': return '😇';
                    case 'praise': return '🥳';
                    case 'bully': return '😈';
                }
            }
            return '🤨';
        }
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
    getSpeech(): string | undefined {
        if (this.state.data.act === 'chat'){
            if (this.state.data.chat?.participation === 'speaker' && this.state.data.chat.preachBelief){
                return '💬'+SecondaryBeliefData[this.state.data.chat.preachBelief].icon;
            }
        }
        return undefined;
    }
    getCrimeDecision(
        good: TraitGood,
        crimeReason: 'desperation'|'greed',
    ){
        const roll = Math.random();
        let chance = 0.05;
        if (this.community == 'ego'){
            chance += .1;
        }
        if (crimeReason === 'desperation' && this.health === 'sick' || this.food === 'hungry'){
            chance += .15;
        }
        return chance <= roll;
    }
    tryFindRandomJob(law: Government) {
        const job: TraitJob = GetRandom(['builder', 'doc', 'farmer', 'entertainer']);
        if (!this.trySetJob(job)){
            
            this.city?.eventBus?.nojobslots.publish({icon: '🏚️', trigger: 'nojobslots', message: `A subject cannot find a job; build or upgrade more buildings.`});
        }
    }
    trySetJob(job: TraitJob): boolean{
        if (this.city?.tryGetJob(this, job)){
            this.city.unsetJob(this);
            this.job = job;
            return true;
        }
        return false;
    }
    public maybeChat(): boolean {
        if (this.lastChatMS + ChatCooldownMS > Date.now()) 
            return false;
        if (this.state.data.act === 'chat')
            return false;
        const roll = Math.random();
        const chance = (this.community === 'state') ? 0.2 : 0.1;
        return roll < chance;
    }
    public getRandomChat(nearby: Bean[]): IChatData {
        const canPreach = this.beliefs.length;
        if (canPreach){
            if (this.believesIn('Charity') && this.cash >= 2){
                //find a bean with less money than self, poorest in sight
                const needy = nearby.filter(x => x.cash <= this.cash-1).reduce((least: Bean|null, bean) => {
                    if (least == null || (bean.cash < least.cash))
                        return bean;
                    return least;
                }, null);
                if (needy) {
                    this.cash -= 0.5;
                    needy.cash += 0.5;
                    return {
                        participation: 'speaker',
                        type: 'gift',
                        targetBeanKey: needy.key
                    }
                }
            }
            return {
                participation: 'speaker',
                type: 'preach',
                preachBelief: GetRandom(this.beliefs)
            }
        } else {
            return {
                participation: 'speaker',
                type: 'praise'
            }
        }
    }
    work(law: Government, econ: Economy) {
        if (this.job == 'jobless'){
        } else {
            switch(this.job){
                case 'farmer':
                    this.discrete_food = Math.min(this.discrete_food+1, GoodToThreshold.food.sufficient*2);
                    break;
                case 'doc':
                    this.discrete_health = Math.min(this.discrete_health+1, GoodToThreshold.medicine.sufficient*2);
                    break;
                case 'builder': 
                    this.shelter = 'crowded';
                    this.discrete_stamina = 7;
                    break;
            }
            if (this.believesIn('Diligence') && Math.random() <= 0.5){
                this.discrete_fun += 0.5;
            }
            if (this.believesIn('Hedonism') && Math.random() <= HedonismHateWorkChance){
                this.emote('unhappiness');
            }
            this.ticksSinceLastSale++;
            if (this.ticksSinceLastSale > 7){
                const cityHasOtherWorkers = this.city ? this.city.beans.filter(x => x.job == this.job).length > 1 : false;
                //underemployment
                if (cityHasOtherWorkers && Math.random() > 0.5) {
                    const newJob = econ.mostInDemandJob();
                    if (newJob)
                        this.trySetJob(newJob);
                }
            }
            econ.produceAndPrice(this, JobToGood(this.job), 4, this.fairGoodPrice);
        }
    }
    private buyFood(economy: Economy) {
        const groceries = economy.tryTransact(this, 'food', 0.5, 3);
        if (groceries)
            this.discrete_food += groceries.bought;
        if (this.food === 'stuffed'){
            this.emote('happiness');
            if (this.believesIn('Gluttony')){
                this.emote('happiness');
            }
        }
        return groceries;
    }
    public buy: {[key in TraitGood]: (econ: Economy)=> boolean} = {
        food: (economy: Economy) =>{
            return this.buyFood(economy) != null;
        },
        medicine:  (economy: Economy) =>{
            return this.buyMeds(economy) != null;
        },
        fun:  (economy: Economy) =>{
            return this.buyFun(economy);
        },
        shelter: (economy: Economy) => {
            return this.buyHousing(economy);
        }
    }
    public steal(good: 'food'|'medicine', econ: Economy){
        const stolen = econ.steal(good, 3);
        if (stolen != null){
            switch(good){
                case 'food':
                    this.discrete_food += stolen;
                    break;
                case 'medicine':
                    this.discrete_health += stolen;
                    break;
            }
        }
    }
    private buyHousing(economy: Economy): boolean {
        const housing = economy.tryTransact(this, 'shelter');
        if (housing) {
            this.discrete_stamina = 10;
            this.shelter = 'crowded';
        } else if (this.discrete_stamina <= 0){
            this.shelter = 'podless';
        }
        return housing != null;
    }
    private buyFun(economy: Economy): boolean {
        const fun = economy.tryTransact(this, 'fun');
        if (fun) {
            this.discrete_fun = 1;
            this.emote('happiness');
        }
        return fun != null;
    }

    age(economy: Economy): IEvent|null {
        if (!this.alive) return null;

        const wasNotHungry = this.food !== 'hungry';
        const wasNotSick = this.health !== 'sick';

        this.discrete_food -= 1/7;
        if (this.discrete_food < 0)
            this.discrete_health -= 0.2;

        const starve = this.maybeDie('starvation', 0.6);
        if (starve)
            return null;
        else if (this.food === 'hungry' && wasNotHungry){
            this.emote('unhappiness');
            if (this.believesIn('Gluttony')){
                this.emote('unhappiness');
                this.emote('unhappiness');
            }
        }
            
        if (this.shelter == 'podless')
            this.discrete_health -= 1/14;
        
        this.discrete_stamina--;
    
        const exposure = this.maybeDie('exposure', 0.2);
        if (exposure)
            return null;

        this.discrete_health -= 1/20;
        this.discrete_health = Math.min(this.discrete_health, 3);
        const sick = this.maybeDie('sickness', 0.4);
        if (sick)
            return null;
        else if (this.health === 'sick' && wasNotSick)
            this.emote('unhappiness');

        this.discrete_fun -= 1/10;
        this.discrete_fun = Math.max(0, this.discrete_fun);
        return null;
    }
    private buyMeds(economy: Economy) {
        const meds = economy.tryTransact(this, 'medicine', 0.5, 3);
        if (meds)
            this.discrete_health += meds.bought;
        if (this.health === 'fresh')
            this.emote('happiness');
        return meds;
    }
    get babyChance(): number{
        let base = BabyChance;
        if (this.believesIn('Natalism'))
            return base + .15;
        else
            return base;
    }
    maybeBaby(economy: Economy): IEvent | null {
        if (this.canBaby(economy.getCostOfLiving()) &&
            Math.random() <= this.babyChance) {
            if (this.city)
                this.city.breedBean(this);
            else
                throw 'bean does not have city object';
            return {icon: '🎉', trigger: 'birth', message: `${this.name} has a baby!`}
        } else {
            return null;
        }
    }
    canBaby(costOfLiving: number): boolean{
        return this.alive && this.cash > costOfLiving * 3 &&
            !this.isInCrisis;
    }
    maybeEmote(): TraitEmote | null {
        if (this.lifecycle == 'alive'){
            const unhappy = Math.random();
            if (unhappy < this.unhappyChance)
                return 'unhappiness';
            else {
                const happy = Math.random();
                if (happy < this.happyChance)
                    return 'happiness';
            }
        }
        return null;
    }
    get unhappyChance(): number{
        let base = UnhappyChance;
        base -= Math.min(0, this.ticksSinceLastEmote / EmoteTickRamp);
        
        if (this.isInCrisis)
            base += EmoteCrisisChance;
        
        return base;
    }
    get happyChance(): number{
        let base = HappyChance;
        base -= Math.min(0, this.ticksSinceLastEmote / EmoteTickRamp);
        return base + (this.lastHappiness / 100 / 2);
    }
    maybeCrime(good: TraitGood): boolean {
        if (good === 'shelter') return false;
        if (good === 'fun') return false;
        const roll = Math.random();
        let chance = 0.05;
        if (this.community == 'ego'){
            chance += .1;
        }
        if (this.isInCrisis){
            chance += .1;
        }
        if (this.believesIn('Greed')){
            chance += .25;
        }
        if (this.believesIn('Anarchism')){
            chance += .33;
        }
        if (this.believesIn('Authority')){
            chance -= .25;
        }
        if (good === 'food' && this.food === 'hungry'){
            chance += .25;
        }
        else if (good === 'medicine' && this.health === 'sick'){
            chance += .25;
        }
        return chance <= roll;
    }
    emote(emote: TraitEmote){
        this.ticksSinceLastEmote = 0;
        this.city?.addEmotePickup(this.key, emote);
        if (this.believesIn('Hedonism') && (emote == 'happiness' || emote == 'love') && Math.random() < HedonismExtraChance){
            this.city?.addEmotePickup(this.key, emote);
        }
    }
    canBuy(good: TraitGood): 'yes'|'nosupply'|'pricedout' {
        return this.city?.economy?.canBuy(this, good) || 'nosupply';
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
        // const chance = this.chanceToDonate(economy, direct);
        // if (chance > 0){
        //     const willDonate = Math.random() < chance;
        //     if (willDonate){
        //         const donation = 1;
        //         this.cash -= donation;
        //         return donation;
        //     }
        // }
        return 0;
    }
    maybeDie(cause: BeanDeathCause, chance = 0.5): boolean{
        if (this.discrete_health < 0 && Math.random() <= chance) {
            this.die(cause);
            return true;
        }
        return false;
    }
    die(cause: BeanDeathCause){
        this.alive = false;
        const pains = GetRandomNumber(2, 3);
        for (let i = 0; i < pains; i++) {
            this.emote('hate');
        }
        this.city?.eventBus?.death.publish({
            icon: '☠️', trigger: 'death', message: `${this.name} died of ${cause}!`, 
            beanKey: this.key, cityKey: this.cityKey,
            point: this.city?.movers.bean[this.key]
    });
    }
    abduct(player: IPlayerData){
        this.lifecycle = 'abducted';
        player.abductedBeans.push(this);
    }

    state: AgentState = IdleState.create();
    jobQueue: PriorityQueue<AgentState> = new PriorityQueue<AgentState>([]);
    onAct = new PubSub<number>();
}