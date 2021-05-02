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
    marketrefresh = new PubSub<IEvent>(this.sendToBuffer);
    persuasion = new PubSub<IEvent>(this.sendToBuffer);
}

export class Live<T>{
    public readonly onChange = new PubSub<T>();
    constructor(protected current: T){}
    public set(newValue: T){
        this.current = newValue;
        if (this.afterSetBeforePublish)
            this.afterSetBeforePublish(newValue);
        this.onChange.publish(newValue);
    }
    public get get(): T{
        return this.current;
    }
    public afterSetBeforePublish?: (val: T) => void; 
}
export class LiveList<T> extends Live<Array<T>>{
    public readonly onPush = new PubSub<T>();
    public push(child: T): void{
        this.set([...this.get, child]);
        this.onPush.publish(child);
    }
    public remove(child: T): void{
        const all = this.get;
        const i = all.indexOf(child);
        if (i > -1){
            all.splice(i, 1);
            this.set([...all]);
        }
    }
}
export class LiveMap<K, V> extends Live<Map<K, V>>{
    public readonly onAdd = new PubSub<{k: K, v: V}>();
    public add(newKey: K, newValue: V){
        const copy = new Map<K, V>(this.current);
        copy.set(newKey, newValue);
        this.set(copy);
        this.onAdd.publish({k: newKey, v: newValue});
    }
    public remove(key: K){
        const copy = new Map<K, V>(this.current);
        copy.delete(key);
        this.set(copy);
    }
    public at(key: K): V|undefined{
        return this.current.get(key);
    }
}