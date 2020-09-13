import { World } from "../World";

export enum Season {Spring, Summer, Fall, Winter}

export interface IDate{
    season: Season;
    year: number;
}

export function Now(world: World){
    return {year: world.date.year, season: world.date.season};
}

export function withinLastYear(current: IDate, last: IDate): boolean{
    return last.year > -1 && (
        last.year == current.year || (
            last.year == current.year - 1 &&
            last.season > current.season
        )
    )
}