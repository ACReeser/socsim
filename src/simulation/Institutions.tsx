import { ISeller, Economy } from "./Economy";
import { TraitGood, GoodToJob } from "../World";
import { Policy } from "./Politics";
import { Government } from "./Government";

export type EnterpriseType = 'company'|'co-op'|'commune';
export const EnterpriseTypes: EnterpriseType[] = ['company','co-op','commune'];
export const EnterpriseTypeIcon: {[e in EnterpriseType]: string} = {
    'company': '🎩', 
    'co-op': '🤝', 
    'commune': '⚒️'
};

export interface IEnterprise extends ISeller{
    key: number;
    cityKey: number;
    enterpriseType: EnterpriseType;
    ownerBeanKey?: number;
}

export function isEnterprise(b: any): b is IEnterprise{
    return b.key != undefined && b.enterpriseType != undefined;
}

export interface IInstitution{
    key: number;
    playerKey: number;
    name: string;

    organizations: IOrganization[];
}

export interface IOrganization extends ISeller{
    work(law: Government, economy: Economy): void;
    key: number;
    institutionKey: number;
    seasonalBudget: number;
    parentInstitution: IInstitution|null;
    cash: number;
}

export class Charity implements IOrganization, ISeller{
    key = 0;
    name: string = '';
    institutionKey = 1;
    cash = 0;
    ticksSinceLastSale = 0;
    seasonalBudget = 0;
    good: TraitGood = 'food';
    parentInstitution: IInstitution|null = null;
    beansHelped: number = 0;
    inventory: number = 0;
    
    work(law: Government, economy: Economy): void{
        while(this.cash > 0 && this.inventory < 10) {
            const groceries = economy.tryTransact(this, this.good);
            if (groceries){
                //economy.addCharity(this, this.good, groceries.bought);
            } else {
                break;
            }
        }
    }
} 