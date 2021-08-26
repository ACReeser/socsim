import { LiveList, LiveMap } from "../events/Events";
import { DefaultDifficulty, IDifficulty, PlayerResources } from "../Game";
import { SignalStoreInstance } from "../SignalStore";
import { IWorldState } from "../state/features/world";
import { Number_Starting_City_Pop } from "../WorldGen";
import { IBean } from "./Agent";
import { TraitBelief } from "./Beliefs";
import { IDate } from "./Time";


export interface IPlayerData{
    scanned_bean: {[beanKey: number]: boolean};
    abductedBeanKeys: number[];
    seenBeliefs: {[key: string]: boolean};
    speechcrimes: {[year: number]: number};
    next_grade: IDate;
    pastReportCards: IReportCard[];
    energy: IResource;
    bots: IResource;
    hedons: IResource;
    workingReportCard: IReportCard;
    techProgress: TechProgress;
    currentlyResearchingTech: Tech|undefined;
    difficulty: IDifficulty;
    beliefInventory: BeliefInventory[];
    goalProgress: {[key: string]: IGoalProgress};
    goals: GoalKey[]
}

export interface IResource{
    amount: number;
    income: number;
}

export type GoalKey = 'found_utopia'|'build_house_n_farm'|'beam_3'|'scan'|'set_policy'|'brainwash'|'c+_grade';
export interface IGoal{
    key: GoalKey;
    text: string;
    tooltip?: string;
    reward?: PlayerResources,
    check: (world: IWorldState) => boolean
}
export interface IGoalProgress {
    done: boolean,
    step: number
}
export interface IProgressable{
    goalProgress: {[key: string]: IGoalProgress},
    goals: Array<GoalKey>
}
export const Goals: {[key in GoalKey]: IGoal} = {
    found_utopia: {
        key: 'found_utopia', text: 'Found your Utopia',
       check: (world) => world.buildings.allIDs.length > 0
    },
    build_house_n_farm: {
        key: 'build_house_n_farm', text: 'Build a house and farm',
        check: (world) => {
            return world.buildings.allIDs.find(k => world.buildings.byID[k].type == 'farm') != null &&
            world.buildings.allIDs.find(k => world.buildings.byID[k].type == 'house') != null;
        },
        reward: {
            energy: 3, bots: 3
        }
    }, 
    beam_3: {
        key: 'beam_3', text: 'Beam in 3 new beings', 
        check: (world) => {
            return world.beans.allIDs.filter(k => !world.beans.byID[k].bornInPetri).length >= (3 + Number_Starting_City_Pop)
        }
    }, 
    scan: {
        key: 'scan', text: 'Scan a Subject',
        check: (world) => Object.keys(world.alien.scanned_bean).length > 0
    }, 
    set_policy: {
        key: 'set_policy', text: 'Set a Gov Policy',
        check: (world) => false
    }, 
    brainwash: {
        key: 'brainwash', text: 'Brainwash a Subject',
        check: (world) => false
    }, 
    'c+_grade': {
        key: 'c+_grade', text: 'Receive a C+ Grade',
        check: (world) => false
    } 
};

export type Grade = 'F'|'D'|'C'|'B'|'A';
export type RubricKeys = 'Happiness'|'Prosperity'|'Stability'|'Dogma';
export type IReportCard = {[key in RubricKeys]: Grade}
export type GradingFunc = (world: IWorldState) => IReportCard;
export interface ICurriculum {
    GradeWorld: GradingFunc,
    RubricDescription: {[key in RubricKeys]: string} 
}
export const Curriculums: {[difficulty: string]: ICurriculum} = {
    Default: {
        GradeWorld: (world: IWorldState) => {return{
            Happiness: BooleanAverageGrader(world.beans.allIDs.map(x => world.beans.byID[x]), (o) => o.lastHappiness >- .2),
            Prosperity: BooleanAverageGrader(world.beans.allIDs.map(x => world.beans.byID[x]), (o) => o.food !== 'hungry'),
            Stability: BooleanAverageGrader(world.beans.allIDs.map(x => world.beans.byID[x]), (o) => o.sanity === 'sane'),
            Dogma: GradeUpToNumber((world.alien.speechcrimes[world.date.year] || 0), 10, 10),
        }},
        RubricDescription: {
            Happiness: 'Subjects are at least 20% happy',
            Prosperity: 'Subjects are not hungry',
            Stability: 'Subjects are all sane',
            Dogma: 'Up to 10 Speechcrimes'
        }
    }
}
/**
 * 
 * @param number number of bad events
 * @param allowance number of allowed events
 * @param maximum range of "overflow" events
 */
