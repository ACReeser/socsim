import { TraitGood, TraitJob } from "../World";
import { GetRandom } from "../WorldGen";
import { IHexPlane } from "./City";
import { IEnterprise } from "./Institutions";
import { BuildingJobSlot } from "./Occupation";
import { IBuilding } from "./RealEstate";
import { MathClamp } from "./Utils";

export interface HexPoint{
    q: number;
    r: number;
}
export type DistrictKind = 'fallow'|'rural'|'urban'|'nature';
export interface IDistrict extends HexPoint{
    key: number,
    hexString: string,
    point: Point,
    kind: DistrictKind,
    lots: number[]
}
export interface ILot{
    key: number,
    districtKey: number,
    point: Point,
    buildingKey?: number,
    kind: 'rural'|'urban',
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
export interface IAccelerator {
    point: Point, 
    velocity: Vector,
    hex: HexPoint
};
export const OriginAccelerator = { 
    point: {x: 0, y: 0}, 
    velocity: {x: 0, y: 0},
    hex: {q: 0, r: 0}
};
export function point_magnitude(p: Point){
    return Math.sqrt((p.x * p.x) + (p.y * p.y));
}
export function point_normalize(p: Point){
    const magnitude: number = point_magnitude(p);
    if (magnitude > 0){
        p.x /= magnitude;
        p.y /= magnitude;
    } else {
        p.x = p.y = 0;
    }
}
export function accelerate_towards(
    mover: IAccelerator, 
    plane: IHexPlane,
    target: Point, 
    acceleration: number,
    maxSpeed: number, 
    colDistance: number, 
    brake: Point, 
    getAvoidanceVelocity?: () => Point): boolean
{
    const delta: Point = {
        x: target.x - mover.point.x, 
        y: target.y - mover.point.y
    };
    const magnitude = Math.sqrt((delta.x * delta.x) + (delta.y * delta.y));
    if (magnitude <= colDistance) return true;

    delta.x /= magnitude;
    delta.y /= magnitude;
    //now delta is normalized 

    mover.velocity.x += (delta.x * acceleration);
    mover.velocity.y += (delta.y * acceleration);
    if (getAvoidanceVelocity){
        const avoidV = getAvoidanceVelocity();
        mover.velocity.x -= avoidV.x;
        mover.velocity.y -= avoidV.y;
    }
    mover.velocity.x = MathClamp(mover.velocity.x, -maxSpeed, maxSpeed);
    mover.velocity.y = MathClamp(mover.velocity.y, -maxSpeed, maxSpeed);


    accelerator_coast(mover, brake);
    mover.hex = round_point_to_hex(pixel_to_hex(plane.district_hex_size, plane.petriOrigin, mover.point));
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
    let rx = Math.round(cube.x);
    let ry = Math.round(cube.y);
    let rz = Math.round(cube.z);

    const x_diff = Math.abs(rx - cube.x)
    const y_diff = Math.abs(ry - cube.y)
    const z_diff = Math.abs(rz - cube.z)

    if (x_diff > y_diff && x_diff > z_diff)
        rx = -ry-rz;
    else if (y_diff > z_diff)
        ry = -rx-rz;
    else
        rz = -rx-ry;

    return {x: rx+0, y: ry+0, z: rz+0};
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
export const layout_pointy: Orientation = new Orientation(
    Math.sqrt(3.0), 
    Math.sqrt(3.0) / 2.0, 
    0.0, 3.0 / 2.0,       
    Math.sqrt(3.0) / 3.0, 
    -1.0 / 3.0, 
    0.0, 
    2.0 / 3.0,
    0.5
);
export const origin_point: Point = {x: 0, y: 0};
export const hex_origin: HexPoint = {q: 0, r: 0};
export function hex_to_pixel(size: Point, origin: Point, h: HexPoint): Point {
    const M: Orientation = layout_pointy;
    const x = (M.f0 * h.q + M.f1 * h.r) * size.x;
    const y = (M.f2 * h.q + M.f3 * h.r) * size.y;
    return {x: x + origin.x, y: y + origin.y};
}
export function pixel_to_hex(size: Point, origin: Point, p: Point): HexPoint {
    const M = layout_pointy;
    const pt = {x: (p.x - origin.x) / size.x,
                y: (p.y - origin.y) / size.y
            };
    const q = M.b0 * pt.x + M.b1 * pt.y;
    const r = M.b2 * pt.x + M.b3 * pt.y;
    return {q: q, r: r};
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

export type BuildingTypes = 'farm'|'house'|'hospital'|'church'|'theater'|'jail'|'park'|'nature'|'graveyard';
export type TopiaBuildingTypes = 'utopia_fields'|'utopia_pump'|'dystopia_refinery'|'dystopia_crypt';
//third place - cafe/bookstore/barbershop/pub/gym/arcade/bingohall
//utopia pump = slowly sucks up happiness/unhappiness?
//dystopia refinery = slowly converts negative emotions to energy/bots
//dystopia crypt = skips death notifications (limited use?)
export type MoverTypes = 'bean'|'ufo'|'pickup';
export type MatterTypes = MoverTypes|BuildingTypes;

export const BuildingIcon: {[key in BuildingTypes]: string} = {
    'farm': '🐄',
    'house': '🏡', 'hospital': '🏥', 'church': '⛪', 'theater': '🎪', 'jail':'🏛️',
    'park': '⛲️', 'nature': '🏞️', 'graveyard': '⚱️'
};
export const UpgradedBuildingIcon: {[key in BuildingTypes]: string} = {
    'farm': '🚜',
    'house': '🏘️', 'hospital': '🏙️', 'church': '⛪', 'theater': '🏟️', 'jail':'🏫',
    'park': '🎡', 'nature': '🏞️', 'graveyard': '⚱️'
};
export const BuildingJobIcon: {[key in BuildingTypes]: string} = {
    'farm': '🪕',
    'house': '📪', 'hospital': '🩺', 'church': '📿', 'theater': '🪑', 'jail':'🚨',
    'park': '💐', 'nature': '♨️', 'graveyard': '📿'
};
export const BuildingToGood: {[key in BuildingTypes]: TraitGood|undefined} = {
    'farm': 'food',
    'house': undefined, 
    'hospital': 'medicine', 
    'church': 'fun', 
    'theater': 'fun', 
    'jail': undefined,
    'graveyard': undefined,
    'park': 'fun', 
    'nature': 'fun'
};
export const GoodToBuilding: {[key in TraitGood]: BuildingTypes} = {
    'food': 'farm',
    // 'shelter': 'house',
    'medicine':'hospital',
    'fun': 'theater'
};
export const JobToBuilding: {[key in TraitJob]: BuildingTypes} = {
    'farmer': 'farm',
    'builder': 'house',
    'doc': 'hospital',
    'entertainer': 'theater',
    'cleric': 'church',
    'jobless': 'house',
    'polit': 'house',
    'cop': 'jail'
};
export const BuildingToJob: {[key in BuildingTypes]: TraitJob} = {
    'farm': 'farmer',
    'house': 'builder', 
    'hospital':'doc', 
    'theater': 'entertainer',
    'church': 'cleric',
    'park': 'entertainer',
    'nature': 'entertainer',
    'jail': 'cop',
    'graveyard': 'cleric'
};

//district sized hexes
export const HexSizePX = 150;
export const HexSizeR = 260; // rounded sqrt(3) * HexSizePX
export const DistrictHexSize = {x: HexSizePX, y: HexSizePX};

export function GenerateGeography(numberOfRings: number = 3){
    const radius = ((numberOfRings - 0.5) * HexSizeR);
    return {
        numberOfRings: numberOfRings,
        hexes: hex_spiral({q:0, r:0}, numberOfRings),
        district_hex_size: {...DistrictHexSize},
        petriRadius: radius,
        petriOrigin: {x: radius, y: radius}
    }
}

export const LotHexSizePX = 50;
export const LotHexSizeR = 86; // rounded sqrt(3) * LotHexSizePX