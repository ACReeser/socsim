import { TraitIdeals, TraitCommunity, TraitEthno, TraitFaith, World, TraitJob } from './World';
import { Bean } from './simulation/Bean';
import { Policy, BaseParty, CityPartyHQ, Party } from './simulation/Politics';
import { IBuilding, BuildingTypes, Geography, PolarPoint, polarToPoint, hex_to_pixel, HexPoint, BuildingToGood } from './simulation/Geography';
import { City } from './simulation/City';
import { BeliefsAll, RandomBeliefBucket } from './simulation/Beliefs';
import { WorldSound } from './WorldSound';
import { Building } from './simulation/RealEstate';
import { Economy } from './simulation/Economy';

const EnterpriseStartingListing = 1;
const MaxNumBeanTraitsOnGenerate = 3;

/**
 * return better random values
 * @param min 
 * @param max 
 * @returns 
 */
export function GetRandomNumber(min: number, max: number): number{
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = randomBuffer[0] / (0xffffffff + 1);
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(randomNumber * (max - min + 1)) + min;
}

/**
 * 
 * @returns float between 0 and 1
 */
export function GetRandomFloat(): number{
    //https://stackoverflow.com/questions/34575635/cryptographically-secure-float
    // A buffer with just the right size to convert to Float64
    let buffer = new ArrayBuffer(8);

    // View it as an Int8Array and fill it with 8 random ints
    let ints = new Int8Array(buffer);
    window.crypto.getRandomValues(ints);

    // Set the sign (ints[7][7]) to 0 and the
    // exponent (ints[7][6]-[6][5]) to just the right size 
    // (all ones except for the highest bit)
    ints[7] = 63;
    ints[6] |= 0xf0;

    // Now view it as a Float64Array, and read the one float from it
    return new DataView(buffer).getFloat64(0, true) - 1; 
}

/**
 * given a chance (0-1) return true if random float is <= chance
 * @param chance 
 * @returns 
 */
export function GetRandomRoll(chance: number): boolean{
    const randomNumber = GetRandomFloat();
    //console.log(`DC ${(chance*100).toFixed(3)} rolled ${(randomNumber*100).toFixed(4)}`);
    return randomNumber <= chance;
}

/**
 * convenience random function
 * @param length 
 * @returns 
 */
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
export function GenerateBuilding(geo: Geography, type: BuildingTypes, hex: HexPoint, econ: Economy){
    const newBuilding = new Building();
    newBuilding.type = type;
    newBuilding.key = geo.book.getBuildings().length;
    newBuilding.address = hex;
    if (geo instanceof City)
        newBuilding.city = geo;
    geo.addBuilding(newBuilding);
    const good = BuildingToGood[type];
    if (good != 'fun')
        econ.employAndPrice(newBuilding, good, EnterpriseStartingListing, econ.getFairGoodPrice(good))
}

const Number_Starting_Cities = 1;
export function GenerateWorld(): World{
    const world = new World();
 
    world.law.laws = [];
    world.party = new BaseParty();
    world.institutions.push(world.party);
    for (let i = 0; i < Number_Starting_Cities; i++) {
        world.cities.push(GenerateCity(world.cities.length, world.sfx, world.economy));
        world.cities[i].eventBus = world.bus;
        world.cities[i].environment = world.date;
        world.cities[i].law = world.law;
        for (let j = 0; j < world.cities[i].beans.get.length; j++) {
            const bean = world.cities[i].beans.get[j];
            bean.work(world.law, world.economy);
            if (bean.job == 'farmer')
                bean.work(world.law, world.economy);
        }
    }
    world.economy.monthlyDemand.food = world.beans.get.length;
    world.economy.monthlyDemand.shelter = world.beans.get.length;
    world.economy.monthlyDemand.medicine = world.beans.get.length;

    return world;
}

export function GeneratePartyHQ(city: City, party: Party) {
    
}

