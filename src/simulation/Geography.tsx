import { LiveMap } from "../events/Events";
import { TraitGood, TraitJob } from "../World";
import { GetRandom } from "../WorldGen";
import { IEnterprise, isEnterprise } from "./Institutions";
import { BuildingJobSlot } from "./Occupation";
import { MathClamp } from "./Utils";

export interface HexPoint{
    q: number;
    r: number;
}
export class Hex implements HexPoint{
    constructor(public q: number, public r: number){}
}
export const hex_directions: HexPoint[] = [
    {q:+1, r:0}, {q: +1, r: -1}, {q: 0, r: -1}, 
    {q:-1, r:0}, {q: -1, r: +1}, {q: 0, r: +1}, 
];
export function hex_direction(direction: number): HexPoint{
    return hex_directions[direction]
}

export function hex_neighbor(hex: HexPoint, direction: number): HexPoint{
    var dir = hex_direction(direction)
    return {q: hex.q + dir.q, r: hex.r + dir.r};
}
export function hex_distance(a: HexPoint, b: HexPoint): number{
    return (Math.abs(a.q - b.q) 
          + Math.abs(a.q + a.r - b.q - b.r)
          + Math.abs(a.r - b.r)) / 2
}
export function hex_add(a: HexPoint, b: HexPoint): HexPoint {
    return {q: a.q + b.q, r: a.r + b.r};
}
export function hex_scale(a: HexPoint, k: number): HexPoint {
    return {q:a.q * k, r:a.r * k};
}
export function hex_ring(center: HexPoint, radius: number): HexPoint[]{
    var results: HexPoint[] = [];
    // this code doesn't work for radius == 0; can you see why?
    var cube = hex_add(center, 
                        hex_scale(hex_direction(4), radius));
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            results.push(cube)
            cube = hex_neighbor(cube, i);       
        }
    }
    return results;
}
export function hex_spiral(center: HexPoint, radius: number): HexPoint[]{
    var results = [center];
    for (let k = 0; k < radius; k++) {
        results = results.concat(hex_ring(center, k));
        //console.log(results);   
    }
    return results;
}

export function move_towards(current: Point, target: Point, maxDistanceDelta: number)
{
    const a: Point = {x: target.x - current.x, y: target.y - current.y};
    const magnitude = Math.sqrt(a.x * a.x + a.y * a.y);
    if (magnitude <= maxDistanceDelta || magnitude == 0)
    {
        return target;
    }
    return {
        x: current.x + a.x / magnitude * maxDistanceDelta,
        y: current.y + a.y / magnitude * maxDistanceDelta,
    };
}
export interface IAccelerator {point: Point, velocity: Vector};
export const OriginAccelerator = { point: {x: 0, y: 0}, velocity: {x: 0, y: 0}}
export function accelerate_towards(
    mover: IAccelerator, 
    target: Point, 
    acceleration: number,
    maxSpeed: number, 
    colDistance: number, 
    brake: Point): boolean
{
    const delta: Point = {
        x: target.x - mover.point.x, 
        y: target.y - mover.point.y
    };
    const magnitude = Math.sqrt((delta.x * delta.x) + (delta.y * delta.y));
    if (magnitude <= colDistance) return true;

    delta.x /= magnitude;
    delta.y /= magnitude;

    mover.velocity.x += (delta.x * acceleration);
    mover.velocity.y += (delta.y * acceleration);
    mover.velocity.x = MathClamp(mover.velocity.x, -maxSpeed, maxSpeed);
    mover.velocity.y = MathClamp(mover.velocity.y, -maxSpeed, maxSpeed);

    accelerator_coast(mover, brake);
    return false;
}
export function accelerator_coast(
    current: IAccelerator, 
    brake: Point): void
{
    current.velocity.x *= brake.x;
    current.velocity.y *= brake.y;

    current.point.x += current.velocity.x;
    current.point.y += current.velocity.y;
}

export function lerp(a: number, b: number, t: number): number{
    return a + (b - a) * t
}

export function vector_lerp(a: Point, b: Point, t: number): Point{
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    };
}
function cube_lerp(a: CubicPoint, b: CubicPoint, t: number): CubicPoint{
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        z: lerp(a.z, b.z, t)
    };
}
function cube_distance(a: CubicPoint, b: CubicPoint): number{
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2
}
function cube_round(cube: CubicPoint): CubicPoint{
    var rx = Math.round(cube.x);
    var ry = Math.round(cube.y);
    var rz = Math.round(cube.z);

    var x_diff = Math.abs(rx - cube.x)
    var y_diff = Math.abs(ry - cube.y)
    var z_diff = Math.abs(rz - cube.z)

    if (x_diff > y_diff && x_diff > z_diff)
        rx = -ry-rz;
    else if (y_diff > z_diff)
        ry = -rx-rz;
    else
        rz = -rx-ry;

    return {x: rx, y: ry, z: rz};
}
function round_point_to_hex(hex: HexPoint): HexPoint{
    return cube_to_axial(cube_round(axial_to_cube(hex)))

}
function cube_to_axial(cube: CubicPoint){
    var q = cube.x;
    var r = cube.z;
    return new Hex(q, r);
}
function axial_to_cube(hex: HexPoint): CubicPoint{
    return {
        x: hex.q,
        z: hex.r,
        y: -hex.q-hex.r
    };
}
function cube_linedraw(a: CubicPoint, b: CubicPoint): HexPoint[]{
    var N = cube_distance(a, b);
    var results: HexPoint[] = [];
    for (let i = 0; i <= N; i++) {
        results.push(cube_to_axial(cube_round(cube_lerp(a, b, 1.0/N * i))))
    }
    return results;
}
export function hex_linedraw(a: HexPoint, b: HexPoint): HexPoint[]{
    return cube_linedraw(axial_to_cube(a), axial_to_cube(b));
}

