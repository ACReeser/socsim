import { PubSub } from "../events/Events";
import { Point } from "./Geography";

export type MoverType = 'ufo'|'bean'|'pickup';
type MoverCache = {
    [key in MoverType]: {
        [k2: number]: PubSub<Point>;
    };
};

export class MoverBus{
    private cache: MoverCache = {
        'ufo': {},
        'bean': {},
        'pickup': {}
    }
    public Get(type: MoverType, key: number): PubSub<Point>{
        if (!this.cache[type][key])
            this.cache[type][key] = new PubSub<Point>();
        return this.cache[type][key];
    }
}