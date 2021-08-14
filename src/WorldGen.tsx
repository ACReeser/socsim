import { IBean } from './simulation/Agent';
import { RandomBeliefBucket } from './simulation/Beliefs';
import { City, ICity } from './simulation/City';
import { Economy } from './simulation/Economy';
import { BuildingTypes, HexPoint, PolarPoint } from './simulation/Geography';
import { IWorldState } from './state/features/world';
import { TraitCommunity, TraitEthno, TraitFaith, TraitIdeals, TraitJob } from './World';
import { WorldSound } from './WorldSound';

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

const CityPrefixes = ['New ', 'Old ', 'Fort ', 'St. ', 'Mount ', 'Grand ', '', '', '', '', '', '', '', '', '', ''];
const CityFirstsnames = ['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Clay', 'Iron', 'Ore', 'Coal', 'Liver', 'Hawk', 'Red', 'Yellow', 'Gold', 'Blue', 'Black', 'White', 'Sunny', 'Reed', 'Ox', 'Mill', 'Fern', 'Down', 'Bel', 'Bald', 'Ash'];
const CityLastnames = ['water ', ' Springs', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', ' Creek', 'land', 'burgh', 'bridge', 'ford', 'bury', 'chester', 'son', 'vale', ' Valley', 'hill', 'more', 'wood', ' Oaks', ' Cove', 'mouth', 'way', 'crest'];
export function GetRandomCityName(){
    return `${GetRandom(CityPrefixes)}${GetRandom(CityFirstsnames)}${GetRandom(CityLastnames)}`;
}
export const Number_Starting_City_Pop = 0;
export function GenerateCity(previousCityCount: number, sfx: WorldSound, econ: Economy): City{
    let newCity = new City(sfx, econ);
    newCity.key = previousCityCount;
    newCity.name = GetRandomCityName();
    
    // GenerateBuilding(newCity, 'courthouse', newCity.hexes[0], newCity.economy); 
    // GenerateBuilding(newCity, 'nature', newCity.hexes[GetRandomNumber(15, 20)], newCity.economy); 
    // GenerateBuilding(newCity, 'nature', newCity.hexes[GetRandomNumber(21, 25)], newCity.economy); 
    // GenerateBuilding(newCity, 'nature', newCity.hexes[GetRandomNumber(26, 60)], newCity.economy);
    // GenerateBuilding(newCity, 'house', newCity.hexes[1]); 
    // GenerateBuilding(newCity, 'hospital', newCity.hexes[5]);
    
    // GenerateBuilding(newCity, 'farm', newCity.hexes[7]);

    // const cityPopulation = Number_Starting_City_Pop;
    // while(newCity.beans.get.length < cityPopulation){
    //     newCity.beans.push(
    //         GenerateBean(newCity)
    //     );
    // }

    return newCity;
}

export function GenerateBean(world: IWorldState, city: ICity, parent?: IBean, hexPoint?: HexPoint, job?: TraitJob): IBean{
    let newBean: IBean = {
        key: world.beans.nextID++,
        cityKey: city.key,
        name: '',
        ethnicity: RandomEthno(),
        community: RandomCommunity(),
        ideals: RandomIdeal(),
        faith: RandomFaith(),
        stamina: 'awake',
        health: 'fresh',
        food: 'sated',
        alive: true,
        discrete_food: 3,
        discrete_health: 2,
        discrete_sanity: 10,
        discrete_stamina: 7,
        discrete_fun: 0,
        graceTicks: 0,
        dob: {year: world.date.year, season: world.date.season, day: world.date.day, hour: world.date.hour},
        sanity: 'sane',
        beliefs: [],
        lifecycle: 'alive',
        hedonHistory: [{}, {}, {}, {}, {}],
        job: 'jobless',
        happiness: { flatAverage: 0,all: {}, maxSource: '', minSource: '', weightedAverage: 0},
        lastHappiness: 0,
        hedonFiveDayRecord: { max: 0, min: 0 },
        fairGoodPrice: 0,
        bornInPetri: parent != null,
        cash: 3,
        ticksSinceLastSale: 0,
        ticksSinceLastRelax: 0,
        lastChatMS: 0,
        action: 'idle',
        actionData: {act: 'idle'},
        activity_duration: {'buy': 0, 'chat': 0, 'craze': 0, 'crime': 0, 'idle': 0, 'relax': 0, 'sleep': 0, 'soapbox': 0, 'travel': 0, 'work': 0},
    };
    // MoverBusInstance.Get('bean', newBean.key).publish({
    //     velocity: {x: 0, y: 0},
    //     point: hex_to_pixel(city.hex_size, city.petriOrigin, hexPoint || {q: 0, r: 0})
    // });
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
    const beanBeliefCount = Math.ceil(Math.random() * MaxNumBeanTraitsOnGenerate);
    while (newBean.beliefs.length < beanBeliefCount) {
        const newBelief = GetRandom(RandomBeliefBucket);
        const hasAlready = newBean.beliefs.includes(newBelief);
        if (!hasAlready)
            newBean.beliefs.push(newBelief);
    }

    if (parent){
        newBean.ethnicity = parent.ethnicity;
        newBean.name = newBean.name.split(' ')[0] + ' ' + parent.name.split(' ')[1];
        newBean.cash = parent.cash / 2;
        parent.cash /= 2;
    }
    
    // if (job == null){
    //     switch (city.beanSeed){
    //         case 1:
    //             job = 'farmer'; break;
    //         case 2:
    //             job = 'builder'; break;
    //         case 3:
    //             job = 'doc'; break;
    //         default:
    //             job = GetRandom(['farmer', 'builder', 'doc', 'entertainer']); break;
    //     }
    // }
    // newBean.trySetJob(job);
    
    return newBean;
}