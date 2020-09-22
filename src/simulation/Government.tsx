import { IPolicy } from "../Politics";
import { Axis } from "../World";

export class Government{
    public get policies(): IPolicy[] {
        return Object.values(this.policyTree);
    }
    public policyTree: {[key in Axis]: IPolicy} = {} as {[key in Axis]: IPolicy};
}