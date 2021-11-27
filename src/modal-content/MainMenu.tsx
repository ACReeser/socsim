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
        <h1 className="text-center"><span role="img" aria-label="alien">👽</span> Alien <span role="img" aria-label="globe">🌍</span> Utopia <span role="img" aria-label="microscope">🔬</span> Lab</h1>
        {
            (view === 'main') ? <div>
                {
                    continueID != null ? <div className="text-center">
                        <button className="callout button f-size-15em" onClick={() => props.loadGame(continueID)}>
                        <span role="img" aria-label="petridish">🧫</span> Continue Game
                        </button>
                    </div>: null
                }
                <div className="text-center">
                    <button className="callout button f-size-15em" onClick={() => props.startGame()}>
                    <span role="img" aria-label="flyingsaucer">🛸</span> Start New Game
                    </button>
                </div>
                <div className="text-center">
                    <button className="callout button f-size-15em" onClick={() => setView('showslots')} disabled={slots.every(x => x.brief == null)}>
                    <span role="img" aria-label="folder">🗂️</span> Load Game
                    </button>
                </div>
            </div> : <div className="card-parent vertical load-menu pad-4p">
                {
                    slots.map(x => <div key={x.id} className="card marg-b-20">
                        <button disabled={x.brief == null} className="" onClick={() => {
                            if (x.brief)
                                props.loadGame(x.id);
                        }}>
                        {
                            x.brief ? <span className="f-size-125em">
                                <strong>{x.brief.Name}</strong>
                                &nbsp;<span>Year {x.brief.Age.year}</span>
                                &nbsp;<span>{x.brief.Population} 😐</span>
                            </span> : <span className="f-size-125em">
                                Slot {x.id}
                            </span> 
                        }
                        </button>
                    </div>)
                }
            </div>
        }
    </div>
}