export const Number_Starting_City_Pop = 0;
export function GenerateCity(previousCityCount: number, sfx: WorldSound, econ: Economy): City{
    let newCity = new City(sfx, econ);
    newCity.key = previousCityCount;
    newCity.name = GetRandom(['New ', 'Old ', 'Fort ', 'St. ', 'Mount ', 'Grand ', '', '', '', '', '', '', '', '', '', '']);
    newCity.name += GetRandom(['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Clay', 'Iron', 'Ore', 'Coal', 'Liver', 'Hawk', 'Red', 'Yellow', 'Gold', 'Blue', 'Black', 'White', 'Sunny', 'Reed', 'Ox', 'Mill', 'Fern', 'Down', 'Bel', 'Bald', 'Ash']);
    newCity.name += GetRandom(['water ', ' Springs', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', ' Creek', 'land', 'burgh', 'bridge', 'ford', 'bury', 'chester', 'son', 'vale', ' Valley', 'hill', 'more', 'wood', ' Oaks', ' Cove', 'mouth', 'way', 'crest']);
    
    GenerateBuilding(newCity, 'courthouse', newCity.hexes[0], newCity.economy); 
    GenerateBuilding(newCity, 'nature', newCity.hexes[GetRandomNumber(15, 20)], newCity.economy); 
    GenerateBuilding(newCity, 'nature', newCity.hexes[GetRandomNumber(21, 25)], newCity.economy); 
    GenerateBuilding(newCity, 'nature', newCity.hexes[GetRandomNumber(26, 60)], newCity.economy);
    // GenerateBuilding(newCity, 'house', newCity.hexes[1]); 
    // GenerateBuilding(newCity, 'hospital', newCity.hexes[5]);
    
    // GenerateBuilding(newCity, 'farm', newCity.hexes[7]);

    const cityPopulation = Number_Starting_City_Pop;
    while(newCity.beans.get.length < cityPopulation){
        newCity.beans.push(
            GenerateBean(newCity)
        );
    }

    return newCity;
}
function getStartingPoint(city: City): HexPoint{
    const house = city.book.getRandomBuildingOfType('house');
    if (house){
        return house.address;
    } else {
        return {
            q: 0, r: 0
        }
    }
}
export function GenerateBean(city: City, hexPoint?: HexPoint, job?: TraitJob): Bean{
    let newBean = new Bean();
    
    newBean.key = ++city.beanSeed;
    newBean.cityKey = city.key;
    newBean.city = city;
    newBean.name = GetRandom(['Joe', 'Frank', 'Jill', 'Jose',
    'Johnny', 'Isabelle', 'Carmen', 'Ace', 'Carl', 'Zander', 'Jean',
    'Anne', 'Leslie', 'Ben', 'Ron', 
    'Ellen', 'Dallas', 'Kane', 'Ash', 
    'Jim', 'James', 'Leonard', 'Nyota', 'Christine', 'Scotty', 'Tasha', 'Geordi', 'Beverly', 'Deanna', 'Wesley', 'Majel',
    'Malcolm','River',  
    'Luke', 'Han', 'Owen', 'Rey', 'Mace', 'Cody',
    'Dana', 'Walter',  
    'Rick', 'Holden', 'Roy', 'Pris', 'Eldon', 'Rachael',
    'Rose', 'Donna', 'Jack', 'Amy', 'Rory', 'Martha', 'Clara', 
    'Arnold', 'Dave', 'Holly', 
    'Kara', 'Gaius','William', 'Lee', 'Laura', 'Saul',
    'Max', 'Edison', 'Theora', 'Bryce', 'Murray', 'Ned',
    'Daniel', 'Samantha', 
    'Logan', 'Francis', 'Jessica',
    'Thomas',
    'Benny', 'James', 'John Henry', 'Sarah', 'Piper', 'Nick', 'Shaun', 'Preston'
    ]) + ' ';
    newBean.name += GetRandom([
        'Ripley', 'Bishop', 'Hicks', 'Vasquez', 'Hudson', 
        'Rico', 'Flores', 'Ibanez', 'Levy', 'Jenkins', 'Barlow', 'Zim', 'Rasczak',
        'Kirk', 'McCoy', 'Sulu', 'Uhura', 'Chekov', 'Chapel', 'Rand','Riker', 'Crusher', 'Barret', "O'Brien",
        'Reynolds', 'Tam', 
        'Scully', 'Mulder','Skinner', 
        'Connor', 
        'Rex',
        'Thrace', 'Baltar', 'Smith','Adama', 'Roslin', 'Tigh', 'Song', 'Oswald', 
        'Deckard', 'Bryant', 'Tyrell', 'Sebastian', 'Voight', 'Kampff',
        'Tyler', 'Harkness', 'Jones', 'Noble', 'Pond', 'Williams',
        'Rimmer', 'Lister', 
        'Head', 'Carter', 'Lynch', 'McKenzie', 'Grossberg',
        "O'Neil", 'Jackson', 'Carter',
        'Whitmore',
        'House', 'Mitchell', 'Eden', 'Lyons', 'Valentine', 'Garvey'
         ]);
    newBean.community = RandomCommunity();
    newBean.ideals = RandomIdeal();
    newBean.faith = RandomFaith();
    const beanBeliefCount = Math.ceil(Math.random() * MaxNumBeanTraitsOnGenerate);
    while (newBean.beliefs.length < beanBeliefCount) {
        const newBelief = GetRandom(RandomBeliefBucket);
        const hasAlready = newBean.beliefs.includes(newBelief);
        if (!hasAlready)
            newBean.beliefs.push(newBelief);
    }
    
    if (job == null){
        switch (city.beanSeed){
            case 1:
                job = 'farmer'; break;
            case 2:
                job = 'builder'; break;
            case 3:
                job = 'doc'; break;
            default:
                job = GetRandom(['farmer', 'builder', 'doc', 'entertainer']); break;
        }
    }
    newBean.trySetJob(job);

    newBean.cash = StartingCash(newBean.job);
    newBean.discrete_food = 3;

    newBean.point = hex_to_pixel(city.hex_size, city.petriOrigin, hexPoint || getStartingPoint(city));
    
    return newBean;
}