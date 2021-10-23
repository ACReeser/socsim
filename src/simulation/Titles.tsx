
export type TitleHeadwear = '👑'|'👒'|'🎩'|'🎓'|'🧢';
export type TitleBadge = '⭐'|'🛡️'|'⚖️'|'📋'|'🏅'|'🎀'|'🌸';
export type TitlePrivilege = 'social_deference'|'criminal_immunity'|'tax_exemption';
export type PrivilegeData = {
    social_deference: {
        description: ''
    },
    criminal_immunity: {
        description: ''
    }, 
    tax_exemption: {
        description: ''
    }
};

export interface ITitle{
    key: number;
    name: string;
    headwear?: TitleHeadwear;
    badge?: TitleBadge;
    privileges: Array<TitlePrivilege|undefined>;
}