function GradeUpToNumber(number: number, allowance: number, maximum: number): Grade{
    const normalized = 1 - Math.min(1, Math.max(0, number - allowance) / maximum);
    return NormalizedScoreToGrade(normalized);
}
function BooleanAverageGrader<T>(array: T[], grade: (o: T) => boolean): Grade{
    if (array.length < 1) return 'F';
    return NormalizedScoreToGrade(array.filter(grade).length / array.length);
}
function NormalizedScoreToGrade(normNumber: number): Grade{
    if (normNumber < .58) return 'F';
    if (normNumber < .68) return 'D';
    if (normNumber < .78) return 'C';
    if (normNumber < .88) return 'B';
    return 'A';
}
const GradeWeights: {[key in Grade]: number} ={
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    F: 1
}
export function GetAverage(reportCard: IReportCard): Grade{
    return NormalizedScoreToGrade((GradeWeights[reportCard.Happiness] + 
        GradeWeights[reportCard.Prosperity] + 
        GradeWeights[reportCard.Stability] +
        GradeWeights[reportCard.Dogma] 
    ) / 20);
}

export type Tech = 'sanity_bonus'|'fast_resources'|'trauma_nanobots'|'neural_duplicator';
export interface ITechInfo{
    tech: Tech,
    /**
     * number of tech points required to complete research
     */
    techPoints: number,
    name: string,
    description: string
}
export const TechData: {[key in Tech]: ITechInfo} = {
    'sanity_bonus': {
        tech: 'sanity_bonus',
        name: 'Surgical Psychops',
        techPoints: 30,
        description: 'Brainwashing causes -1 🧠 Sanity damage'
    },
    'fast_resources': {
        tech: 'fast_resources',
        name: '0 Dimensional Supersiphons',
        techPoints: 30,
        description: 'Faster ⚡️ and 🤖 accumulation'
    },
    'trauma_nanobots': {
        tech: 'trauma_nanobots',
        name: 'Trauma Nanobots',
        techPoints: 30,
        description: 'Spend 🤖 to stop Subject from dying'
    },
    'neural_duplicator': {
        tech: 'neural_duplicator',
        name: 'Level 2 Neural Duplication',
        techPoints: 30,
        description: 'Copy 🧠 Traits 1 additional time'
    }
}
export interface IPlayerTechProgress{
    /**
     * number of research points
     */
    researchPoints: number
}
export type TechProgress = {[key: string]: IPlayerTechProgress};
export interface BeliefInventory{
    trait: TraitBelief,
    charges: number
}

export function PlayerReward(player: IPlayerData, reward: PlayerResources){
    if (reward.bots){
        player.bots.amount += reward.bots;
        SignalStoreInstance.alienBots.publish({change: reward.bots});
    }
    if (reward.energy){
        player.energy.amount += reward.energy;
        SignalStoreInstance.alienEnergy.publish({change: reward.energy});
    }
    if (reward.hedons){
        player.hedons.amount += reward.hedons;
        SignalStoreInstance.alienHedons.publish({change: reward.hedons});
    }
}

export function CheckGoals(world: IWorldState, player: IPlayerData){
    for (let i = 0; i < player.goals.length; i++) {
        const goal = player.goals[i];
        if (player.goalProgress[goal] == null){
            player.goalProgress[goal] = {done: false, step: 0};
        }
        if (!player.goalProgress[goal].done) {
            const done = Goals[goal].check(world);
            const reward = Goals[goal].reward;
            player.goalProgress[goal].done = done;
            if (done && reward != null){
                PlayerReward(player, reward);
            }
        }
    }
}
export function CheckReportCard(world: IWorldState, player: IPlayerData) {
    player.workingReportCard = Curriculums.Default.GradeWorld(world);
}
export function HasResearched(techProgress: TechProgress, tech: Tech){
    return techProgress[tech] != null && techProgress[tech].researchPoints >= TechData[tech].techPoints
}
export function PlayerCanAfford(player: IPlayerData, cost: PlayerResources, qty: number = 1): boolean{
    return (cost.bots === undefined || player.bots.amount >= cost.bots * qty) &&
    (cost.energy === undefined || player.energy.amount >= cost.energy * qty) && 
    (cost.hedons === undefined || player.hedons.amount >= cost.hedons * qty);
}
export function PlayerUseCharge(alien: IPlayerData, t: TraitBelief){
    const all = alien.beliefInventory;
    const existing = all.find(x => x.trait === t);
    if (existing){
        existing.charges -= 1;
        alien.beliefInventory = [...all.filter(x => x.charges > 0)];
    }
}
export function PlayerTryPurchase(player: IPlayerData, cost: PlayerResources, qty: number = 1): boolean{
    if (PlayerCanAfford(player, cost, qty)){
        PlayerPurchase(player, cost, qty);
        return true;
    }
    return false;
}
export function PlayerPurchase(player: IPlayerData, cost: PlayerResources, qty: number = 1): void{
    if (cost.bots){
        player.bots.amount -= cost.bots * qty;
        SignalStoreInstance.alienBots.publish({change: -cost.bots * qty});
    }
    if (cost.energy){
        player.energy.amount -= cost.energy * qty;
        SignalStoreInstance.alienEnergy.publish({change: -cost.energy * qty});
    }
    if (cost.hedons){
        player.hedons.amount -= cost.hedons * qty;
        SignalStoreInstance.alienHedons.publish({change: -cost.hedons * qty});
    }
}