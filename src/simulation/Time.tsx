import { IWorldState } from "../state/features/world";

export enum Season {Spring, Summer, Fall, Winter}
export const TicksPerHour = 2;
export const TicksPerDay = TicksPerHour * 4;
export enum PartOfDay {Midnight = 0, Morning = TicksPerHour, Noon = TicksPerHour*2, Evening = TicksPerHour*3}

export interface IDate{
    day: number;
    season: Season;
    year: number;
    /**
     * analogous to ticks
     * 
     * zero based, ranges from 0 to `HoursPerDay -1`
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