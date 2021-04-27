import { TraitEmote } from "../World";
import { Point, Vector } from "./Geography";

export interface IPickup{
    key: number, 
    point: Point, 
    type: TraitEmote,
    velocity: Vector
}