import { PubSub } from "../events/Events";
import { IAccelerator } from "./Geography";

export type MoverType = 'ufo'|'bean'|'pickup';
type MoverCache = {
    [key in MoverType]: {
        [k2: number]: PubSub<IAccelerator>;
    };
};

export class MoverStore{
    private cache: MoverCache = {
        'ufo': {},
        'bean': {},
        'pickup': {}
    }
    public Get(type: MoverType, key: number): PubSub<IAccelerator>{
        if (!this.cache[type][key])
            this.cache[type][key] = new PubSub<IAccelerator>();
        return this.cache[type][key];
    }
}