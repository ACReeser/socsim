import { ChangePubSub } from "../events/Events";
import { DefaultDifficulty, IDifficulty, ResourceTriad } from "../Game";
import { World } from "../World";
import { IDate } from "./Time";


export interface IPlayerData{
    scanned_bean: {[beanKey: number]: boolean};
    energy: IResource;
    psi: IResource;
    bots: IResource;
}

export interface IResource{
    amount: number;
    income: number;
    change: ChangePubSub;
}

export type GoalKey = 'found_utopia'|'build_house_n_farm'|'kidnap_3'|'scan'|'set_policy'|'brainwash'|'c+_grade';
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
        }
    }, 
    kidnap_3: {
        key: 'kidnap_3', text: 'Kidnap 3 new beings', 
        check: (world) => false
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

export class Player implements IPlayerData, IProgressable{
    public scanned_bean: {[beanKey: number]: boolean} = {};
    public energy = { amount: 10, income: 2, change: new ChangePubSub()};
    public psi = { amount: 10, income: 2, change: new ChangePubSub()};
    public bots = { amount: 10, income: 2, change: new ChangePubSub()};
    public next_grade:IDate = {year: 1, season: 3, day: 1};
    public difficulty: IDifficulty = DefaultDifficulty;
    public goals: GoalKey[] = ['found_utopia', 'build_house_n_farm', 'scan', 'kidnap_3', 'brainwash', 'set_policy', 'c+_grade'];
    public goalProgress: {[key: string]: IGoalProgress} = {};

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
            if (this.goalProgress[goal] == null || !this.goalProgress[goal].done) {
                const done = Goals[goal].check(world);
                const reward = Goals[goal].reward;
                if (done && reward != null){
                    this.goalProgress[goal].done = true;
                    this.reward(reward);
                }
            }
        }
    }
}