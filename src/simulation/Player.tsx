import { ChangePubSub } from "../events/Events";
import { DefaultDifficulty, IDifficulty, ResourceTriad } from "../Game";
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

export class Player implements IPlayerData{
    public scanned_bean: {[beanKey: number]: boolean} = {};
    public energy = { amount: 10, income: 2, change: new ChangePubSub()};
    public psi = { amount: 10, income: 2, change: new ChangePubSub()};
    public bots = { amount: 10, income: 2, change: new ChangePubSub()};
    public next_grade:IDate = {year: 1, season: 3, day: 1};
    public difficulty: IDifficulty = DefaultDifficulty;

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
}