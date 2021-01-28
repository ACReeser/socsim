import { TraitGood, TraitJob } from "../World";
import { BuildingJobSlot } from "./Occupation";

export interface HexPoint{
    q: number;
    r: number;
}
export class Hex implements HexPoint{
    constructor(public q: number, public r: number){}
}
export const hex_directions: HexPoint[] = [
    new Hex(+1, 0), new Hex(+1, -1), new Hex(0, -1), 
    new Hex(-1, 0), new Hex(-1, +1), new Hex(0, +1), 
];
export function hex_direction(direction: number): HexPoint{
    return hex_directions[direction]
}

export function hex_neighbor(hex: HexPoint, direction: number): HexPoint{
    var dir = hex_direction(direction)
    return new Hex(hex.q + dir.q, hex.r + dir.r)
}
export function hex_distance(a: HexPoint, b: HexPoint): number{
    return (Math.abs(a.q - b.q) 
          + Math.abs(a.q + a.r - b.q - b.r)
          + Math.abs(a.r - b.r)) / 2
}
export function hex_add(a: HexPoint, b: HexPoint): HexPoint {
    return new Hex(a.q + b.q, a.r + b.r);
}
export function hex_scale(a: HexPoint, k: number): HexPoint {
    return new Hex(a.q * k, a.r * k);
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
export const layout_flat: Orientation = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0),
                2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0,
                0.0);
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


/**
 * matter lookup, returns CSS transforms for translation
 * @param geo 
 * @param type 
 * @param key 
 */
export function getBuildingTransform(geo: Geography, type: BuildingTypes, key: number){
    const p = geo.byType[type].coordByID[key];
    if (p)
        return transformPoint(hex_to_pixel(geo.hex_size, geo.petriOrigin, p));
    else
        return {background: 'red'}
}
export function transformPoint(p: Point){
    return {transform:`translate(${p.x}px, ${p.y}px)`};
}

export interface IBuilding{
    key: number;
    type: BuildingTypes;
    job_slots: {[key in BuildingJobSlot]: number|null};
    upgraded: boolean,
    openSlots(): BuildingJobSlot[];
    usedSlots(): BuildingJobSlot[];
    /**
     * returns true when bean is found in slot and freed
     * @param beanKey 
     */
    tryFreeBean(beanKey: number): boolean;
}
export class Building implements IBuilding{
    public key: number = 0;
    public type: BuildingTypes = 'farm';
    public occupied_slots: Point[] = [];
    public empty_slots: Point[] = [];
    public upgraded: boolean = false;
    public job_slots: {[key in BuildingJobSlot]: number|null} = {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
    }
    openSlots(): BuildingJobSlot[]{
        return Object.keys(this.job_slots).filter((s, i) => {
            return this.job_slots[+s as BuildingJobSlot] === null && (i < 3 || this.upgraded);
        }).map((x) => +x);
    }
    usedSlots(): BuildingJobSlot[]{
        return Object.keys(this.job_slots).filter((s) => {
            return this.job_slots[+s as BuildingJobSlot] != null;
        }).map((x) => +x);
    }
    tryFreeBean(beanKey: number): boolean{
        const usedSlots = this.usedSlots();
        for (let i = 0; i < usedSlots.length; i++) {
            const slot = usedSlots[i];
            const beanInSlot = this.job_slots[slot];
            if (beanInSlot === beanKey){
                this.job_slots[slot] = null;
                return true;
            }
        }
        return false;
    }
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

export type BuildingTypes = 'farm'|'house'|'hospital'|'church'|'theater'|'courthouse'|'park'|'nature';
export type MoverTypes = 'bean'|'ufo';
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
export const GoodToBuilding: {[key in TraitGood]: BuildingTypes} = {
    'food': 'farm',
    'shelter': 'house', 'medicine':'hospital', 'fun': 'theater'
};
export const JobToBuilding: {[key in TraitJob]: BuildingTypes} = {
    'farmer': 'farm',
    'builder': 'house', 'doc':'hospital', 'entertainer': 'theater',
    'cleric': 'church', 'jobless': 'house', 'polit': 'house'
};

export class Geography{
    public byCoord: AddressBuildingGrid = {};
    public byType: {[type in BuildingTypes]: BuildingMap} = {
        house: {coordByID: {}, all: []},
        farm: {coordByID: {}, all: []},
        hospital: {coordByID: {}, all: []},
        theater: {coordByID: {}, all: []},
        courthouse: {coordByID: {}, all: []},
        church: {coordByID: {}, all: []},
        park: {coordByID: {}, all: []},
        nature: {coordByID: {}, all: []},
    }
     
    public movers: {[key in MoverTypes]: AddressBookPoint} = {
        'bean': {},
        ufo: {}
    };
    public numberOf(type: BuildingTypes): number {
        return this.byType[type].all.length;
    }
    lookupBuilding(hex: HexPoint): undefined|IBuilding {
        return this.byCoord[hex.q+','+hex.r];
    }
    addBuilding(where: HexPoint, building: IBuilding) {
        this.byType[building.type].all.push(building);
        this.byType[building.type].coordByID[building.key] = where;
        this.byCoord[where.q+','+where.r] = building;
        return null;
    }
    removeBuilding(where: HexPoint, building: IBuilding) {
        const i = this.byType[building.type].all.indexOf(building);
        this.byType[building.type].all.splice(i, 1);
        delete this.byType[building.type].coordByID[building.key];
        this.byCoord[where.q+','+where.r] = undefined;
        return null;
    }
    public numberOfRings = 5;
    public hexes: HexPoint[] = hex_spiral({q:0, r:0}, this.numberOfRings);
    public hex_size: Point = {x: 70, y: 70};
    public readonly petriRadius = 550;
    public readonly petriOrigin = {x: this.petriRadius, y: this.petriRadius};
}