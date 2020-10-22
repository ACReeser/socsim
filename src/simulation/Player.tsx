

export interface IPlayerData{
    scanned_bean: {[beanKey: number]: boolean};
    energy: IResource;
    psi: IResource;
    bots: IResource;
}

export interface IResource{
    amount: number;
    income: number;
}

export class Player implements IPlayerData{
    public scanned_bean: {[beanKey: number]: boolean} = {};
    public energy = { amount: 10, income: 2};
    public psi = { amount: 10, income: 2};
    public bots = { amount: 10, income: 2};
}