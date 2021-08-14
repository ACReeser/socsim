import { ChangePubSub, IEvent, PubSub } from "./events/Events";

export class SignalStore {
    alienEnergy = new ChangePubSub();
    alienBots = new ChangePubSub();
    alienHedons = new ChangePubSub();
    events = new PubSub<IEvent>();
}

export const SignalStoreInstance = new SignalStore();