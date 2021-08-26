import { HexPoint, Point } from "../simulation/Geography";

export interface IEntitySlice<T extends {key: number}> {
    byID: { [key: number]: T },
    allIDs: number[],
    hxPosition: { [key: number]: HexPoint },
    nextID: number
}

export function CreateEmptyEntitySlice<T extends {key: number}>(): IEntitySlice<T>{
    return {
        byID: {},
        allIDs: [],
        hxPosition: {},
        nextID: 0
    }
}
export function CreateEntitySlice<T extends {key: number}>(all: T[]): IEntitySlice<T>{
    return {
        byID: all.reduce((map, entity) => { map[entity.key] = entity; return map; }, {} as {[key: number]: T}),
        allIDs: all.map(x => x.key),
        hxPosition: {},
        nextID: all.reduce((max, entity) => Math.max(entity.key+1, max), 0)
    }
}
export function EntityAddToSlice<T extends {key: number}>(slice: IEntitySlice<T>, newEntity: T){
    const k = slice.nextID++;
    newEntity.key = k;
    slice.allIDs.push(k);
    slice.byID[k] = newEntity;
}