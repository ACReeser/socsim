import { MoverStoreInstance } from "../MoverStoreSingleton";
import { TraitEmote } from "../World";
import { IBean } from "./Agent";
import { OriginAccelerator, Point, Vector } from "./Geography";

export interface IPickup{
    key: number, 
    point: Point, 
    type: TraitEmote,
    velocity: Vector
}

export function GenerateEmoteFromBean(bean: IBean, emote: TraitEmote): IPickup {
    return {
        key: 0,
        point: {
            ...(MoverStoreInstance.Get('bean', bean.key).current || OriginAccelerator).point
        },
        type: emote,
        velocity: { x: 0, y: 0 }
    };
}