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
                <h2><span role="img" aria-label="alien">👽</span> Alien <span role="img" aria-label="globe">🌍</span> Utopia <span role="img" aria-label="microscope">🔬</span> Laboratory</h2>
                <div>
                    Thank you for joining the <select><option>Human</option></select> Cultivation Division of the <strong><span role="img" aria-label="galaxy">🌌</span>&nbsp;Galactic Xenosensation Federation!</strong> Interdimensional petri dish <span style={{whiteSpace:'nowrap'}}>#<input type="text" value={props.seed} onChange={(e) => props.changeSeed(e.currentTarget.value)} maxLength={19} style={{width:'115px', fontFamily:'monospace', fontSize:'11px'}} /></span> is ready for farming.
                </div>
                <p>
                    As a <select><option>Human Emotion Farmer</option></select>, you are required to execute the following duties:
                </p>
                <ul>
                    <li>
                        Construct <strong><span role="img" aria-label="house">🏠</span> Buildings</strong> for your <select><option>Human</option></select> subjects.
                    </li>
                    <li>
                        <strong><span role="img" aria-label="alien saucer">🛸</span> Beam In</strong> <select><option>Human</option></select> subjects for cultivation.
                    </li>
                    <li>
                        Harvest your subject's positive <strong>{EmoteIcon['happiness']} Hedons</strong>.
                    </li>
                    <li>
                        Sell the Hedons on the <br/><strong><span role="img" aria-label="galaxy">🌌</span> Galactic <span role="img" aria-label="scared">😨</span> Emotion <span role="img" aria-label="cashbag">💰</span> Market</strong>.
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
                        <strong><span role="img" aria-label="satellite">🛰️</span> Scan</strong> your subject's primitive minds for information on what pleases them.
                    </li>
                    <li>
                        <strong><span role="img" aria-label="shower">🚿</span> Brainwash</strong> subjects to change their <strong><span role="img" aria-label="brain">🧠</span>&nbsp;Traits</strong>. Try to add Traits that emit more <strong><span role="img" aria-label="happy">{EmoteIcon['happiness']}</span>&nbsp;Hedons</strong>.
                    </li>
                    <li>
                        Avoid letting your subjects die or endure pain; this makes <strong><span role="img" aria-label="angry">{EmoteIcon['unhappiness']}</span>&nbsp;Antihedons</strong> which are less profitable.
                    </li>
                    <li>
                        Use your knowledge of Traits to modify the farm's <strong><span role="img" aria-label="voting">🗳️</span>&nbsp;Government</strong> to maximize Hedon generation.
                    </li>
                    <li>
                        Use the GXF's <strong><span role="img" aria-label="beaker">🧪</span> Research Lab</strong> to upgrade your farm, when stocked with <strong><span role="img" aria-label="alien abduction">👾</span> Abducted</strong> subjects.
                    </li>
                </ul>
                <h3>
                    <span role="img" aria-label="galaxy">🌌</span> Galactic Xenosensation Federation <br/>
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