import { PubSub } from "./events/Events";
import { IDate } from "./simulation/Time";
import { IWorldState } from "./state/features/world";
import { IWorld } from "./World";

const GameSavePrefix = 'game-';
const GameBriefPrefix = 'game-brief-';
const LastGameSaveIDKey = 'last-game-id';
const MaxNumGameSlots = 3;

interface IWorldBrief {
    Name: string,
    Population: number,
    Age: IDate
}
export function isGame(g: {game: IWorldState}|{errors: string[]}): g is {game:IWorldState}{
    return (<any>g).game != null;
}
export class GameStorage{
    HasContinueGame(): number|undefined{
        const rawID = localStorage.getItem(LastGameSaveIDKey);
        if (rawID == null)
            return undefined;

        const id = parseInt(rawID);
        if (isNaN(id))
            return undefined;

        const rawgame = localStorage.getItem(`${GameSavePrefix}${id}`);
        if (rawgame != null)
            return id;
        else
            return undefined;
    }
    GetGameSlots(): {id: number, brief?: IWorldBrief}[] {
        const slots: {id: number, brief: IWorldBrief}[] = [];
        for (let i = 0; i < MaxNumGameSlots; i++) {
            const brief = localStorage.getItem(`${GameBriefPrefix}${i+1}`);
            slots.push({
                id: i+1,
                brief: brief ? JSON.parse(brief) : undefined
            });
        }
        return slots;
    }
    GetGame(id: number): {game: IWorldState}|{errors: string[]}{
        const rawgame = localStorage.getItem(`${GameSavePrefix}${id}`);
        if (rawgame){

        } else {
            return {
                errors: ['Cannot find game']
            }
        }
        try {
            const game = JSON.parse(rawgame);
            return {
                game: game as IWorldState
            }
        } catch(e) {
            return {
                errors: [e]
            }
        }
    }
    SaveGame(world: IWorldState){
        const raw = JSON.stringify(world);
        const brief: IWorldBrief = {
            Name: world.cities.byID[0].name,
            Population: world.beans.allIDs.map(x => world.beans.byID[x]).filter(y => y.lifecycle != 'dead').length,
            Age: {
                day: world.date.day,
                hour: world.date.hour,
                season: world.date.season,
                year: world.date.year
            }
        };
        localStorage.setItem(`${GameSavePrefix}${world.saveSlot}`, raw);
        localStorage.setItem(`${GameBriefPrefix}${world.saveSlot}`, JSON.stringify(brief));
        localStorage.setItem(LastGameSaveIDKey, world.saveSlot.toString());
        this.Dirty.publish(false);
        this.Saving.publish();
    }
    Dirty = new PubSub<boolean>();
    Saving = new PubSub<void>();
}
export const GameStorageInstance = new GameStorage();