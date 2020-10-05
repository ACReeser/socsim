

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

export class Player{

}