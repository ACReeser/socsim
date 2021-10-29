
export type TitleHeadwear = '👑'|'👒'|'🎩'|'🎓'|'🧢';
export type TitleBadge = '⭐'|'🛡️'|'⚖️'|'📋'|'🏅'|'🎀'|'🌸';
export type TitlePrivilege = 'social_deference'|'criminal_immunity'|'tax_exemption'|'hereditary'|'gentility';
export const PrivilegeData = {
    social_deference: {
        description: '🎲 that nearby subjects emit 💢; 🎲 that this subject gains 👍'
    },
    criminal_immunity: {
        description: 'This subject will never be penalized due to crime.'
    }, 
    tax_exemption: {
        description: 'This subject will never pay taxes.'
    }, 
    hereditary: {
        description: 'Children of this subject automatically gain this title.'
    }, 
    gentility: {
        description: 'This subject will not work but will still be paid.'
    }
};

export interface ITitle{
    key: number;
    name: string;
    headwear?: TitleHeadwear;
    badge?: TitleBadge;
    privileges: Array<TitlePrivilege|undefined>;
}