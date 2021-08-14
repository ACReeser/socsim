import { TraitCommunity, TraitIdeals, TraitEthno, TraitFaith, TraitStamina, TraitHealth, TraitFood, TraitJob, JobToGood, IHappinessModifier, TraitToModifier, MaslowHappinessScore, GetHappiness, GoodToThreshold, TraitGood, TraitSanity, TraitEmote, EmotionSanity, EmotionWorth } from "../World";
import { RandomEthno, GetRandom, GetRandomNumber, GetRandomRoll, GenerateBean } from "../WorldGen";
import { Economy, GetFairGoodPrice, IEconomy, ISeller } from "./Economy";
import { Policy, Party } from "./Politics";
import { IEvent, PubSub } from "../events/Events";
import { IDate, withinLastYear } from "./Time";
import { Government, IGovernment } from "./Government";
import { Act, IActivityData, IBean, IChatData } from "./Agent";
import { JobToBuilding, OriginAccelerator, Point, Vector } from "./Geography";
import { BuildingUnsetJob, City, ICity } from "./City";
import { PriorityQueue } from "./Priorities";
import { GetHedonReport, HedonExtremes, HedonReport, HedonSourceToVal, SecondaryBeliefData, TraitBelief } from "./Beliefs";
import { IPlayerData } from "./Player";
import { BeanDeathCause, BeanResources, IDifficulty } from "../Game";
import { MathClamp } from "./Utils";
import { IPickup } from "./Pickup";
import { MoverStoreInstance } from "../MoverStoreSingleton";

const BabyChance = 0.008;
export const DaysUntilSleepy = 7;
const ChatCooldownMS = 4000;
/**
 * beans with belief # < this are more likely to be persuaded
 * with belief # > this are less likely to be persuaded
 */
const PersuasionBeliefTarget = 2; 

export const HedonismExtraChance = 0.1;
export const ParanoidUnhappyChance = 0.05;
export const HedonismHateWorkChance = 0.15;
export const DiligenceHappyChance = 0.25;
export const ParochialHappyChance = 0.25;
export const CosmopolitanHappyChance = 0.25;
const ExtrovertChatExtraChance = 0.25;
const IntrovertChatExtraChance = -.15;
const AntagonismBullyChance = 0.45;
const GossipBullyChance = 0.35;
const EnthusiasmPraiseChance = 0.45;
export const GermophobiaHospitalWorkChance = 0.25;
const NatalismExtraBabyChance = 0.04;
const AntinatalismExtraBabyChance = -0.002;
const CharismaExtraPersuasionStrength = 2; //d20 based, so 10% extra strength
export const LibertarianTaxUnhappyChance = 0.1;
export const ProgressivismTaxHappyChance = 0.1;

const MaxGraceTicks = 6;
export class Bean implements IBean{
    actionData: IActivityData = {act: 'idle'};
    public key: number = 0;
    public cityKey: number = 0;
    public dob: IDate = {year: 0, season: 0, day: 1, hour: 0};
    public bornInPetri: boolean = false;
    public name: string = 'Human Bean';
    public get sanity(): TraitSanity {
        if (this.discrete_sanity >= 8)
            return 'sane';
        else if (this.discrete_sanity >= 5)
            return 'stressed'
        else if (this.discrete_sanity >= 3)
            return 'disturbed'
        else
            return 'psychotic';
    }
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
    public activity_duration: {[act in Act]: number} = {'buy': 0, 'chat': 0, 'craze': 0, 'crime': 0, 'idle': 0, 'relax': 0, 'sleep': 0, 'soapbox': 0, 'travel': 0, 'work': 0};

    public speed = 60;
    public point: Point = {x: 0, y: 0};
    public velocity: Vector = {x: 0, y: 0};
    public onMove = new PubSub<Point>();
    public destinationKey = 0;

    public city: City|null = null;

    public action: Act = 'idle';

    public ethnicity: TraitEthno = RandomEthno();

