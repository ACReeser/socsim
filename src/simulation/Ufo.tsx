import { HexPoint } from "./Geography";

export interface IUFO{
    key: number,
    point: HexPoint,
    action: string,
    duration: number,
    cityKey: number
}