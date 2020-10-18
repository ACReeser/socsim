
export interface HexPoint{
    q: number;
    r: number;
}
export class Hex implements HexPoint{
    constructor(public q: number, public r: number){}
}
const hex_directions: HexPoint[] = [
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

class Orientation {
    // angle is in multiples of 60°
    constructor(public f0: number, public f1: number, public  f2: number, public f3: number,
        public b0: number, public b1: number,public b2: number,public b3: number,
        public start_angle: number){}
};
export const layout_flat: Orientation = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0),
                2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0,
                0.0);

export function hex_to_pixel(size: Point, origin: Point, h: HexPoint): Point {
    const M: Orientation = layout_flat;
    const x = (M.f0 * h.q + M.f1 * h.r) * size.x;
    const y = (M.f2 * h.q + M.f3 * h.r) * size.y;
    return {x: x + origin.x, y: y + origin.y};
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


/**
 * matter lookup, returns CSS transforms for translation
 * @param geo 
 * @param type 
 * @param key 
 */
export function transformMatter(geo: Geography, type: MatterTypes, key: number){
    const p = geo.where[type][key];
    if (p)
        return transformPoint(hex_to_pixel(geo.hex_size, geo.petriOrigin, p));
    else
        return {background: 'red'}
}
export function transformPoint(p: Point){
    return {transform:`translate(${p.x}px, ${p.y}px)`};
}

export interface Building{
    key: number;
    type: BuildingTypes;
    occupied_slots: Point[] 
}

export interface AddressBook{
    [entityKey: number]: HexPoint
}

export type BuildingTypes = 'farm'|'house'|'hospital'|'church'|'theater';
export type MatterTypes = 'bean'|BuildingTypes;

export const BuildingIcon: {[key in BuildingTypes]: string} = {
    'farm': '🎑',
    'house': '🏡', 'hospital': '🏥', 'church': '⛪', 'theater': '🏟️'
};

export class Geography{
    public where: {[key in MatterTypes]: AddressBook} = {
        'bean': {},
        'farm': {},
        'house': {}, 'hospital': {}, 'church': {}, 'theater': {}
    };
    public what: {[key in BuildingTypes]: Building[]} = {
        'farm': [],
        'house': [], 'hospital': [], 'church': [], 'theater': []
    };
    public numberOfRings = 5;
    public hexes: HexPoint[] = hex_spiral({q:0, r:0}, this.numberOfRings);
    public hex_size: Point = {x: 60, y: 60};
    public readonly petriRadius = 450;
    public readonly petriOrigin = {x: this.petriRadius, y: this.petriRadius};
}