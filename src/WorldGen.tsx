import { IBean } from './simulation/Agent';
import { RandomBeliefBucket } from './simulation/Beliefs';
import { ICity } from './simulation/City';
import { BuildingTypes, GenerateGeography, HexPoint, hex_to_pixel, IDistrict, ILot, LotHexSizePX, PolarPoint } from './simulation/Geography';
import { IDate } from './simulation/Time';
import { IWorldState } from './state/features/world';
import { TraitCommunity, TraitEthno, TraitFaith, TraitIdeals, TraitJob } from './World';
import Rand, {PRNG} from 'rand-seed';
import { CreateEntitySlice, EntityAddToSlice, IEntitySlice } from './state/entity.state';

const EnterpriseStartingListing = 1;
const MaxNumBeanTraitsOnGenerate = 3;
const RandomSeeds: {[seed: string]: Rand} = {};

export function GetRandomGenerator(seed: string){
    if (RandomSeeds[seed] == null)
        RandomSeeds[seed] = new Rand(seed, PRNG.sfc32);
    return RandomSeeds[seed];
}

/**
 * return better random values
 * @param min 
 * @param max 
 * @returns 
 */
export function GetRandomNumber(seed: string, min: number = 0, max: number = 1): number{
    const randomNumber = GetRandomGenerator(seed).next();
    // const randomNumber = window.crypto.getRandomValues()[0] / (0xffffffff + 1);
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(randomNumber * (max - min + 1)) + min;
}

/**
 * 
 * @returns float between 0 and 1
 */
export function GetRandomFloat(seed: string): number{
    return GetRandomGenerator(seed).next();
}

/**
 * given a chance (0-1) return true if random float is <= chance
 * @param chance 
 * @returns 
 */
export function GetRandomRoll(seed: string, chance: number): boolean{
    const randomNumber = GetRandomFloat(seed);
    //console.log(`DC ${(chance*100).toFixed(3)} rolled ${(randomNumber*100).toFixed(4)}`);
    return randomNumber <= chance;
}

/**
 * convenience random function
 * @param length 
 * @returns 
 */
export function GetRandomIndex(seed: string, length: number): number{
    return GetRandomNumber(seed, 0, length-1)
}

