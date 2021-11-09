import { ISeller } from "./Economy";

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