    //maslow
    public discrete_food: number = 1;
    public get food(): TraitFood {
        if (this.discrete_food >= GoodToThreshold['food'].abundant)
        return 'stuffed';
        else if (this.discrete_food >= GoodToThreshold['food'].sufficient)
        return 'sated'
        else if (this.discrete_food >= GoodToThreshold['food'].warning)
        return 'hungry'
        else
        return 'starving';
    }
    public stamina: TraitStamina = 'awake';
    public discrete_health: number = 2;
    public get health(): TraitHealth {
        if (this.discrete_health >= GoodToThreshold['medicine'].abundant)
        return 'fresh';
        else if (this.discrete_health >= GoodToThreshold['medicine'].sufficient)
        return 'bruised'
        else if (this.discrete_health >= GoodToThreshold['medicine'].warning)
        return 'sickly'
        else
        return 'sick';
    }
    //values
    public community: TraitCommunity = 'ego';
    public ideals: TraitIdeals = 'trad';
    //other
    public job: TraitJob = 'jobless';
    public employerEnterpriseKey?: number;
    public faith: TraitFaith = 'noFaith';
    public beliefs: TraitBelief[] = [];
    public cash: number = 3;
    /**
     * # of ticks before bean can possibly die of dire conditions
     */
    public graceTicks = MaxGraceTicks;
    /**
     * current hedons on index 0, plus last len-1 days of hedon history
     * 
     * do not modify - World.tsx simulate_world will handle it
     */
    public hedonHistory: HedonSourceToVal[] = [{}];
    /**
     * latest happiness report
     */
    public happiness: HedonReport = GetHedonReport(this.hedonHistory);
    public hedonFiveDayRecord: HedonExtremes = {min: 0, max: 0};
    /**
     * -100 to 100
     */
    public lastHappiness: number = 0;
    