class Orientation {
    // angle is in multiples of 60°
    constructor(public f0: number, public f1: number, public  f2: number, public f3: number,
        public b0: number, public b1: number,public b2: number,public b3: number,
        public start_angle: number){}
};
export const layout_flat: Orientation = new Orientation(
    3.0 / 2.0, 
    0.0, 
    Math.sqrt(3.0) / 2.0, 
    Math.sqrt(3.0),
    2.0 / 3.0, 
    0.0, 
    -1.0 / 3.0, 
    Math.sqrt(3.0) / 3.0,
    0.0
);
export const origin_point: Point = {x: 0, y: 0};
export const hex_origin: HexPoint = {q: 0, r: 0};
export function hex_to_pixel(size: Point, origin: Point, h: HexPoint): Point {
    const M: Orientation = layout_flat;
    const x = (M.f0 * h.q + M.f1 * h.r) * size.x;
    const y = (M.f2 * h.q + M.f3 * h.r) * size.y;
    return {x: x + origin.x, y: y + origin.y};
}
export function pixel_to_hex(size: Point, origin: Point, p: Point) {
    const M = layout_flat;
    const pt = {x: (p.x - origin.x) / size.x,
                y: (p.y - origin.y) / size.y
            };
    const q = M.b0 * pt.x + M.b1 * pt.y;
    const r = M.b2 * pt.x + M.b3 * pt.y;
    return new Hex(q, r);
}


export interface PolarPoint{
    /**
     * radius (in pixels)
     */
    r: number;
    /**
     * azimuth (radians)
     */
    az: number;
}

export function polarToPoint(p: PolarPoint): Point{
    return {
        x: p.r * Math.cos(p.az),
        y: p.r * Math.sin(p.az)
    }
}

export function distanceBetweenPolar(a: PolarPoint, b: PolarPoint): number{
    const aCart = polarToPoint(a);
    const bCart = polarToPoint(b)
    return Math.sqrt(
        Math.pow(aCart.x - aCart.x, 2) +
        Math.pow(bCart.y - aCart.y, 2)
    );
}

export interface Point{
    x: number; y: number;
}
export interface Vector extends Point{
}
export interface CubicPoint extends Point{
    z: number;
}

export function transformPoint(p: Point){
    return {transform:`translate(${p.x}px, ${p.y}px)`};
}

export interface IBuilding{
    key: number;
    address: HexPoint;
    type: BuildingTypes;
    job_slots: {[key in BuildingJobSlot]: number|undefined};
    upgraded: boolean
}

/**
 * address books allow lookups from entity "name" to location
 */
export interface AddressBookHex{
    [entityKey: number]: HexPoint
}
export interface AddressBookPoint{
    [entityKey: number]: Point
}
/**
 * address grids allow lookups from location to entity
 * 
 * note: coordinates are of form "X,Y"
 * and the map cannot distinguish between hex and cartesian points
 */
export interface AddressGrid<T>{
    [coordinate: string]: T|undefined
}
export interface AddressBuildingGrid extends AddressGrid<IBuilding>{}

export interface BuildingMap{
    coordByID: AddressBookHex;
    all: IBuilding[];
}

export class CityBook {
    /**
     * given "q,r", return the IBuilding.key
     */
    public readonly map = new LiveMap<string, number>(new Map());
    /**
     * given IBuilding.type return the IBuilding[]
     */
    public readonly yellow = new LiveMap<string, number[]>(new Map());
    /**
     * given IBuilding.key, return "q,r"
     */
    public readonly white = new LiveMap<number, string>(new Map());
    /**
     * given IBuilding.key, return IBuilding
     */
    public readonly db: LiveMap<number, IBuilding>;

    constructor(_db: Map<number, IBuilding>){
        this.db = new LiveMap<number, IBuilding>(_db);
        this.buildIndexes();
        this.db.afterSetBeforePublish = () => this.buildIndexes();
    }

    private buildIndexes(){
        const keys = Array.from(this.db.get.keys());
        const ix = { 
            map: new Map<string, number>(),
            yellow: new Map<string, number[]>(),
            white: new Map<number, string>()
        }
        keys.forEach((key: number) => {
            const b = this.db.get.get(key);
            if (b){
                const address = b.address.q+','+b.address.r;
                ix.map.set(address, b.key);
                ix.white.set(b.key, address);
                const group = ix.yellow.get(b.type) || []
                ix.yellow.set(b.type, group.concat([b.key]));
            }

        });
        this.white.set(ix.white);
        this.map.set(ix.map);
        this.yellow.set(ix.yellow);
    }

