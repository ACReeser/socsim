import { TraitIdeals, TraitCommunity, TraitEthno, TraitFaith, World, TraitJob } from './World';
import { Bean } from './simulation/Bean';
import { Policy, BaseParty, CityPartyHQ, Party, PolicyByKey, PolicyTree, IPolicy, NoPolicy } from './simulation/Politics';
import { IBuilding, BuildingTypes, Geography, PolarPoint, polarToPoint, hex_to_pixel, HexPoint } from './simulation/Geography';
import { City } from './simulation/City';
import { BeliefsAll } from './simulation/Beliefs';

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
    return GetRandom(['rocket','music','dragon', 'noFaith']);
}
export function StartingCash(job: TraitJob): number{
    let base = 4 + Math.floor(Math.random() * 3);
    switch(job){
        case 'doc': return base+2;
        default: return base;
    }
}
export const MAX_PETRI_RADIUS = 200;
export const PI2 = Math.PI*2;
export function RandomPolar(r?: number): PolarPoint{
    return {
        r: r || GetRandomNumber(0, MAX_PETRI_RADIUS),
        az: GetRandomNumber(0, PI2)
    };
}
export function GetBuildingR(type: BuildingTypes): number{
    switch(type){
        case 'farm':
            return GetRandomNumber(200, 300);
        default: 
            return GetRandomNumber(80, 200);
    }
}
export function GenerateBuilding(geo: Geography, type: BuildingTypes, hex: HexPoint){
    const newBuilding: IBuilding = {
        type: type,
        key: geo.numberOf(type),
        occupied_slots: [],
        empty_slots: []
    };
    geo.addBuilding(hex, newBuilding);
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
        world.cities[i].economy = world.economy;
        world.cities[i].law = world.law;
        for (let j = 0; j < world.cities[i].beans.length; j++) {
            const bean = world.cities[i].beans[j];
            bean.work(world.law, world.economy);
            if (bean.job == 'farmer')
                bean.work(world.law, world.economy);
        }
    }
    world.economy.totalSeasonalDemand.food = world.beans.length;
    world.economy.totalSeasonalDemand.shelter = world.beans.length;
    world.economy.totalSeasonalDemand.medicine = world.beans.length;

    return world;
}

export function GeneratePartyHQ(city: City, party: Party) {
    
}

const Number_Starting_City_Pop = 3;
export function GenerateCity(previousCityCount: number): City{
    let newCity = new City();
    newCity.key = previousCityCount;
    newCity.name = GetRandom(['New ', 'Old ', 'Fort ', 'St. ', 'Mount ', 'Grand ', '', '', '', '', '', '', '', '', '', '']);
    newCity.name += GetRandom(['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Clay', 'Iron', 'Ore', 'Coal', 'Liver', 'Hawk', 'Red', 'Yellow', 'Gold', 'Blue', 'Black', 'White', 'Sunny', 'Reed', 'Ox', 'Mill', 'Fern', 'Down', 'Bel', 'Bald', 'Ash']);
    newCity.name += GetRandom(['water ', ' Springs', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', ' Creek', 'land', 'burgh', 'bridge', 'ford', 'bury', 'chester', 'son', 'vale', ' Valley', 'hill', 'more', 'wood', ' Oaks', ' Cove', 'mouth', 'way', 'crest']);
    
    GenerateBuilding(newCity, 'courthouse', newCity.hexes[0]); 
    GenerateBuilding(newCity, 'house', newCity.hexes[1]); 
    GenerateBuilding(newCity, 'hospital', newCity.hexes[5]);
    
    GenerateBuilding(newCity, 'farm', newCity.hexes[7]);

    const cityPopulation = Number_Starting_City_Pop;
    while(newCity.historicalBeans.length < cityPopulation){
        newCity.historicalBeans.push(
            GenerateBean(newCity, newCity.historicalBeans.length)
        );
    }

    return newCity;
}
export function GenerateBean(city: City, previousBeanCount: number): Bean{
    let newBean = new Bean();
    
    newBean.key = previousBeanCount;
    newBean.cityKey = city.key;
    newBean.city = city;
    newBean.name = GetRandom(['Joe', 'Frank', 'Jill', 'Jose',
    'Johnny', 'Isabelle', 'Carmen', 'Ace', 'Carl', 'Zander', 'Jean',
    'Anne', 'Leslie', 'Ben', 'Ron', 
    'Ellen', 'Dallas', 'Kane', 'Ash', 
    'Jim', 'James', 'Leonard', 'Nyota', 'Christine', 'Scotty', 'Tasha', 'Geordi', 'Beverly', 'Deanna', 'Wesley', 'Majel',
    'Malcolm','River',  
    'Luke', 
    'Dana', 'Walter',  
    'Rick', 
    'Rose', 'Donna', 'Jack', 'Amy', 'Rory', 'Martha', 'Clara', 
    'Arnold', 'Dave', 'Holly', 
    'Kara', 'Gaius','William', 'Lee', 'Laura', 'Saul',
    'Max', 'Edison', 'Theora', 'Bryce', 'Murray', 'Ned',
    'Daniel', 'Samantha', 
    'Logan', 'Francis', 'Jessica'
    ]) + ' ';
    newBean.name += GetRandom([
        'Ripley', 'Bishop', 'Hicks', 'Vasquez', 'Hudson', 
        'Rico', 'Flores', 'Ibanez', 'Levy', 'Jenkins', 'Barlow', 'Zim', 'Rasczak',
        'Kirk', 'McCoy', 'Sulu', 'Uhura', 'Chekov', 'Chapel', 'Rand','Riker', 'Crusher', 'Barret', "O'Brien",
        'Reynolds', 'Tam', 
        'Scully', 'Mulder','Skinner', 
        'Connor', 
        'Thrace', 'Baltar', 'Smith','Adama', 'Roslin', 'Tigh', 'Song', 'Oswald', 
        'Deckard', 
        'Tyler', 'Harkness', 'Jones', 'Noble', 'Pond', 'Williams',
        'Rimmer', 'Lister', 
        'Head', 'Carter', 'Lynch', 'McKenzie', 'Grossberg',
        "O'Neil", 'Jackson', 'Carter'
         ]);
    newBean.community = RandomCommunity();
    newBean.ideals = RandomIdeal();
    newBean.faith = RandomFaith();
    const beanBeliefCount = Math.ceil(Math.random() * 2);
    for (let i = 0; i < beanBeliefCount; i++) {
        newBean.beliefs.push(GetRandom(BeliefsAll));
    }
    const mod = previousBeanCount % 3;
    newBean.job = mod == 0 ? 'farmer' : mod == 1 ? 'builder' : 'doc';
    //newBean.job = GetRandom(['farmer','builder','doc']);
    newBean.cash = StartingCash(newBean.job);
    newBean.discrete_food = 3;

    city.movers.bean[newBean.key] = hex_to_pixel(city.hex_size, city.petriOrigin, city.byType.house.coordByID[GetRandom(city.byType.house.all).key]);
    
    return newBean;
}