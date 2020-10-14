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

export interface Point{
    x: number; y: number;
}
export interface Vector extends Point{
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

export function transformMatter(geo: Geography, type: MatterTypes, key: number){
    const p = geo.where[type][key];
    if (p)
        return {transform:`translate(${p.x}px, ${p.y}px)`};
    else
        return {background: 'red'}
}

export interface Building{
    key: number;
    type: BuildingTypes; 
}

export interface AddressBook{
    [entityKey: number]: Point
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
    public regions: PolarPoint[] = [
        {r: 0, az: 0}
    ]
}