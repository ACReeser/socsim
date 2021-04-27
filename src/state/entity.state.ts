import { HexPoint, Point } from "../simulation/Geography";

export interface IEntitySlice<T> {
    byID: { [key: number]: T },
    allIDs: number[],
    hxPosition: { [key: number]: HexPoint },
    pxPosition: { [key: number]: Point}
}

export function CreateEmptyEntitySlice<T>(): IEntitySlice<T>{
    return {
        byID: {},
        allIDs: [],
        hxPosition: {},
        pxPosition: {}
    }
}
export function CreateEntitySlice<T extends {key: number}>(all: T[]): IEntitySlice<T>{
    return {
        byID: all.reduce((map, entity) => { map[entity.key] = entity; return map; }, {} as {[key: number]: T}),
        allIDs: all.map(x => x.key),
        hxPosition: {},
        pxPosition: {}
    }
}