    public addBuilding(b: IBuilding){
        this.db.add(b.key, b);
        this.buildIndexes();
    }
    public removeBuilding(b: IBuilding){
        this.db.remove(b.key);
        this.buildIndexes();
    }

    public getBuildings(): IBuilding[]{
        return Array.from(this.db.get.values());
    }
    public findBuildingByCoordinate(h: HexPoint){
        const address = h.q+','+h.r;
        const key = this.map.get.get(address);
        if (key != null) 
            return this.db.get.get(key);
        return undefined;
    }
    public getRandomBuildingOfType(buildingType: BuildingTypes): IBuilding|undefined{
        const keysOfType: number[] = this.yellow.get.get(buildingType) || [];
        const r = GetRandom(keysOfType);
        return this.db.at(r);
    }

    public getRandomEntertainmentBuilding(): IBuilding|undefined{
        const keysOfType: number[] = (this.yellow.get.get('park') || []).concat(this.yellow.get.get('nature') || []);
        const r = GetRandom(keysOfType);
        return this.db.at(r);
    }

    public getCountOfType(buildingType: BuildingTypes): number{
        return Array.from(this.yellow.get.get(buildingType) || []).length;
    }
}

export type BuildingTypes = 'farm'|'house'|'hospital'|'church'|'theater'|'courthouse'|'park'|'nature';
export type TopiaBuildingTypes = 'utopia_fields'|'utopia_pump'|'dystopia_refinery'|'dystopia_crypt';
//utopian fields = free relax
//utopia pump = slowly sucks up happiness/unhappiness?
//dystopia refinery = slowly converts negative emotions to energy/bots
//dystopia crypt = skips death notifications (limited use?)
export type MoverTypes = 'bean'|'ufo'|'pickup';
export type MatterTypes = MoverTypes|BuildingTypes;

export const BuildingIcon: {[key in BuildingTypes]: string} = {
    'farm': '🐄',
    'house': '🏡', 'hospital': '🏥', 'church': '⛪', 'theater': '🎪', 'courthouse':'🏫',
    'park': '⛲️', 'nature': '🏞️'
};
export const UpgradedBuildingIcon: {[key in BuildingTypes]: string} = {
    'farm': '🚜',
    'house': '🏘️', 'hospital': '🏙️', 'church': '⛪', 'theater': '🏟️', 'courthouse':'🏫',
    'park': '🎡', 'nature': '🏞️'
};
export const BuildingJobIcon: {[key in BuildingTypes]: string} = {
    'farm': '🌾',
    'house': '📪', 'hospital': '🛏️', 'church': '⛪', 'theater': '🪑', 'courthouse':'🏫',
    'park': '💐', 'nature': '♨️'
};
export const BuildingToGood: {[key in BuildingTypes]: TraitGood} = {
    'farm': 'food',
    'house': 'shelter', 
    'hospital': 'medicine', 
    'church': 'fun', 
    'theater': 'fun', 
    'courthouse': 'fun',
    'park': 'fun', 
    'nature': 'fun'
};
export const GoodToBuilding: {[key in TraitGood]: BuildingTypes} = {
    'food': 'farm',
    'shelter': 'house',
    'medicine':'hospital',
    'fun': 'theater'
};
export const JobToBuilding: {[key in TraitJob]: BuildingTypes} = {
    'farmer': 'farm',
    'builder': 'house', 
    'doc':'hospital', 
    'entertainer': 'theater',
    'cleric': 'church', 
    'jobless': 'house', 
    'polit': 'house'
};

export const HexSizePX = 70;
export const HexSizeR = 120; // rounded sqrt(3) * HexSizePX
export class Geography{
    public book: CityBook = new CityBook(new Map());

    addBuilding(building: IBuilding) {
        this.book.addBuilding(building);
        return null;
    }
    removeBuilding(where: HexPoint, building: IBuilding) {
        this.book.removeBuilding(building);
        return null;
    }
    getEnterprise(buildingKey: number): IEnterprise|undefined{
        const ent = this.book.db.get.get(buildingKey);
        if (isEnterprise(ent))
            return ent;
        return undefined;
    }
    constructor(){
        const geo = GenerateGeography();
        this.numberOfRings = geo.numberOfRings;
        this.hexes = geo.hexes;
        this.hex_size = geo.hex_size;
        this.petriRadius = geo.petriRadius;
        this.petriOrigin = geo.petriOrigin;
    }
    public readonly numberOfRings: number;
    public readonly hexes: HexPoint[];
    public readonly hex_size: Point;
    public readonly petriRadius: number;
    public readonly petriOrigin: Point;
}

export function GenerateGeography(){
    const numberOfRings = 5;
    const radius = ((numberOfRings - 0.5) * HexSizeR) + numberOfRings;
    return {
        numberOfRings: numberOfRings,
        hexes: hex_spiral({q:0, r:0}, numberOfRings),
        hex_size: {x: HexSizePX, y: HexSizePX},
        petriRadius: radius,
        petriOrigin: {x: radius, y: radius}
    }
}