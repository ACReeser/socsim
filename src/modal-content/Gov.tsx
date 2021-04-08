import React, { useState } from "react";
import { SecondaryBeliefData } from "../simulation/Beliefs";
import { LawData, LawGroup, LawKey } from "../simulation/Government";
import { BeliefInventory } from "../simulation/Player";
import { World } from "../World";

export const GovernmentPanel: React.FC<{
    world: World
}> = (props) => {
    const [view, setView] = useState<LawGroup|'funds'>('Welfare');
    return <div>
        <div className="col-2">
            <h2 className="marg-b-0">Utopia Government</h2>
            <div>
                <div className="horizontal blue-orange cylinder f-size-125em marg-t-20">
                    <button type="button" onClick={() => setView('Welfare')} className={view === 'Welfare' ? 'active' : ''}>
                        🤲 Welfare
                    </button>
                    <button type="button" onClick={() => setView('Crime')} className={view === 'Crime' ? 'active' : ''}>
                        🚨 Crime
                    </button>
                    <button type="button" onClick={() => setView('Taxation')} className={view === 'Taxation' ? 'active' : ''}>
                        💰 Taxes
                    </button>
                    <button type="button" onClick={() => setView('funds')} className={view === 'funds' ? 'active' : ''}>
                        💸 Funds
                    </button>
                </div>
            </div>
        </div>
        {
            view === 'funds' ? <div>

            </div> : <LawDetailList group={view} seenBeliefs={props.world.alien.seenBeliefs.get} beliefs={props.world.alien.beliefInventory.get}></LawDetailList>
        }
    </div>
}


export const LawDetailList: React.FC<{
    group: LawGroup,
    seenBeliefs: Map<string, boolean>,
    beliefs: BeliefInventory[]
}> = (props) => {
    const laws = Object.values(LawData).filter(x => x.group === props.group);
    const [law, setLaw] = useState<LawKey|null>(null);
    return <div className="col-2-30-60">
        <div>
            <div className="scroll">
                <div className="scoll-sticky-h">
                    <strong>{props.group} Laws</strong>
                </div>
                <div>
                    {
                        laws.map((x) => <LawFormula seenBeliefs={props.seenBeliefs} id={x.key} beliefs={props.beliefs} key={x.key} selectLaw={(l) => setLaw(l)}></LawFormula>)
                    }
                </div>
            </div>
        </div>
        <div>
            <div className="modal-scroll-v">
                <div className="sticky-t-0">
                    {
                        law === null ? <strong>Select a Law</strong> : <strong>{LawData[law].name}</strong>
                    }
                </div>
                {

                }
            </div>
        </div>
    </div>
}


export const LawFormula: React.FC<{
    id: LawKey,
    seenBeliefs: Map<string, boolean>,
    beliefs: BeliefInventory[],
    selectLaw: (l: LawKey) => void
}> = (props) => {
    const law = LawData[props.id];
    const canSeeName = law.prereqTraits.length === 0 || law.prereqTraits.some((x) => props.seenBeliefs.get(x));
    const unlocked = law.prereqTraits.length === 0 || law.prereqTraits.every((x) => props.seenBeliefs.get(x));
    return <div className="vertical law-formula">
        <div className="horizontal">
            <div className="circular">
                {canSeeName ? law.icon : '❔'}
            </div>
            <div>
                <strong>
                    {canSeeName ? law.name : 'Unknown'}
                </strong>
                {
                    unlocked ? <button className="pull-r" onClick={() => props.selectLaw(props.id)}>
                        🔍
                    </button> : null
                }
                <div>
                    {
                        canSeeName ? <small> {law.description} </small> : null
                    }
                </div>
            </div>
        </div>
        <div className="vertical">
            {
                law.prereqTraits.map((x) => {
                    const has = props.seenBeliefs.has(x);
                    return !has ? <span className="law-formula-ingredient unknown" key={x}>
                        ❔ Unknown
                    </span> : <span className="law-formula-ingredient" key={x}>
                        {SecondaryBeliefData[x].icon}&nbsp;{SecondaryBeliefData[x].noun}
                    </span>
                })
            }
        </div>
    </div>;
}