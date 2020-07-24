import { Bean, City, TraitIdeals, TraitCommunity, TraitEthno, TraitFaith } from './World';

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

export function GenerateCity(previousCityCount: number): City{
    let newCity = new City();
    newCity.key = previousCityCount;
    const cityPopulation = 10;
    while(newCity.beans.length < cityPopulation){
        newCity.beans.push(
            GenerateBean(newCity.key, newCity.beans.length)
        );
    }

    return newCity;
}
export function GenerateBean(cityKey: number, previousBeanCount: number): Bean{
    let newBean = new Bean();
    newBean.key = previousBeanCount;
    newBean.cityKey = cityKey;
    newBean.community = RandomCommunity();
    newBean.ideals = RandomIdeal();
    newBean.faith = RandomFaith();
    
    return newBean;
}