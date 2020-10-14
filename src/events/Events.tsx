
export interface IEvent{
    icon: string;
    message: string;
}

export class PubSub<T>{
    private callbacks: Array<(args: T) => void> = [];
    public publish(args: T){
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

export class EventBus{
    physicalCapital = new ChangePubSub();
    politicalCapital = new ChangePubSub();
    labor = new ChangePubSub();
}