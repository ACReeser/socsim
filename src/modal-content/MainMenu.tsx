import React, { useState } from 'react';
import { GameStorageInstance } from '../GameStorage';

export const MainMenu: React.FC<{
    startGame: () => void,
    loadGame: (slot:number) => void
}> = (props) => {
    const [view, setView] = useState<'main'|'showslots'>('main');
    const continueID = GameStorageInstance.HasContinueGame();
    const slots = GameStorageInstance.GetGameSlots();
    return <div>
        <h1 className="text-center">👽 Alien 🌍 Utopia 🔬 Lab</h1>
        {
            (view === 'main') ? <div>
                {
                    continueID != null ? <div className="text-center">
                        <button className="callout button f-size-15em" onClick={() => props.loadGame(continueID)}>
                        🧫 Continue Game
                        </button>
                    </div>: null
                }
                <div className="text-center">
                    <button className="callout button f-size-15em" onClick={() => props.startGame()}>
                    🛸 Start New Game
                    </button>
                </div>
                <div className="text-center">
                    <button className="callout button f-size-15em" onClick={() => setView('showslots')} disabled={slots.every(x => x.brief == null)}>
                    🗂️ Load Game
                    </button>
                </div>
            </div> : <div>
                {
                    slots.map(x => <div key={x.id}>
                        <button disabled={x.brief == null} onClick={() => {
                            if (x.brief)
                                props.loadGame(x.id);
                        }}>
                        {
                            x.brief ? <span>
                                <strong>{x.brief.Name}</strong>
                                &nbsp;<span>Year {x.brief.Age.year}</span>
                                &nbsp;<span>{x.brief.Population} 😐</span>
                            </span> : `Slot ${x.id}`
                        }
                        </button>
                    </div>)
                }
            </div>
        }
    </div>
}