import { ChangePubSub, IEvent, PubSub } from "./events/Events";

export class SignalStore {
    alienEnergy = new ChangePubSub();
    alienBots = new ChangePubSub();
    alienHedons = new ChangePubSub();
    newTraitSeen = new PubSub<{k: string, v: boolean}>();
    events = new PubSub<IEvent>();
}

export const SignalStoreInstance = new SignalStore();