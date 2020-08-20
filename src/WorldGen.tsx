import { City, TraitIdeals, TraitCommunity, TraitEthno, TraitFaith, World, Season, Policy, TraitJob } from './World';
import { Bean } from './Bean';

export function GetRandom<S>(choices: S[]):S {
    const max = choices.length;
    if (max == 1)
        return choices[0];

    return choices[Math.floor(Math.random() * max)];
}
export function RandomIdeal(): TraitIdeals{
    return GetRandom(['prog', 'trad']);
}
export function RandomCommunity(): TraitCommunity{
    return GetRandom(['state', 'ego']);
}
export function RandomEthno(): TraitEthno{
    return GetRandom(['circle','square','triangle']);
}
export function RandomFaith(): TraitFaith{
    return GetRandom(['book','music','heart', 'noFaith']);
}
export function StartingCash(job: TraitJob): number{
    switch(job){
        case 'doc': return 5;
        default: return 3;
    }
}

export function GenerateWorld(): World{
    const world = new World();
    world.party = {
        name: "Worker's Wheat Party",
        activeCampaigns: [],
        availablePolicies: Data.AllPolicies,
        proposedPolicy: undefined,
        availableCampaigns: [],   
        politicalCapital: 10,
        materialCapital: 10
    };
    for (let i = 0; i < 6; i++) {
        world.cities.push(GenerateCity(world.cities.length));
    }

    return world;
}

export function GenerateCity(previousCityCount: number): City{
    let newCity = new City();
    newCity.key = previousCityCount;
    newCity.name = GetRandom(['New ', 'Old ', 'Fort ', 'St. ', '', '', '', '', '', '']);
    newCity.name += GetRandom(['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Iron', 'Ore', 'Liver', 'Hawk', 'Yellow', 'Blue', 'Black', 'White']);
    newCity.name += GetRandom(['water ', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', 'land', 'burgh', 'bridge', 'ford', 'bury']);
    const cityPopulation = 11;
    while(newCity.beans.length < cityPopulation){
        newCity.beans.push(
            GenerateBean(newCity, newCity.beans.length)
        );
    }

    return newCity;
}
export function GenerateBean(city: City, previousBeanCount: number): Bean{
    let newBean = new Bean();
    newBean.key = previousBeanCount;
    newBean.cityKey = city.key;
    newBean.city = city;
    newBean.community = RandomCommunity();
    newBean.ideals = RandomIdeal();
    newBean.faith = RandomFaith();
    newBean.job = GetRandom(['farmer','farmer','builder','builder','doc','jobless']);
    newBean.cash = StartingCash(newBean.job);
    
    return newBean;
}

export class Data {
    static AllPolicies: Policy[] = [
        { key: "Food Welfare", fx:[{key: 'state', mag: 1}, {key: 'prog', mag:1}] },
        { key: "Church Schooling", fx:[{key: 'state', mag:1}, {key:'trad', mag:1}] },
        { key: "Free Trade", fx:[{key: 'ego', mag:1}, {key:'prog', mag:1}], axis: 'trade' },
        { key: "Tariffs", fx:[{key: 'ego', mag:1}, {key:'trad', mag:1}], axis: 'trade' },
        { key: "Secularism", fx:[{key: 'ego', mag:1}, {key:'prog', mag:2}, {key:'trad', mag:-1}], axis: 'faith' },
        { key: "State Religion", fx:[{key: 'state', mag:1}, {key:'trad', mag:2}, {key:'prog', mag:-1}], axis: 'faith' },
        { key: "Univ. Suffrage", fx:[{key:'prog', mag:2}], axis: 'vote' },
        { key: "Male Suffrage", fx:[{key:'trad', mag:2}], axis: 'vote' },
    ];
}