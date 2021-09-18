import React from 'react';
import { EmoteIcon } from '../World';

export const GreetingPanel: React.FC<{
    seed: string,
    changeSeed: (s: string) => void
}> = (props) => {
    return <div>
        <div className="col-2">
            <div>
                <h3>Welcome to the</h3>
                <h2>👽 Alien 🌍 Utopia 🔬 Laboratory</h2>
                <div>
                    Thank you for joining the <select><option>Human</option></select> Cultivation Division of the <strong>🌌 Galactic Xenosensation Federation!</strong> Interdimensional petri dish #<input type="text" value={props.seed} onChange={(e) => props.changeSeed(e.currentTarget.value)} maxLength={19} style={{width:'115px', fontFamily:'monospace', fontSize:'11px'}} /> is ready for farming.
                </div>
                <p>
                    As a <select><option>Human Emotion Farmer</option></select>, you are required to execute the following duties:
                </p>
                <ul>
                    <li>
                        Construct <strong>🏠 Buildings</strong> for your <select><option>Human</option></select> subjects.
                    </li>
                    <li>
                        <strong>🛸 Beam In</strong> <select><option>Human</option></select> subjects for cultivation.
                    </li>
                    <li>
                        Harvest your subject's positive <strong>{EmoteIcon['happiness']} Hedons</strong>.
                    </li>
                    <li>
                        Sell the Hedons on the <br/><strong>🌌 Galactic 😨 Emotion 💰 Market</strong>.
                    </li>
                </ul>
                <div>
                </div>
            </div>
            <div>
                <p>
                    The GXF's records indicate <select><option>Humans</option></select> are a<br/><u>mentally malleable</u> and <u>physically fragile</u> species. Try the following cultivation methods:
                </p>
                <ul>
                    <li>
                        <strong>🛰️ Scan</strong> your subject's primitive minds for information on what pleases them.
                    </li>
                    <li>
                        <strong>🚿 Brainwash</strong> subjects to change their <strong>🧠&nbsp;Traits</strong>. Try to add Traits that emit more <strong>{EmoteIcon['happiness']}&nbsp;Hedons</strong>.
                    </li>
                    <li>
                        Avoid letting your subjects die or endure pain; this makes <strong>{EmoteIcon['unhappiness']}&nbsp;Antihedons</strong> which are less profitable.
                    </li>
                    <li>
                        Use your knowledge of Traits to modify the farm's <strong>🗳️&nbsp;Government</strong> to maximize Hedon generation.
                    </li>
                    <li>
                        Use the GXF's <strong>🧪 Research Lab</strong> to upgrade your farm, when stocked with <strong>👾 Abducted</strong> subjects.
                    </li>
                </ul>
                <h3>
                    🌌 Galactic Xenosensation Federation <br/>
                    <div className="text-right">
                        <small>
                        {/* <i>THE market leader in corporeal sensations.</i> */}
                        <i>1 trillion sensations. 100% organic. 100% gourmet.</i>
                        </small>
                    </div>
                </h3>
            </div>
        </div>
    </div>
}