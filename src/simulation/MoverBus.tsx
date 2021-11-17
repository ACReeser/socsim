import { PubSub } from "../events/Events";
import { HexPoint, IAccelerator, OriginAccelerator } from "./Geography";

export type MoverType = 'ufo'|'bean'|'pickup';
type MoverCache = {
    [key in MoverType]: {
        [k2: number]: PubSub<IAccelerator>;
    };
};
type HexMoverBin = {
    [mType in MoverType]: {
        [hexStr: string]: number[]
    }
};

/**
 * boy this is an odd class!
 * this is for storing and publishing the pixel positions of the tiny physics simulation
 * 
 * it's outside of the redux store because it is updated all the time!
 * 
 * it also takes care of "binning" the things by hex string
 */
export class MoverStore{
    private cache: MoverCache = {
        'ufo': {},
        'bean': {},
        'pickup': {}
    };
    private bins: HexMoverBin = {
        'ufo': {},
        'bean': {},
        'pickup': {}
    }
    public Get(type: MoverType, key: number): PubSub<IAccelerator>{
        if (!this.cache[type][key])
            this.cache[type][key] = new PubSub<IAccelerator>();
        return this.cache[type][key];
    }
    /**
     * publish new pixel positions and update the hex-to-ID bin
     * @param type 
     * @param key 
     * @param newPos 
     * @param oldHex 
     */
    public UpdatePosition(type: MoverType, key: number, newPos: IAccelerator, oldHex: HexPoint){
        this.Get(type, key).publish(newPos);
        if (oldHex.q != newPos.hex.q || oldHex.r != newPos.hex.r){
            const oldBin = this.bins[type][oldHex.q+','+oldHex.r];
            if (oldBin){
                const oldI = oldBin.indexOf(key);
                if (oldI > -1)
                    oldBin.splice(oldI, 1);
            }
            const newHexStr = newPos.hex.q+','+newPos.hex.r;
            if (this.bins[type][newHexStr] == null)
                this.bins[type][newHexStr] = [];
            this.bins[type][newHexStr].push(key);
        }
    }
    public GetOthersInHexBin(type: MoverType, selfKey: number, hex: HexPoint): IAccelerator[]{
        const allKeysInBin = this.bins[type][hex.q+','+hex.r];
        if (Array.isArray(allKeysInBin))
            return allKeysInBin.filter(keyInBin => keyInBin != selfKey).map(otherKey => this.cache[type][otherKey]?.current || OriginAccelerator)
        else return []
    }
}