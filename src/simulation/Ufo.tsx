import { HexPoint } from "./Geography";

export interface IUFO{
    key: number,
    hex: HexPoint,
    action: string,
    duration: number,
    cityKey: number
}