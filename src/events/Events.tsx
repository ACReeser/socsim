import { IChatData } from "../simulation/Agent";
import { Point } from "../simulation/Geography";

export type EventTrigger = 'speechcrime'|'birth'|'death'|'nojobslots';

export interface IEvent{
    icon: string;
    message: string;
    beanKey?: number;
    cityKey?: number;
    point?: Point;
    trigger: EventTrigger;
}

export class PubSub<T>{
    constructor(private onPublish?: (args: T) => void){}
    private callbacks: Array<(args: T) => void> = [];
    public publish(args: T){
        if (this.onPublish)
            this.onPublish(args);
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

export type IEventBus = {[key in EventTrigger]: PubSub<IEvent>};
export interface IEventBuffer{
    buffer: IEvent[]   
}
export const EventBusBufferLength = 20; 
export class EventBus implements IEventBus, IEventBuffer{
    buffer: IEvent[] = [];
    private sendToBuffer = (event: IEvent) => {
        if (this.buffer.length > EventBusBufferLength){
            this.buffer.pop();
        }
        this.buffer.unshift(event);
    }
    speechcrime = new PubSub<IEvent>(this.sendToBuffer);
    nojobslots = new PubSub<IEvent>(this.sendToBuffer);
    birth = new PubSub<IEvent>(this.sendToBuffer);
    death = new PubSub<IEvent>(this.sendToBuffer);

}