import { IWorldState } from "../state/features/world";
import { ActivityPeriod } from "./Agent";

export enum Season {Spring, Summer, Fall, Winter}
export const TicksPerPeriod = 3;
export const TicksPerDay = TicksPerPeriod * 4;
export enum PartOfDay {
    Midnight = 0, 
    Morning = TicksPerPeriod, 
    Noon = TicksPerPeriod*2, 
    Evening = TicksPerPeriod*3
}

export interface IDate{
    day: number;
    season: Season;
    year: number;
    /**
     * analogous to ticks
     * 
     * zero based, ranges from 0 to `TicksPerDay -1`
     */
    hour: number;
}

export function Now(world: IWorldState): IDate{
    return {year: world.date.year, season: world.date.season, day: world.date.day, hour: world.date.hour};
}

export function withinLastYear(current: IDate, last: IDate): boolean{
    return last.year > -1 && (
        last.year == current.year || (
            last.year == current.year - 1 &&
            last.season > current.season
        )
    )
}