import { ISeller, Economy } from "../Economy";
import { TraitGood, GoodToJob } from "../World";
import { Policy } from "../Politics";

export interface IInstitution{
    key: number;
    playerKey: number;
    name: string;

    organizations: IOrganization[];
    fundOrganizations(): void;
}

export interface IOrganization {
    work(law: { policies: Policy[]; }, economy: Economy): void;
    key: number;
    institutionKey: number;
    seasonalBudget: number;
    parentInstitution: IInstitution|null;
    cash: number;
}

export class Charity implements IOrganization, ISeller{
    key = 0;
    institutionKey = 1;
    cash = 0;
    seasonSinceLastSale = 0;
    seasonalBudget = 0;
    good: TraitGood = 'food';
    parentInstitution: IInstitution|null = null;
    
    work(law: { policies: Policy[]; }, economy: Economy): void{
        if (this.cash > 0){
            const bought = economy.tryTransact(this, this.good);
            if (bought){
                
            }
        }
    }
} 