import { ChangePubSub, LiveList, LiveMap } from "../events/Events";
import { DefaultDifficulty, IDifficulty, PlayerResources } from "../Game";
import { IWorldState } from "../state/features/world";
import { World } from "../World";
import { Number_Starting_City_Pop } from "../WorldGen";
import { IBean } from "./Agent";
import { TraitBelief } from "./Beliefs";
import { IDate } from "./Time";


export interface IPlayerData{
    scanned_bean: {[beanKey: number]: boolean};
    abductedBeans: IBean[];
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
    check: (world: World) => boolean
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
       check: (world) => world.party.name != 'Goodplace'
    },
    build_house_n_farm: {
        key: 'build_house_n_farm', text: 'Build a house and farm',
        check: (world) => {
            return world.cities[0].book.getCountOfType('house') > 0 &&
            world.cities[0].book.getCountOfType('house') > 0;
        },
        reward: {
            energy: 3, bots: 3
        }
    }, 
    beam_3: {
        key: 'beam_3', text: 'Beam in 3 new beings', 
        check: (world) => {
            return world.beans.get.filter(b => !b.bornInPetri).length >= (3 + Number_Starting_City_Pop)
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
export type GradingFunc = (world: World) => IReportCard;
export interface ICurriculum {
    GradeWorld: GradingFunc,
    RubricDescription: {[key in RubricKeys]: string} 
}
export const Curriculums: {[difficulty: string]: ICurriculum} = {
    Default: {
        GradeWorld: (world: World) => {return{
            Happiness: BooleanAverageGrader(world.beans.get, (o) => o.lastHappiness >- .2),
            Prosperity: BooleanAverageGrader(world.beans.get, (o) => o.food !== 'hungry'),
            Stability: BooleanAverageGrader(world.beans.get, (o) => o.sanity === 'sane'),
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

export class Player implements IPlayerData, IProgressable{
    public scanned_bean: {[beanKey: number]: boolean} = {};
    public seenBeliefs = {};
    public lSeenBeliefs = new LiveMap<string, boolean>(new Map<string, boolean>());
    public beliefInventory = [];
    public lBeliefInventory = new LiveList<BeliefInventory>([]);
    public speechcrimes: {[year: number]: number} = {};
    public abductedBeans: IBean[] = [];
    public energy = { amount: 16, income: 2/30, change: new ChangePubSub()};
    public bots = { amount: 10, income: 2/30, change: new ChangePubSub()};
    public hedons = { amount: 0, income: 0, change: new ChangePubSub()};
    public tortrons = { amount: 0, income: 0, change: new ChangePubSub()};
    public next_grade: IDate = { year: 1, season: 3, day: 1, hour: 0 };
    public difficulty: IDifficulty = DefaultDifficulty;
    public goals: GoalKey[] = ['found_utopia', 'build_house_n_farm',  'beam_3', 'scan', 'brainwash', 'set_policy', 'c+_grade'];
    public goalProgress: {[key: string]: IGoalProgress} = {};
    public pastReportCards: IReportCard[] = [];
    public workingReportCard: IReportCard = {
        Happiness: 'D',
        Prosperity: 'D',
        Stability: 'D',
        Dogma: 'D',
    };
    public techProgress: TechProgress = {};
    public currentlyResearchingTech: Tech|undefined;

    public canAfford(cost: PlayerResources, qty: number = 1): boolean{
        return (cost.bots === undefined || this.bots.amount >= cost.bots * qty) &&
        (cost.energy === undefined || this.energy.amount >= cost.energy * qty) && 
        (cost.hedons === undefined || this.hedons.amount >= cost.hedons * qty);
    }

    public hasResearched(tech: Tech){
        return HasResearched(this.techProgress, tech);
    }

    public useCharge(t: TraitBelief){
        const all = this.lBeliefInventory.get;
        const existing = all.find(x => x.trait === t);
        if (existing){
            existing.charges -= 1;
            this.lBeliefInventory.set([...all.filter(x => x.charges > 0)]);
        }
    }

    public purchase(cost: PlayerResources, qty: number = 1){
        if (cost.bots){
            this.bots.amount -= cost.bots * qty;
            this.bots.change.publish({change: -cost.bots * qty});
        }
        if (cost.energy){
            this.energy.amount -= cost.energy * qty;
            this.energy.change.publish({change: -cost.energy * qty});
        }
        if (cost.hedons){
            this.hedons.amount -= cost.hedons * qty;
            this.hedons.change.publish({change: -cost.hedons * qty});
        }
    }

    public tryPurchase(cost: PlayerResources, qty: number = 1): boolean{
        if (this.canAfford(cost, qty)){
            this.purchase(cost, qty);
            return true;
        }
        return false;
    }

    public reward(reward: PlayerResources){
        if (reward.bots){
            this.bots.amount += reward.bots;
            this.bots.change.publish({change: reward.bots});
        }
        if (reward.energy){
            this.energy.amount += reward.energy;
            this.energy.change.publish({change: reward.energy});
        }
        if (reward.hedons){
            this.hedons.amount += reward.hedons;
            this.hedons.change.publish({change: reward.hedons});
        }

    }

    public checkGoals(world: World){
        for (let i = 0; i < this.goals.length; i++) {
            const goal = this.goals[i];
            if (this.goalProgress[goal] == null){
                this.goalProgress[goal] = {done: false, step: 0};
            }
            if (!this.goalProgress[goal].done) {
                const done = Goals[goal].check(world);
                const reward = Goals[goal].reward;
                this.goalProgress[goal].done = done;
                if (done && reward != null){
                    this.reward(reward);
                }
            }
        }
    }
    public checkReportCard(world: World) {
        this.workingReportCard = Curriculums.Default.GradeWorld(world);
    }
}


export function Reward(player: IPlayerData, reward: PlayerResources){
    if (reward.bots){
        player.bots.amount += reward.bots;
        if (player instanceof Player)
            player.bots.change.publish({change: reward.bots});
    }
    if (reward.energy){
        player.energy.amount += reward.energy;
        if (player instanceof Player)
            player.energy.change.publish({change: reward.energy});
    }
    if (reward.hedons){
        player.hedons.amount += reward.hedons;
        if (player instanceof Player)
            player.hedons.change.publish({change: reward.hedons});
    }
}

export function CheckGoals(world: IWorldState, player: IPlayerData){
    for (let i = 0; i < player.goals.length; i++) {
        const goal = player.goals[i];
        if (player.goalProgress[goal] == null){
            player.goalProgress[goal] = {done: false, step: 0};
        }
        if (!player.goalProgress[goal].done) {
            //REDUX TODO
            const done = false; //REDUX TODO Goals[goal].check(world);
            const reward = Goals[goal].reward;
            player.goalProgress[goal].done = done;
            if (done && reward != null){
                Reward(player, reward);
            }
        }
    }
}
export function CheckReportCard(world: IWorldState, player: IPlayerData) {
    //REDUX TODO
    //player.workingReportCard = Curriculums.Default.GradeWorld(world);
}
export function HasResearched(techProgress: TechProgress, tech: Tech){
    return techProgress[tech] != null && techProgress[tech].researchPoints >= TechData[tech].techPoints
}
export function PlayerCanAfford(player: IPlayerData, cost: PlayerResources, qty: number = 1): boolean{
    return (cost.bots === undefined || player.bots.amount >= cost.bots * qty) &&
    (cost.energy === undefined || player.energy.amount >= cost.energy * qty) && 
    (cost.hedons === undefined || player.hedons.amount >= cost.hedons * qty);
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
    }
    if (cost.energy){
        player.energy.amount -= cost.energy * qty;
    }
    if (cost.hedons){
        player.hedons.amount -= cost.hedons * qty;
    }
}