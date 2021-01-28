import { World } from "../World";

export enum Season {Spring, Summer, Fall, Winter}
export enum Hour {Midnight, Morning, Noon, Evening}

export interface IDate{
    day: number;
    season: Season;
    year: number;
    hour: Hour;
}

export function Now(world: World): IDate{
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