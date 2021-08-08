
export type AgentDurationType = 'bean'|'ufo';
export interface IAgentDuration {elapsed: number, duration: number};
type AgentDurationCache = {
    [key in AgentDurationType]: {
        [k2: number]: {elapsed: number, duration: number};
    };
};

export class AgentDurationStore{
    private cache: AgentDurationCache = {
        'bean': {},
        'ufo': {}
    }
    public Get(type: AgentDurationType, key: number): IAgentDuration{
        if (!this.cache[type][key])
            this.cache[type][key] = {elapsed: 0, duration: 0};
        return this.cache[type][key];
    }
}