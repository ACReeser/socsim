import { ChangePubSub } from "../events/Events";
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
}