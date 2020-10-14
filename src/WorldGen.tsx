import { City, TraitIdeals, TraitCommunity, TraitEthno, TraitFaith, World, TraitJob } from './World';
import { Bean } from './Bean';
import { Policy, BaseParty, CityPartyHQ, Party, PolicyByKey, PolicyTree, IPolicy, NoPolicy } from './Politics';
import { Building, BuildingTypes, Geography, PolarPoint, polarToPoint } from './simulation/Geography';

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
const spiral_points: PolarPoint[] = [
    {r: 1, az: 1},
    {r: 110, az: 0},
    {r: 110, az: Math.PI*.333},
    {r: 110, az: Math.PI*.666},
    {r: 110, az: Math.PI},
    {r: 110, az: Math.PI*1.333},
    {r: 110, az: Math.PI*1.666},
    {r: 210, az: Math.PI*1/6},
    {r: 210, az: Math.PI*2/6},
    {r: 210, az: Math.PI*3/6},
    {r: 210, az: Math.PI*4/6},
    {r: 210, az: Math.PI*5/6},
    {r: 210, az: Math.PI*6/6},
    {r: 210, az: Math.PI*7/6},
    {r: 210, az: Math.PI*8/6},
    {r: 210, az: Math.PI*9/6},
    {r: 210, az: Math.PI*10/6},
    {r: 210, az: Math.PI*11/6},
    {r: 210, az: Math.PI*12/6},
    {r: 310, az: 0},
    {r: 310, az: Math.PI*.11},
    {r: 310, az: Math.PI*.22},
    {r: 310, az: Math.PI*.33},
    {r: 310, az: Math.PI*.44},
    {r: 310, az: Math.PI*.55},
    {r: 310, az: Math.PI*.66},
    {r: 310, az: Math.PI*.77},
    {r: 310, az: Math.PI*.88},
    {r: 310, az: Math.PI*.99},
    {r: 310, az: Math.PI*1.10},
    {r: 310, az: Math.PI*1.21},
    {r: 310, az: Math.PI*1.32},
    {r: 310, az: Math.PI*1.43},
    {r: 310, az: Math.PI*1.54},
    {r: 310, az: Math.PI*1.65},
    {r: 310, az: Math.PI*1.76},
    {r: 310, az: Math.PI*1.88},
    {r: 410, az: 0},
    {r: 410, az: Math.PI*8.5*1/100},
    {r: 410, az: Math.PI*8.5*2/100},
    {r: 410, az: Math.PI*8.5*3/100},
    {r: 410, az: Math.PI*8.5*4/100},
    {r: 410, az: Math.PI*8.5*5/100},
    {r: 410, az: Math.PI*8.5*6/100},
    {r: 410, az: Math.PI*8.5*7/100},
    {r: 410, az: Math.PI*8.5*8/100},
    {r: 410, az: Math.PI*8.5*9/100},
    {r: 410, az: Math.PI*8.5*10/100},
    {r: 410, az: Math.PI*8.5*11/100},
    {r: 410, az: Math.PI*8.5*12/100},
    {r: 410, az: Math.PI*8.5*13/100},
    {r: 410, az: Math.PI*8.5*14/100},
    {r: 410, az: Math.PI*8.5*15/100},
    {r: 410, az: Math.PI*8.5*16/100},
    {r: 410, az: Math.PI*8.5*17/100},
    {r: 410, az: Math.PI*8.5*18/100},
    {r: 410, az: Math.PI*8.5*19/100},
    {r: 410, az: Math.PI*8.5*20/100},
    {r: 410, az: Math.PI*8.5*21/100},
    {r: 410, az: Math.PI*8.5*22/100},
    {r: 410, az: Math.PI*8.5*23/100},
    {r: 410, az: Math.PI*9*24/100},
];

export function GenerateBuilding(geo: Geography, type: BuildingTypes, i: number){
    const newBuilding: Building = {
        type: type,
        key: geo.what[type].length
    };
    geo.what[type].push(newBuilding);
    geo.where[type][newBuilding.key] = polarToPoint( 
        spiral_points[i]
        //RandomPolar(GetBuildingR(type))
    );
}

const Number_Starting_Cities = 1;
export function GenerateWorld(): World{
    const world = new World();
 
    GenerateBuilding(world.geo, 'house', 0); 
    GenerateBuilding(world.geo, 'house', 1); GenerateBuilding(world.geo, 'house', 2);
    GenerateBuilding(world.geo, 'house', 3 ); GenerateBuilding(world.geo, 'house', 4); GenerateBuilding(world.geo, 'house', 5);
    for (let i = 6; i < 58; i++) {
        GenerateBuilding(world.geo, 'farm', i);
    }
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
    const mod = previousBeanCount % 3;
    newBean.job = mod == 0 ? 'farmer' : mod == 1 ? 'builder' : 'doc';
    //newBean.job = GetRandom(['farmer','builder','doc']);
    newBean.cash = StartingCash(newBean.job);
    newBean.discrete_food = 2;
    
    return newBean;
}