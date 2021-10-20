import { Point } from "../simulation/Geography";

export type EventTrigger = 'speechcrime'|'birth'|'death'|'nojobslots'|'marketrefresh'|'persuasion';

export interface IEvent{
    key: number;
    icon: string;
    message: string;
    beanKey?: number;
    cityKey?: number;
    point?: Point;
    trigger: EventTrigger;
}

export const EventBufferLength = 25; 

export class PubSub<T>{
    constructor(private onPublish?: (args: T) => void){}
    private callbacks: Array<(args: T) => void> = [];
    public current: T|undefined = undefined;
    public publish(args: T){
        if (this.onPublish)
            this.onPublish(args);
        this.current = args;
        this.callbacks.forEach((c) => c(args));
    }
    public subscribe(callback: (args: T) => void){
        this.callbacks.push(callback);
    }
    public unsubscribe(callback: (ev: T) => void) {
        this.callbacks.splice(this.callbacks.indexOf(callback), 1);
    }
}

export class ChangePubSub extends PubSub<{change: number}>{
}

