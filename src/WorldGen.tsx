import { City, TraitIdeals, TraitCommunity, TraitEthno, TraitFaith, World, TraitJob } from './World';
import { Bean } from './Bean';
import { Policy, BaseParty, CityPartyHQ, Party, PolicyByKey, PolicyTree, IPolicy, NoPolicy } from './Politics';

export function GetRandomNumber(min: number, max: number): number{
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = randomBuffer[0] / (0xffffffff + 1);
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(randomNumber * (max - min + 1)) + min;
}
export function GetRandomIndex(length: number): number{
    return GetRandomNumber(0, length-1)
}
export function GetRandom<S>(choices: S[]):S {
    const max = choices.length;
    if (max == 1)
        return choices[0];

    const i = GetRandomIndex(choices.length);
    console.log(i);
    return choices[i];
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

const Number_Starting_Cities = 1;
export function GenerateWorld(): World{
    const world = new World();
    world.law.policyTree = {
        wel_food: PolicyByKey('0') as IPolicy,
        wel_house: PolicyByKey('4') as IPolicy,
        wel_health: PolicyByKey('8') as IPolicy,
        econ_ex: PolicyByKey('13') as IPolicy,
        econ_labor: PolicyByKey('15') as IPolicy,
        econ_sub: NoPolicy,
        cul_rel: PolicyByKey('21') as IPolicy,
        cul_theo: NoPolicy,
        cul_ed: NoPolicy,
        law_vote: PolicyByKey('31') as IPolicy,
        law_bribe: PolicyByKey('32') as IPolicy,
        law_imm: PolicyByKey('35') as IPolicy,
        tax_basic: PolicyByKey('38') as IPolicy,
        tax_second: NoPolicy,
        all: NoPolicy
    };
    world.party = new BaseParty();
    world.institutions.push(world.party);
    for (let i = 0; i < Number_Starting_Cities; i++) {
        world.cities.push(GenerateCity(world.cities.length));
        world.cities[i].doOnCitizenDie.push(world.economy.onBeanDie);
        world.cities[i].environment = world.date;

        if (i < 2){
            const city = world.cities[i];
            //GeneratePartyHQ(city);
        }
    }
    world.economy.totalSeasonalDemand.food = world.beans.length;
    world.economy.totalSeasonalDemand.shelter = world.beans.length;
    world.economy.totalSeasonalDemand.medicine = world.beans.length;

    world.next();
    world.next();
    world.next();
    world.next();
    return world;
}

export function GeneratePartyHQ(city: City, party: Party) {
    const hq = new CityPartyHQ();
    hq.cityKey = city.key;
    city.partyHQ = hq;
    party.activeHQs.push(hq.cityKey);
}

const Number_Starting_City_Pop = 10;
export function GenerateCity(previousCityCount: number): City{
    let newCity = new City();
    newCity.key = previousCityCount;
    newCity.name = GetRandom(['New ', 'Old ', 'Fort ', 'St. ', 'Mount ', 'Grand ', '', '', '', '', '', '', '', '', '', '']);
    newCity.name += GetRandom(['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Clay', 'Iron', 'Ore', 'Coal', 'Liver', 'Hawk', 'Red', 'Yellow', 'Gold', 'Blue', 'Black', 'White', 'Sunny', 'Reed', 'Ox', 'Mill', 'Fern', 'Down', 'Bel', 'Bald', 'Ash']);
    newCity.name += GetRandom(['water ', ' Springs', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', ' Creek', 'land', 'burgh', 'bridge', 'ford', 'bury', 'chester', 'son', 'vale', ' Valley', 'hill', 'more', 'wood', ' Oaks', ' Cove', 'mouth', 'way', 'crest']);

    const cityPopulation = Number_Starting_City_Pop;
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
    newBean.name = GetRandom(['Chick', 'Broad', 'Velvet', 'Jack', 'Lima', 'Whit', 'Black-Eye', 'Baker', 'Pony', 'Castor', 'Frenchy', 'Kid', 'Runner']) + ' ';
    newBean.name += GetRandom(['Bean', 'Navy', 'Sprout', 'Soy', 'Mung', 'Lent', 'Faba', 'Wax', 'Chick', 'Green', 'Pinto']);
    newBean.name += GetRandom(['shell', 'seed', 'pea', 'pod', 'snap', 'vine', 'leaf', 'shoot']);
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