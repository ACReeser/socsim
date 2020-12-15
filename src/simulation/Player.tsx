import { ChangePubSub } from "../events/Events";
import { DefaultDifficulty, IDifficulty, ResourceTriad } from "../Game";
import { World } from "../World";
import { Number_Starting_City_Pop } from "../WorldGen";
import { IDate } from "./Time";


export interface IPlayerData{
    scanned_bean: {[beanKey: number]: boolean};
    energy: IResource;
    psi: IResource;
    bots: IResource;
    workingReportCard: IReportCard;
}

export interface IResource{
    amount: number;
    income: number;
    change: ChangePubSub;
}

export type GoalKey = 'found_utopia'|'build_house_n_farm'|'beam_3'|'scan'|'set_policy'|'brainwash'|'c+_grade';
export interface IGoal{
    key: GoalKey;
    text: string;
    tooltip?: string;
    reward?: ResourceTriad,
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
            return world.cities[0].byType.house.all.length > 1 &&
            world.cities[0].byType.farm.all.length > 1;
        },
        reward: {
            energy: 3, bots: 3
        }
    }, 
    beam_3: {
        key: 'beam_3', text: 'Beam in 3 new beings', 
        check: (world) => {
            return world.beans.filter(b => !b.bornInPetri).length > (3 + Number_Starting_City_Pop)
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
            Happiness: BooleanAverageGrader(world.beans, (o) => o.lastHappiness >- .2),
            Prosperity: BooleanAverageGrader(world.beans, (o) => o.food != 'hungry'),
            Stability: BooleanAverageGrader(world.beans, (o) => o.sanity == 'sane'),
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

export class Player implements IPlayerData, IProgressable{
    public scanned_bean: {[beanKey: number]: boolean} = {};
    public speechcrimes: {[year: number]: number} = {};
    public energy = { amount: 10, income: 2, change: new ChangePubSub()};
    public psi = { amount: 10, income: 2, change: new ChangePubSub()};
    public bots = { amount: 10, income: 2, change: new ChangePubSub()};
    public next_grade: IDate = { year: 1, season: 3, day: 1 };
    public difficulty: IDifficulty = DefaultDifficulty;
    public goals: GoalKey[] = ['found_utopia', 'build_house_n_farm', 'scan', 'beam_3', 'brainwash', 'set_policy', 'c+_grade'];
    public goalProgress: {[key: string]: IGoalProgress} = {};
    public pastReportCards: IReportCard[] = [];
    public workingReportCard: IReportCard = {
        Happiness: 'D',
        Prosperity: 'D',
        Stability: 'D',
        Dogma: 'D',
    };

    public canAfford(cost: ResourceTriad): boolean{
        return (cost.bots == undefined || this.bots.amount >= cost.bots) &&
        (cost.energy == undefined || this.energy.amount >= cost.energy) && 
        (cost.psi == undefined || this.psi.amount >= cost.psi);
    }

    public purchase(cost: ResourceTriad){
        if (cost.bots){
            this.bots.amount -= cost.bots;
            this.bots.change.publish({change:-cost.bots});
        }
        if (cost.energy){
            this.energy.amount -= cost.energy;
            this.energy.change.publish({change:-cost.energy});
        }
        if (cost.psi){
            this.psi.amount -= cost.psi;
            this.psi.change.publish({change:-cost.psi});
        }
    }

    public tryPurchase(cost: ResourceTriad): boolean{
        if (this.canAfford(cost)){
            this.purchase(cost);
            return true;
        }
        return false;
    }

    public reward(reward: ResourceTriad){
        if (reward.bots){
            this.bots.amount += reward.bots;
            this.bots.change.publish({change: reward.bots});
        }
        if (reward.energy){
            this.energy.amount += reward.energy;
            this.energy.change.publish({change: reward.energy});
        }
        if (reward.psi){
            this.psi.amount += reward.psi;
            this.psi.change.publish({change: reward.psi});
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