    public ticksSinceLastSale: number = 0;
    public ticksSinceLastRelax: number = 0;
    /**
     * days until needs sleep
     */
    public discrete_stamina: number = 7;
    public fairGoodPrice: number = 1;
    public lastChatMS: number = Date.now();
    get isInCrisis(): boolean{
        return BeanIsInCrisis(this);
    }
    believesIn(belief: TraitBelief): boolean{
        return BeanBelievesIn(this, belief);
    }
    loseSanity(amount: number){
        const multiplier = this.believesIn('Neuroticism') ? 2 : 1;
        this.discrete_sanity -= multiplier * amount;
    }
    getHappinessModifiers(econ: Economy, homeCity: City, law: Government): IHappinessModifier[]{
        const mods: IHappinessModifier[] = [
            TraitToModifier[this.food],
            TraitToModifier[this.stamina],
            TraitToModifier[this.health],
            {
                reason: 'Entertainment', mod: this.discrete_fun*.4
            }
        ];
        if (this.ideals === 'trad' && this.ethnicity != homeCity.majorityEthnicity) {
            mods.push({reason: 'Xenophobic', mod: -.1});
        }
        if (this.community === 'ego' && this.job != 'jobless' && this.employerEnterpriseKey &&
            homeCity.book.db.get.get(this.employerEnterpriseKey)?.upgraded) {
            mods.push({reason: 'Hates Building Density', mod: -.1});
        }
        if (this.cash < 1) {
            mods.push({reason: 'Penniless', mod: MaslowHappinessScore.Deficient});
        } else if (this.cash > econ.getCostOfLiving() * 3){
            mods.push({reason: 'Upper Class', mod: 0.3});
        } else if (this.cash > econ.getCostOfLiving() * 2){
            mods.push({reason: 'Middle Class', mod: 0.15});
        }
        if (this.job === 'jobless') {
            mods.push({reason: 'Unemployed', mod: MaslowHappinessScore.Deficient});
        }

        return mods;
    }
    getSentimentModifiers(econ: Economy, homeCity: City, law: Government, party: Party): {
        party: IHappinessModifier[],
        law: IHappinessModifier[]
    }{
        const result = {party: [] as IHappinessModifier[], law: [] as IHappinessModifier[]};

        if (this.community === party.community){
            result.party.push({reason: 'Same Community', mod: 0.15});
        }
        if (this.ideals === party.ideals){
            result.party.push({reason: 'Same Ideals', mod: 0.15});
        } else if (this.community != party.community){
            result.party.push({reason: 'Incompatible Values', mod: -0.15});
        }
        return result;
    }
    calculateBeliefs(econ: Economy, homeCity: City, law: Government, party: Party): void{
        this.hedonFiveDayRecord = {
          min: Math.min(this.hedonFiveDayRecord.min, this.happiness.flatAverage),
          max: Math.max(this.hedonFiveDayRecord.max, this.happiness.flatAverage)  
        };
        if (this.happiness.flatAverage === 0){
            this.lastHappiness = 0;
        } else {
            this.lastHappiness = this.happiness.flatAverage >= 0 ? (
                this.happiness.flatAverage / this.hedonFiveDayRecord.max) * 100 : (
                this.happiness.flatAverage / this.hedonFiveDayRecord.min) * 100;
        }

        if (this.job === 'jobless'){
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
    getIdea(costOfLiving: number): {bad: boolean, idea: string}|null {
        if (this.food === 'hungry')
            return {bad: true, idea: '🍗'};
        if (this.health === 'sickly')
            return {bad: true, idea: '💊'};
        if (this.stamina === 'homeless')
            return {bad: true, idea: '🏠'};
        if (this.canBaby(costOfLiving))
            return {bad: false, idea: '👶'};
        return null;        
    }
    getSpeech(): string | undefined {
        if (this.action === 'chat'){
            if (this.actionData.chat?.participation === 'speaker' && this.actionData.chat.preachBelief){
                return '💬'+SecondaryBeliefData[this.actionData.chat.preachBelief].icon;
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
        if (this.community === 'ego'){
            chance += .1;
        }
        if (crimeReason === 'desperation' && this.health === 'sick' || this.food === 'starving'){
            chance += .15;
        }
        return chance <= roll;
    }
    tryFindRandomJob(law: Government) {
        const job: TraitJob = GetRandom(['builder', 'doc', 'farmer', 'entertainer']);
        if (!this.trySetJob(job)){
            
            this.city?.eventBus?.nojobslots.publish({icon: '🏚️', trigger: 'nojobslots', message: `A subject cannot find a job; build or upgrade more buildings.`, key:1});
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
    canPurchase(cost: BeanResources, sanityBonus: number) {
        return (cost.sanity === undefined || this.discrete_sanity >= cost.sanity + sanityBonus);
    }
    public maybeParanoid() {
        this.ifBelievesInMaybeEmote('Paranoia', 'unhappiness', ParanoidUnhappyChance)
    }
    public maybeAntagonised(){
        this.emote('unhappiness', 'Antagonism');
    }
    public maybeEnthused(){
        this.emote('happiness', 'Enthusiasm');
    }
    maybePersuade(belief: TraitBelief, strength: number) {
        if (this.believesIn('Dogmatism'))
            return;
        if (!this.beliefs.includes(belief)){
            let defense = 10 + GetRandomNumber(1, 6);
            defense += this.beliefs.length - PersuasionBeliefTarget;
            let offense = GetRandomNumber(1, 20) + strength;
    
            if (offense > defense){
                this.beliefs = [...this.beliefs, belief]
                this.city?.eventBus?.persuasion.publish({
                    key: 0,
                    icon: '🗣️', 
                    trigger: 'persuasion', 
                    message: `${this.name} now believes in ${SecondaryBeliefData[belief].icon} ${SecondaryBeliefData[belief].noun}!`, 
                    beanKey: this.key, cityKey: this.cityKey,
                    point: this.point
                });
            }
        }
    }
    /**
     * chats or conversations use 🗣️ in descriptions
     * @returns 
     */
    public maybeChat(): boolean {
        if (this.lastChatMS + ChatCooldownMS > Date.now()) 
            return false;
        if (this.action === 'chat')
            return false;
        const roll = Math.random();
        let chance = (this.community === 'state') ? 0.2 : 0.1;
        if (this.believesIn('Extroversion')) 
            chance += ExtrovertChatExtraChance;
        if (this.believesIn('Introversion')) 
            chance += IntrovertChatExtraChance;
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
                    this.emote('happiness', 'Charity');
                    needy.cash += 0.5;
                    needy.emote('happiness', 'Charity');
                    return {
                        participation: 'speaker',
                        type: 'gift',
                        targetBeanKey: needy.key
                    }
                }
            } else if(this.believesIn('Enthusiasm') && Math.random() < EnthusiasmPraiseChance){
                return {
                    participation: 'speaker',
                    type: 'praise',
                    preachBelief: 'Enthusiasm'
                }
            } else if(this.believesIn('Antagonism') && Math.random() < AntagonismBullyChance){
                return {
                    participation: 'speaker',
                    type: 'bully',
                    preachBelief: 'Antagonism'
                }
            } else if(this.believesIn('Gossip') && Math.random() < GossipBullyChance){
                return {
                    participation: 'speaker',
                    type: 'bully',
                    preachBelief: 'Gossip'
                }
            }
            return {
                participation: 'speaker',
                type: 'preach',
                preachBelief: GetRandom(this.beliefs),
                persuasionStrength: 1 + (this.believesIn('Charisma') ? CharismaExtraPersuasionStrength : 0)
            }
        } else {
            return {
                participation: 'speaker',
                type: 'praise'
            }
        }
    }
    work(law: Government, econ: Economy) {
        if (this.job === 'jobless'){
        } else {
            switch(this.job){
                case 'farmer':
                    this.discrete_food = Math.min(this.discrete_food+1, GoodToThreshold.food.sufficient*2);
                    this.ifBelievesInMaybeEmote('Parochialism', 'happiness', ParochialHappyChance);
                    break;
                case 'doc':
                    this.discrete_health = Math.min(this.discrete_health+1, GoodToThreshold.medicine.sufficient*2);
                    this.ifBelievesInMaybeEmote('Germophobia', 'unhappiness', GermophobiaHospitalWorkChance);
                    break;
                case 'builder': 
                    this.stamina = 'awake';
                    this.discrete_stamina = 7;
                    break;
                case 'entertainer':
                    this.ifBelievesInMaybeEmote('Cosmopolitanism', 'happiness', CosmopolitanHappyChance);
                break;
            }
            this.ifBelievesInMaybeEmote('Diligence', 'happiness', DiligenceHappyChance);
            this.ifBelievesInMaybeEmote('Hedonism', 'unhappiness', HedonismHateWorkChance);
            this.ticksSinceLastSale++;
            if (this.ticksSinceLastSale > 7){
                const cityHasOtherWorkers = this.city ? this.city.beans.get.filter(x => x.job === this.job).length > 1 : false;
                //underemployment
                if (cityHasOtherWorkers && Math.random() > 0.5) {
                    const newJob = econ.mostInDemandJob();
                    if (newJob)
                        this.trySetJob(newJob);
                }
            }
            let workedForEmployer = false;
            if (this.city && this.employerEnterpriseKey){
                const employer = this.city.getEnterprise(this.employerEnterpriseKey);
                if (employer){
                    econ.employAndPrice(employer, JobToGood(this.job), 4, this.fairGoodPrice);
                    workedForEmployer = true;
                    switch(employer.enterpriseType){
                        case 'company':
                            this.ifBelievesInMaybeEmote('Communism', 'unhappiness', 0.1);
                            if (employer.ownerBeanKey === this.key)
                                this.ifBelievesInMaybeEmote('Capitalism', 'happiness', 0.1);
                            break;
                        case 'co-op':                            
                            this.ifBelievesInMaybeEmote('Capitalism', 'unhappiness', 0.1);
                                
                            this.ifBelievesInMaybeEmote('Socialism', 'happiness', 0.1);
                            break;
                        case 'commune':                            
                            this.ifBelievesInMaybeEmote('Capitalism', 'unhappiness', 0.1);
                            break;
                    }
                }
            }
            if (!workedForEmployer)
                econ.produceAndPrice(this, JobToGood(this.job), 4, this.fairGoodPrice);
        }
    }
    private buyFood(economy: Economy) {
        const groceries = economy.tryTransact(this, 'food', 0.5, 3);
        if (groceries) {
            this.discrete_food += groceries.bought;
            if (this.food === 'stuffed'){
                this.emote('happiness', 'Stuffed');
                this.ifBelievesInMaybeEmote('Gluttony', 'happiness', 1);
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
            this.stamina = 'awake';
        } else if (this.discrete_stamina <= 0){
            this.stamina = 'homeless';
        }
        return housing != null;
    }
    private buyFun(economy: Economy): boolean {
        const fun = economy.tryTransact(this, 'fun');
        if (fun) {
            this.discrete_fun = 1;
            this.emote('happiness', 'Entertainment');
            this.emote('happiness', 'Entertainment');
        }
        return fun != null;
    }

    age(economy: Economy, diff: IDifficulty): IEvent|null {
        if (!this.alive) return null;

        const wasNotHungry = this.food !== 'starving';
        const wasNotSick = this.health !== 'sick';

        this.discrete_food -= diff.bean_life.degrade_per_tick.food;
        if (this.discrete_food < 0)
            this.discrete_health -= 0.2;

        const starve = this.maybeDie('starvation', this.food === 'starving', 0.6);
        if (starve)
            return null;
        else if (this.food === 'starving' && wasNotHungry){
            this.emote('unhappiness', 'Starving');
            if (this.believesIn('Gluttony')){
                this.emote('unhappiness', 'Gluttony');
                this.emote('unhappiness', 'Gluttony');
            }
        }
            
        this.discrete_stamina -= diff.bean_life.degrade_per_tick.stamina;
    
        const exposure = this.maybeDie('exposure', this.stamina === 'homeless', 0.2);
        if (exposure)
            return null;

        this.discrete_health -= diff.bean_life.degrade_per_tick.health;
        this.discrete_health = Math.min(this.discrete_health, 3);
        const sick = this.maybeDie('sickness', this.health === 'sick', 0.4);
        if (sick)
            return null;
        else if (this.health === 'sick' && wasNotSick){
            this.emote('unhappiness', 'sick');
            if (this.believesIn('Germophobia')){
                this.emote('unhappiness', 'Germophobia');
            }
        }

        this.discrete_fun -= diff.bean_life.degrade_per_tick.fun;
        this.discrete_fun = Math.max(0, this.discrete_fun);

        if (!this.isInCrisis)
            this.graceTicks = MathClamp(this.graceTicks+1, 0, MaxGraceTicks);
        
        return null;
    }
    private buyMeds(economy: Economy) {
        const meds = economy.tryTransact(this, 'medicine', 0.5, 3);
        if (meds){
            this.discrete_health += meds.bought;
            if (this.health === 'fresh')
                this.emote('happiness', 'Robust');
        }
        return meds;
    }
    get babyChance(): number{
        let base = BabyChance;
        if (this.believesIn('Natalism'))
            base += NatalismExtraBabyChance;
        if (this.believesIn('Antinatalism'))
            base += AntinatalismExtraBabyChance;
        return base;
    }
    maybeBaby(economy: Economy): IEvent | null {
        if (this.canBaby(economy.getCostOfLiving()) &&
            GetRandomRoll(this.babyChance)) {
            if (this.city)
                this.city.breedBean(this);
            else
                throw 'bean does not have city object';
            if (this.believesIn('Natalism')){
                this.emote('love', 'Natalist Parent');
            } else if (this.believesIn('Antinatalism')) {
                this.emote('hate', 'Antinatalism');
            } else {
                this.emote('happiness', 'Proud Parent');
            }
            return {icon: '🎉', trigger: 'birth', message: `${this.name} has a baby!`,
            key: 0,}
        } else {
            return null;
        }
    }
    canBaby(costOfLiving: number): boolean{
        return this.alive && this.cash > costOfLiving * 3 &&
            !this.isInCrisis;
    }
    maybeCrime(good: TraitGood): boolean {
        if (good === 'shelter') return false;
        if (good === 'fun') return false;
        const roll = Math.random();
        let chance = 0.05;
        if (this.community === 'ego'){
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
            chance += -.25;
        }
        if (good === 'food' && this.food === 'starving'){
            chance += .25;
        }
        else if (good === 'medicine' && this.health === 'sick'){
            chance += .25;
        }
        return chance <= roll;
    }
    ifBelievesInMaybeEmote(belief: TraitBelief, emote: TraitEmote, chance: number){
        if (this.believesIn(belief) && Math.random() < chance){
            this.emote(emote, belief);
        }
    }
    emote(emote: TraitEmote, source: string){
        this.discrete_sanity = MathClamp(this.discrete_sanity + EmotionSanity[emote], 0, 10);
        this.hedonHistory[0][source] = (this.hedonHistory[0][source] || 0) + EmotionWorth[emote];
        this.city?.addEmotePickup(this.point, emote);
        if (this.believesIn('Hedonism') && (emote === 'happiness' || emote === 'love') && Math.random() < HedonismExtraChance){
            this.city?.addEmotePickup(this.point, emote);
        }
    }
    canBuy(good: TraitGood): 'yes'|'nosupply'|'pricedout' {
        return this.city?.economy?.canBuy(this, good) || 'nosupply';
    }
    maybeDie(cause: BeanDeathCause, isDire: boolean, chance = 0.5): boolean{
        if (isDire && Math.random() <= chance) {
            if (this.graceTicks <= 0){
                this.die(cause);
                return true;
            }
            this.graceTicks--;
        }
        return false;
    }
    die(cause: BeanDeathCause){
        this.alive = false;
        const pains = GetRandomNumber(2, 3);
        for (let i = 0; i < pains; i++) {
            this.emote('hate', 'death');
        }
        this.city?.beans.remove(this);
        this.city?.historicalBeans.push(this);
        this.city?.eventBus?.death.publish({
            icon: '☠️', trigger: 'death', message: `${this.name} died of ${cause}!`, 
            beanKey: this.key, cityKey: this.cityKey,
            point: this.point,
            key: 0,
        });
    }
    maybeScarcity(good: TraitGood){
        let scarce = false;
        if (good === 'food' && (this.food === 'starving' || this.food === 'hungry'))
            scarce = true;
        else if (good === 'shelter' && (this.stamina === 'homeless' || this.stamina === 'sleepy'))
            scarce = true;
        else if (good === 'medicine' && (this.health === 'sick' || this.health === 'sickly'))
            scarce = true;
        if (scarce)
            this.emote('unhappiness', 'Scarcity');
    }
    abduct(player: IPlayerData){
        this.lifecycle = 'abducted';
    }
}

export function CalculateBeliefs(bean: IBean, econ: IEconomy, homeCity: ICity, law: IGovernment){
    bean.hedonFiveDayRecord = {
        min: Math.min(bean.hedonFiveDayRecord.min, bean.happiness.flatAverage),
        max: Math.max(bean.hedonFiveDayRecord.max, bean.happiness.flatAverage)  
    };
    if (bean.happiness.flatAverage === 0){
        bean.lastHappiness = 0;
    } else {
        bean.lastHappiness = bean.happiness.flatAverage >= 0 ? (
            bean.happiness.flatAverage / bean.hedonFiveDayRecord.max) * 100 : (
            bean.happiness.flatAverage / bean.hedonFiveDayRecord.min) * 100;
    }

    if (bean.job === 'jobless'){
        bean.fairGoodPrice = 1;
    } else {
        bean.fairGoodPrice = GetFairGoodPrice(econ, JobToGood(bean.job))
    }
}
export function BeanMaybeChat(bean: IBean): boolean {
        if (bean.lastChatMS + ChatCooldownMS > Date.now()) 
            return false;
        if (bean.action === 'chat')
            return false;
        const roll = Math.random();
        let chance = (bean.community === 'state') ? 0.2 : 0.1;
        if (BeanBelievesIn(bean, 'Extroversion')) 
            chance += ExtrovertChatExtraChance;
        if (BeanBelievesIn(bean, 'Introversion')) 
            chance += IntrovertChatExtraChance;
        return roll < chance;
}
export function BeanGetRandomChat(bean: IBean, findNeedy: () => IBean|undefined): IChatData{
    const canPreach = bean.beliefs.length;
    if (canPreach){
        if (BeanBelievesIn(bean, 'Charity') && bean.cash >= 2){
            //find a bean with less money than self, poorest in sight
            const needy = findNeedy();
            if (needy) {
                return {
                    participation: 'speaker',
                    type: 'gift',
                    targetBeanKey: needy.key
                }
            }
        } else if(BeanBelievesIn(bean, 'Enthusiasm') && Math.random() < EnthusiasmPraiseChance){
            return {
                participation: 'speaker',
                type: 'praise',
                preachBelief: 'Enthusiasm'
            }
        } else if(BeanBelievesIn(bean, 'Antagonism') && Math.random() < AntagonismBullyChance){
            return {
                participation: 'speaker',
                type: 'bully',
                preachBelief: 'Antagonism'
            }
        } else if(BeanBelievesIn(bean, 'Gossip') && Math.random() < GossipBullyChance){
            return {
                participation: 'speaker',
                type: 'bully',
                preachBelief: 'Gossip'
            }
        }
        return {
            participation: 'speaker',
            type: 'preach',
            preachBelief: GetRandom(bean.beliefs),
            persuasionStrength: 1 + (BeanBelievesIn(bean, 'Charisma') ? CharismaExtraPersuasionStrength : 0)
        }
    } else {
        return {
            participation: 'speaker',
            type: 'praise'
        }
    }
}

export function BeanAge(bean: IBean, diff: IDifficulty): {death?: IEvent, emotes?: IPickup[]}|undefined {
    if (!bean.alive) return undefined;
    const emotes: IPickup[] = [];

    const wasNotHungry = bean.food !== 'starving';
    const wasNotSick = bean.health !== 'sick';

    bean.discrete_food -= diff.bean_life.degrade_per_tick.food;
    if (bean.discrete_food < 0)
        bean.discrete_health -= 0.2;

    const starve = BeanMaybeDie(bean, 'starvation', bean.food === 'starving', 0.6);
    if (starve)
        return starve;
    else if (bean.food === 'starving' && wasNotHungry){
        emotes.push(...BeanEmote(bean, 'unhappiness', 'Starving'));
        if (BeanBelievesIn(bean, 'Gluttony')){
            emotes.push(...BeanEmote(bean, 'unhappiness', 'Gluttony'));
            emotes.push(...BeanEmote(bean, 'unhappiness', 'Gluttony'));
        }
    }
        
    bean.discrete_stamina -= diff.bean_life.degrade_per_tick.stamina;

    const exposure = BeanMaybeDie(bean, 'exposure', bean.stamina === 'homeless', 0.2);
    if (exposure)
        return exposure;

    bean.discrete_health -= diff.bean_life.degrade_per_tick.health;
    bean.discrete_health = Math.min(bean.discrete_health, 3);
    const sick = BeanMaybeDie(bean, 'sickness', bean.health === 'sick', 0.4);
    if (sick)
        return sick;
    else if (bean.health === 'sick' && wasNotSick){
        emotes.push(...BeanEmote(bean, 'unhappiness', 'Sick'));
        if (BeanBelievesIn(bean, 'Germophobia')){
            emotes.push(...BeanEmote(bean, 'unhappiness', 'Germophobia'));
        }
    }

    bean.discrete_fun -= diff.bean_life.degrade_per_tick.fun;
    bean.discrete_fun = Math.max(0, bean.discrete_fun);

    if (!BeanIsInCrisis(bean))
        bean.graceTicks = MathClamp(bean.graceTicks+1, 0, MaxGraceTicks);
    
    if (emotes.length)
        return {
            emotes: emotes
        };
    else 
        return undefined;
}

export function BeanEmote(bean: IBean, emote: TraitEmote, source: string): IPickup[]{
    bean.discrete_sanity = MathClamp(bean.discrete_sanity + EmotionSanity[emote], 0, 10);
    bean.hedonHistory[0][source] = (bean.hedonHistory[0][source] || 0) + EmotionWorth[emote];
    const out = [
        {
            key: 0, 
            point: {
                ...(MoverStoreInstance.Get('bean', bean.key).current || OriginAccelerator).point
            }, 
            type: emote,
            velocity: {x: 0, y: 0}
        }
    ];
    if (BeanBelievesIn(bean, 'Hedonism') && (emote === 'happiness' || emote === 'love') && Math.random() < HedonismExtraChance){
        out.push(...BeanEmote(bean, 'happiness', 'Hedonism'));
    }
    return out;
}
export function BeanBelievesIn(bean: IBean, trait: TraitBelief): boolean{
    return bean.beliefs.indexOf(trait) !== -1;
}
export function BeanMaybeBaby(bean: IBean, costOfLiving: number): IEvent|undefined{
    if (BeanCanBaby(bean, costOfLiving) &&
        GetRandomRoll(BeanBabyChance(bean))) {
        if (BeanBelievesIn(bean, 'Natalism')){
            BeanEmote(bean, 'love', 'Natalist Parent');
        } else if (BeanBelievesIn(bean, 'Antinatalism')) {
            BeanEmote(bean, 'hate', 'Antinatalism');
        } else {
            BeanEmote(bean, 'happiness', 'Proud Parent');
        }
        return {
            icon: '🎉', trigger: 'birth', message: `${bean.name} has a baby!`,
            key: 0,
        }
    } else {
        return undefined;
    }
}
export function BeanMaybeCrime(bean: IBean, good: TraitGood): boolean {
    if (good === 'shelter') return false;
    if (good === 'fun') return false;
    const roll = Math.random();
    let chance = 0.05;
    if (bean.community === 'ego'){
        chance += .1;
    }
    if (BeanIsInCrisis(bean)){
        chance += .1;
    }
    if (BeanBelievesIn(bean, 'Greed')){
        chance += .25;
    }
    if (BeanBelievesIn(bean, 'Anarchism')){
        chance += .33;
    }
    if (BeanBelievesIn(bean, 'Authority')){
        chance += -.25;
    }
    if (good === 'food' && bean.food === 'starving'){
        chance += .25;
    }
    else if (good === 'medicine' && bean.health === 'sick'){
        chance += .25;
    }
    return chance <= roll;
}
export function BeanMaybeParanoid(bean: IBean) {
    if (BeanBelievesIn(bean, 'Paranoia') && Math.random() < ParanoidUnhappyChance){
        return true;
    }
}

export function BeanMaybeScarcity(bean: IBean, good: TraitGood){
    let scarce = false;
    if (good === 'food' && (bean.food === 'starving' || bean.food === 'hungry'))
        scarce = true;
    else if (good === 'shelter' && (bean.stamina === 'homeless' || bean.stamina === 'sleepy'))
        scarce = true;
    else if (good === 'medicine' && (bean.health === 'sick' || bean.health === 'sickly'))
        scarce = true;
    return scarce;
}
export function BeanCanBaby(bean: IBean, costOfLiving: number): boolean{
    return bean.alive && 
        bean.cash > costOfLiving * 3 &&
        !BeanIsInCrisis(bean);
}
export function BeanBabyChance(bean: IBean): number{
    let base = BabyChance;
    if (BeanBelievesIn(bean, 'Natalism'))
        base += NatalismExtraBabyChance;
    if (BeanBelievesIn(bean, 'Antinatalism'))
        base += AntinatalismExtraBabyChance;
    return base;
}
export function BeanMaybeDie(bean: IBean, cause: string, isDire: boolean, chance: number): {death: IEvent, emotes: IPickup[]}|undefined{
    if (isDire && Math.random() <= chance) {
        if (bean.graceTicks <= 0){
            return BeanDie(bean, cause);
        }
        bean.graceTicks--;
    }
    return undefined;
}
export function BeanDie(bean: IBean, cause: string): {death: IEvent, emotes: IPickup[]}{
    bean.alive = false;
    const pains = GetRandomNumber(2, 3);
    const emotes = (new Array(pains)).map((x) => BeanEmote(bean, 'hate', 'Death')).reduce((all, one) => all.concat(one), []);
    return {
        death: {
            icon: '☠️', trigger: 'death', message: `${bean.name} died of ${cause}!`, 
            beanKey: bean.key, cityKey: bean.cityKey,
            point: (MoverStoreInstance.Get('bean', bean.key).current || OriginAccelerator).point,
            key: 0,
        },
        emotes: emotes
    }
}

export function BeanLoseSanity(bean: IBean, amount: number){
    const multiplier = BeanBelievesIn(bean, 'Neuroticism') ? 2 : 1;
    bean.discrete_sanity -= multiplier * amount;
}

export function BeanGetSpeech(bean: IBean): string|undefined { 
    if (bean.action === 'chat'){
        if (bean.actionData.chat?.participation === 'speaker' && bean.actionData.chat.preachBelief){
            return '💬'+SecondaryBeliefData[bean.actionData.chat.preachBelief].icon;
        }
    }
}

export function BeanIsInCrisis(bean: IBean): boolean{
    return bean.food === 'starving' ||
    bean.stamina === 'homeless' ||
    bean.health === 'sick';
}

export function BeanCanPurchase(bean: IBean, cost: BeanResources, sanityBonus: number){
    return (cost.sanity === undefined || bean.discrete_sanity >= cost.sanity + sanityBonus);
}

export function BeanGetFace(bean: IBean): string{
    // if (!this.alive)
    //     return '💀';
    if (bean.actionData.act === 'buy' && bean.actionData.good === 'shelter'){
        return '😴';
    }
    if (bean.actionData.act === 'crime'){
        return '😈';
    }
    if (bean.actionData.act === 'relax'){
        return '😎';
    }
    if (bean.actionData.act === 'chat'){
        if (bean.actionData.chat?.participation === 'speaker'){
            switch(bean.actionData?.chat?.type){
                default: return '😃';
                case 'gift': return '😇';
                case 'praise': return '🥳';
                case 'bully': return '😈';
            }
        }
        return '🤨';
    }
    if (bean.food === 'starving')
        return '😫';
    if (bean.health === 'sick')
        return '🤢';
    if (bean.stamina === 'homeless')
        return '🥶';
    if (bean.job === 'jobless')
        return '😧';
    if (bean.lastHappiness < 0)
        return '☹️';
    if (bean.lastHappiness >= 50)
        return '🙂';
    return '😐';
}