export function GetRandom<S>(seed: string, choices: S[]):S {
    const max = choices.length;
    if (max == 1)
        return choices[0];

    const i = GetRandomIndex(seed, choices.length);
    return choices[i];
}
export function RandomIdeal(seed: string): TraitIdeals{
    return GetRandom(seed, ['prog', 'trad']);
}
export function RandomCommunity(seed: string): TraitCommunity{
    return GetRandom(seed, ['state', 'ego']);
}
export function RandomEthno(seed: string): TraitEthno{
    return GetRandom(seed, ['circle','square','triangle']);
}
export function RandomFaith(seed: string): TraitFaith{
    return GetRandom(seed, ['rocket','music','dragon', 'noFaith']);
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
export function RandomPolar(seed: string, r?: number): PolarPoint{
    return {
        r: r || GetRandomNumber(seed, 0, MAX_PETRI_RADIUS),
        az: GetRandomNumber(seed, 0, PI2)
    };
}
export function GetBuildingR(seed: string, type: BuildingTypes): number{
    switch(type){
        case 'farm':
            return GetRandomNumber(seed, 200, 300);
        default: 
            return GetRandomNumber(seed, 80, 200);
    }
}

const CityPrefixes = ['New ', 'Old ', 'Fort ', 'St. ', 'Mount ', 'Grand ', '', '', '', '', '', '', '', '', '', ''];
const CityFirstsnames = ['Spring', 'Timber', 'Over', 'West', 'East', 'North', 'South', 'Rock', 'Sand', 'Clay', 'Iron', 'Ore', 'Coal', 'Liver', 'Hawk', 'Red', 'Yellow', 'Gold', 'Blue', 'Black', 'White', 'Sunny', 'Reed', 'Ox', 'Mill', 'Fern', 'Down', 'Bel', 'Bald', 'Ash'];
const CityLastnames = ['water ', ' Springs', 'ville', 'dale', 'lane', 'peak', 'coast', 'beach', 'port', 'market', 'ton', 'brook', ' Creek', 'land', 'burgh', 'bridge', 'ford', 'bury', 'chester', 'son', 'vale', ' Valley', 'hill', 'more', 'wood', ' Oaks', ' Cove', 'mouth', 'way', 'crest'];
export function GetRandomCityName(seed: string){
    return `${GetRandom(seed, CityPrefixes)}${GetRandom(seed, CityFirstsnames)}${GetRandom(seed, CityLastnames)}`;
}
export const Number_Starting_City_Pop = 0;

export function GenerateCity(): ICity{
    return {
        ...GenerateGeography(),
        key: 0,
        name: 'string',
        deadBeanKeys: [],
        beanKeys: [],
        ufoKeys: [],
        pickupKeys: [],
        buildingKeys: [],
        pickupMagnetPoint: undefined,
        costOfLiving: 0,
        buildingMap: {},
        districtKeys: []
      }
}
export function GenerateDistrictsAndLots(city: ICity): {ds:IEntitySlice<IDistrict>,lots:IEntitySlice<ILot>}{
    const lots = CreateEntitySlice<ILot>([]);
    const ds = CreateEntitySlice<IDistrict>(city.hexes.map((x, i) => {
        const isCenter = (x.q === 0 && x.r === 0);
        const d = GenerateDistrict(isCenter ? 'urban': 'fallow', city, x);
        d.key = i+1;
        city.districtKeys.push(d.key);
        if (isCenter)
            DistrictAddLots(d, lots, 'urban');
        return d;
    }));
    return {
        ds: ds,
        lots: lots
    }
}

export function GenerateDistrict(kind: 'urban'|'rural'|'fallow'|'nature', city: ICity, hex: HexPoint): IDistrict{
    return {
        kind: kind,
        key: 0,
        q: hex.q,
        r: hex.r,
        hexString: hex.q+','+hex.r,
        point: hex_to_pixel(city.hex_size, city.petriOrigin, hex),
        lots: []
    }
}

const urbanHexes = [{q: 1, r: -1},{q: 1, r: 0},{q: 0, r: 1},{q: -1, r: 1},{q: -1, r: 0},{q: 0, r: -1}];
const ruralHexes = [{q: 1, r: -1},{q: 0, r: 1},{q: -1, r: 0}];
export function DistrictAddLots(district: IDistrict, lotSlice: IEntitySlice<ILot>, kind: 'urban'|'rural'){
    const hexes = (kind === 'rural')? ruralHexes : urbanHexes;
    hexes.forEach((h, i) => {
        if (district.lots[i] == null){
            const lot: ILot = {
                key: 0,
                kind: kind,
                districtKey: district.key,
                point: hex_to_pixel({x: LotHexSizePX, y: LotHexSizePX}, district.point, h)
            }
            EntityAddToSlice(lotSlice, lot);
            district.lots.push(lot.key);
        }
    });
}

export function GenerateBean(world: {beans: {nextID:number}, date: IDate, seed: string}, city: ICity, parent?: IBean, hexPoint?: HexPoint, job?: TraitJob): IBean{
    let newBean: IBean = {
        key: world.beans.nextID++,
        cityKey: city.key,
        name: '',
        ethnicity: RandomEthno(world.seed),
        community: RandomCommunity(world.seed),
        ideals: RandomIdeal(world.seed),
        faith: RandomFaith(world.seed),
        stamina: 'awake',
        health: 'fresh',
        food: 'sated',
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
        priorities: [],
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
    newBean.name = GetRandom(world.seed, ['Joe', 'Frank', 'Jill', 'Jose',
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
    newBean.name += GetRandom(world.seed, [
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
        const newBelief = GetRandom(world.seed, RandomBeliefBucket);
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