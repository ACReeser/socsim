import { IChatData } from "../simulation/Agent";

export type EventTrigger = 'speechcrime'|'birth'|'death';

export interface IEvent{
    icon: string;
    message: string;
    beanKey?: number;
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
    unsubscribe(callback: (ev: T) => void) {
        this.callbacks.splice(this.callbacks.indexOf(callback), 1);
    }
}

export class ChangePubSub extends PubSub<{change: number}>{
}

export type IEventBus = {[key in EventTrigger]: PubSub<IEvent>};

export class EventBus implements IEventBus{
    speechcrime = new PubSub<IEvent>();
    birth = new PubSub<IEvent>();
    death = new PubSub<IEvent>();
}