import { ISeller } from "./Economy";
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
    buildingKey: number;
    enterpriseType: EnterpriseType;
    ownerBeanKey?: number;
}