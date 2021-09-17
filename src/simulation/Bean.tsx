import { IEvent } from "../events/Events";
import { BeanResources, IDifficulty } from "../Game";
import { MoverStoreInstance } from "../MoverStoreSingleton";
import { EmotionSanity, EmotionWorth, GoodToThreshold, JobToGood, TraitEmote, TraitFood, TraitGood, TraitHealth, TraitSanity, TraitStamina } from "../World";
import { GetRandom, GetRandomNumber, GetRandomRoll } from "../WorldGen";
import { IBean, IChatData } from "./Agent";
import { SecondaryBeliefData, TraitBelief } from "./Beliefs";
import { GetFairGoodPrice, IEconomy } from "./Economy";
import { OriginAccelerator } from "./Geography";
import { IGovernment } from "./Government";
import { GenerateEmoteFromBean, IPickup } from "./Pickup";
import { MathClamp } from "./Utils";

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

export function BeanMaybePersuaded(bean: IBean, seed: string, belief: TraitBelief, strength: number): boolean{
    if (BeanBelievesIn(bean, 'Dogmatism'))
        return false;

    if (!bean.beliefs.includes(belief)){
        let defense = 10 + GetRandomNumber(seed, 1, 6);
        defense += bean.beliefs.length - PersuasionBeliefTarget;
        let offense = GetRandomNumber(seed, 1, 20) + strength;

        return (offense > defense);
    }
    return false;
}

export function BeanCalculateHealth(bean: IBean, difficulty: IDifficulty): TraitHealth{
    if (bean.discrete_health >= GoodToThreshold['medicine'].abundant)
        bean.health = 'fresh';
    else if (bean.discrete_health >= GoodToThreshold['medicine'].sufficient)
        bean.health =  'bruised'
    else if (bean.discrete_health >= GoodToThreshold['medicine'].warning)
        bean.health =  'sickly'
    else
        bean.health =  'sick';

    return bean.health;
}

export function BeanCalculateShelter(bean: IBean, difficulty: IDifficulty): TraitStamina{
    if (bean.discrete_stamina < 0)
        bean.stamina = 'homeless';
    else
        bean.stamina = 'rested';
    
    return bean.stamina;
}

export function BeanCalculateSanity(bean: IBean, difficulty: IDifficulty): TraitSanity{
    if (bean.discrete_sanity >= 8)
        bean.sanity = 'sane';
    else if (bean.discrete_sanity >= 5)
        bean.sanity =  'stressed'
    else if (bean.discrete_sanity >= 3)
        bean.sanity =  'disturbed'
    else
        bean.sanity =  'psychotic';
    return bean.sanity;
}
export function BeanCalculateFood(bean: IBean, difficulty: IDifficulty): TraitFood{
    if (bean.discrete_food >= GoodToThreshold['food'].abundant)
    bean.food = 'stuffed';
    else if (bean.discrete_food >= GoodToThreshold['food'].sufficient)
    bean.food = 'sated'
    else if (bean.discrete_food >= GoodToThreshold['food'].warning)
    bean.food = 'hungry'
    else
    bean.food = 'starving';

    return bean.food;
}

export function BeanCalculateBeliefs(bean: IBean, econ: IEconomy, difficulty: IDifficulty, law: IGovernment){
    bean.hedonFiveDayRecord = {
        min: Math.min(bean.hedonFiveDayRecord.min, bean.happiness.flatAverage),
        max: Math.max(bean.hedonFiveDayRecord.max, bean.happiness.flatAverage)  
    };
    if (bean.happiness.flatAverage === 0){
        bean.lastHappiness = 0;
    } else {
        bean.lastHappiness = bean.happiness.flatAverage >= 0 ? (
            bean.happiness.flatAverage / Math.abs(bean.hedonFiveDayRecord.max)) * 100 : (
            bean.happiness.flatAverage / Math.abs(bean.hedonFiveDayRecord.min)) * 100;
    }
    
    BeanCalculateFood(bean, difficulty);
    BeanCalculateHealth(bean, difficulty);
    BeanCalculateSanity(bean, difficulty);
    BeanCalculateShelter(bean, difficulty);

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
export function BeanGetRandomChat(bean: IBean, seed: string, findNeedy: () => IBean|undefined): IChatData{
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
            preachBelief: GetRandom(seed, bean.beliefs),
            persuasionStrength: 1 + (BeanBelievesIn(bean, 'Charisma') ? CharismaExtraPersuasionStrength : 0)
        }
    } else {
        return {
            participation: 'speaker',
            type: 'praise'
        }
    }
}

export function BeanAge(bean: IBean, seed: string, diff: IDifficulty): {death?: IEvent, emotes?: IPickup[]}|undefined {
    if (bean.lifecycle != 'alive') return undefined;
    const emotes: IPickup[] = [];

    const wasNotHungry = bean.food !== 'starving';
    const wasNotSick = bean.health !== 'sick';

    bean.discrete_food -= diff.bean_life.degrade_per_tick.food;
    if (bean.discrete_food < 0)
        bean.discrete_health -= diff.bean_life.penalty.starving_health;

    BeanCalculateFood(bean, diff);
    const starve = BeanMaybeDie(bean, seed, 'starvation', bean.food === 'starving', 0.6);
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

    BeanCalculateShelter(bean, diff);
    const exposure = BeanMaybeDie(bean, seed, 'exposure', bean.stamina === 'homeless', 0.2);
    if (exposure)
        return exposure;

    bean.discrete_health -= diff.bean_life.degrade_per_tick.health;
    bean.discrete_health = Math.min(bean.discrete_health, 3);

    BeanCalculateHealth(bean, diff);
    const sick = BeanMaybeDie(bean, seed, 'sickness', bean.health === 'sick', 0.4);
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
        GenerateEmoteFromBean(bean, emote)
    ];
    if (BeanBelievesIn(bean, 'Hedonism') && (emote === 'happiness' || emote === 'love') && Math.random() < HedonismExtraChance){
        out.push(...BeanEmote(bean, 'happiness', 'Hedonism'));
    }
    return out;
}

export function BeanBelievesIn(bean: IBean, trait: TraitBelief): boolean{
    return bean.beliefs.indexOf(trait) !== -1;
}
export function BeanMaybeBaby(bean: IBean, seed: string, costOfLiving: number): IEvent|undefined{
    if (BeanCanBaby(bean, costOfLiving) &&
        GetRandomRoll(seed, BeanBabyChance(bean))) {
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
    return bean.lifecycle === 'alive' && 
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
export function BeanMaybeDie(bean: IBean, seed: string, cause: string, isDire: boolean, chance: number): {death: IEvent, emotes: IPickup[]}|undefined{
    if (isDire && Math.random() <= chance) {
        if (bean.graceTicks <= 0){
            return BeanDie(bean, seed, cause);
        }
        bean.graceTicks--;
    }
    return undefined;
}
export function BeanDie(bean: IBean, seed: string, cause: string): {death: IEvent, emotes: IPickup[]}{
    bean.lifecycle = 'dead';
    const pains = GetRandomNumber(seed, 2, 3);
    const emotes = (new Array(pains)).map(
        x => GenerateEmoteFromBean(bean, 'hate')
    );
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
    if (bean.lifecycle === 'dead')
        return '💀';
    if (bean.actionData.act === 'sleep'){
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
