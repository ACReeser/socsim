import { City, TraitIdeals, TraitCommunity, TraitEthno, TraitFaith, World, Season, TraitJob } from './World';
import { Bean } from './Bean';
import { Policy, BaseParty } from './Politics';

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
    let base = 4 + Math.floor(Math.random() * 3);
    switch(job){
        case 'doc': return base+2;
        default: return base;
    }
}

export function GenerateWorld(): World{
    const world = new World();
    world.party = new BaseParty();
    for (let i = 0; i < 6; i++) {
        world.cities.push(GenerateCity(world.cities.length));
        world.cities[i].doOnCitizenDie.push(world.economy.onBeanDie);
    }

    return world;
}

export function GenerateCity(previousCityCount: number): City{
    let newCity = new City();
    newCity.key = previousCityCount;
    newCity.name = GetRandom(['New ', 'Old ', 'Fort ', 'St. ', '', '', '', '', '', '']);
    newCity.name += GetRandom(['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Iron', 'Ore', 'Liver', 'Hawk', 'Yellow', 'Blue', 'Black', 'White']);
    newCity.name += GetRandom(['water ', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', 'land', 'burgh', 'bridge', 'ford', 'bury']);

    const cityPopulation = 3;
    while(newCity.historicalBeans.length < cityPopulation){
        newCity.historicalBeans.push(
            GenerateBean(newCity, newCity.historicalBeans.length)
        );
    }
    const houseCount = Math.floor((cityPopulation / 2) + Math.floor(Math.random() * cityPopulation / 2));
    for (let i = 0; i < houseCount; i++) {
        newCity.houses.push({
            left: Math.floor(Math.random() * 60),
            top: Math.floor(Math.random() * 60),
        });
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
    const mod = previousBeanCount % 3;
    newBean.job = mod == 0 ? 'farmer' : mod == 1 ? 'builder' : 'doc';
    //newBean.job = GetRandom(['farmer','builder','doc']);
    newBean.cash = StartingCash(newBean.job);
    newBean.discrete_food = 2;
    
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