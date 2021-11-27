import React, { useState } from "react";
import { Subtabs } from "../chrome/Subtab";
import { CrimeData, CrimeKey, CrimePunishment, IsLaw, LawData, LawGroup, LawKey, PlayerCanSeePrereqs, PlayerKnowsPrereq, PlayerMeetsPrereqs, PrereqKey, PrereqString } from "../simulation/Government";
import { BeliefInventory } from "../simulation/Player";
import { enactLaw, repealLaw, setCrimeLegality } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { TreasuryReport } from "../widgets/TreasuryReport";

export const GovernmentPanel: React.FC<{
}> = (props) => {
    const [view, setView] = useState<LawGroup|'funds'>('Welfare');
    return <div>
        <div className="col-2">
            <h2 className="marg-b-0">Utopia Government</h2>
            <div>
                <div className="horizontal blue-orange cylinder f-size-125em marg-t-20">
                    <button type="button" onClick={() => setView('Welfare')} className={view === 'Welfare' ? 'active' : ''}>
                        <span role="img" aria-label="hands">🤲</span> Welfare
                    </button>
                    <button type="button" onClick={() => setView('Crime')} className={view === 'Crime' ? 'active' : ''}>
                        <span role="img" aria-label="siren">🚨</span> Crime
                    </button>
                    <button type="button" onClick={() => setView('Taxation')} className={view === 'Taxation' ? 'active' : ''}>
                        <span role="img" aria-label="cashbag">💰</span> Taxes
                    </button>
                    <button type="button" onClick={() => setView('funds')} className={view === 'funds' ? 'active' : ''}>
                        <span role="img" aria-label="flyingmoney">💸</span> Funds
                    </button>
                </div>
            </div>
        </div>
        {
            view === 'funds' ? <div className="col-2">
                <div>
                    <TreasuryReport></TreasuryReport>
                </div>
                <div>
                </div>
            </div> : view === 'Crime' ? <div>
                <CrimeDetailList></CrimeDetailList>
            </div> : <LawDetailList 
                group={view}
            ></LawDetailList>
        }
    </div>
}

export const CrimeDetailList: React.FC<{

}> = (props) => {
    const topRow: CrimeKey[] = ['steal', 'rob', 'profanity'];
    const bRow: CrimeKey[] = ['murder', 'hurt', 'destroy'];
    return <div className="pad-4p">
        <strong>Criminal Laws</strong>
        <div className="horizontal scroll">
            {
                topRow.map(c => {
                    return <CrimeDetail key={c} crime={c}></CrimeDetail>
                })
            }
        </div>
        <br/>
        <div className="horizontal scroll">
            {
                bRow.map(c => {
                    return <CrimeDetail key={c} crime={c}></CrimeDetail>
                })
            }
        </div>
    </div>
}
const CrimeDetail: React.FC<{
    crime: CrimeKey
}> = (props) => {
    return <div key={props.crime}>
    <div className="horizontal">
        <div className="circular">
            {CrimeData[props.crime].icon} 
        </div>
        <div>
            <strong>
            {CrimeData[props.crime].name}
            </strong><br/>
            <small>
            {CrimeData[props.crime].description}
            </small>
        </div>
    </div>
    <div>
        <LegalitySwitch crime={props.crime}></LegalitySwitch>
    </div>
</div>
}
const legalOptions: Array<{
    icon: string,
    text: string,
    value: CrimePunishment|'none',
    onClick: () => void
}> = [
    {
        icon: '✔️',
        text: 'Legal',
        value: 'none',
        onClick: () => {}
    },
    {
        icon: '💸',
        text: 'Fine',
        value: 'fine',
        onClick: () => {}
    },
    {
        icon: '🚨',
        text: 'Jail',
        value: 'jail',
        onClick: () => {}
    },
    {
        icon: '☠️',
        text: 'Death',
        value: 'death',
        onClick: () => {}
    },
]
export const LegalitySwitch: React.FC<{
    crime: CrimeKey
}> = (props) => {
    const legality = useAppSelector(x => x.world.law.crimes[props.crime]);
    const dispatch = useAppDispatch()
    const opts = legalOptions.map(x => {
        return {
            ...x,
            onClick: () => {
                dispatch(setCrimeLegality({
                    crime: props.crime,
                    legality: x.value
                }));
            }
        }
    });
    return <Subtabs active={legality || 'none'} options={opts}></Subtabs>
}

export const LawDetailList: React.FC<{
    group: LawGroup
}> = (props) => {
    const laws = Object.values(LawData).filter(x => x.group === props.group);
    const seenBeliefs = useAppSelector(s => s.world.alien.seenBeliefs);
    const beliefs = useAppSelector(s => s.world.alien.beliefInventory);
    const law = useAppSelector(s => s.world.law);
    const dispatch = useAppDispatch();
    return <div className="pad-4p">
        <strong>{props.group} Laws</strong>
        <div className="horizontal scroll">
        {
            laws.map((x) => <LawFormula seenBeliefs={seenBeliefs} id={x.key} beliefs={beliefs} key={x.key} enacted={IsLaw(law, x.key)}
                enactLaw={(lKey) => dispatch(enactLaw({lawKey: lKey}))} revokeLaw={(l) => dispatch(repealLaw({lawKey: l}))}>
            </LawFormula>)
        }
        </div>
    </div>
}


export const LawFormula: React.FC<{
    id: LawKey,
    seenBeliefs: {[belief: string]: boolean},
    beliefs: BeliefInventory[],
    enacted: boolean,
    enactLaw: (l: LawKey) => void
    revokeLaw: (l: LawKey) => void
}> = (props) => {
    const law = LawData[props.id];
    const canSeeName = PlayerCanSeePrereqs(law.prereqs, props.seenBeliefs);
    const unlocked = PlayerMeetsPrereqs(law.prereqs, props.seenBeliefs);
    return <div className="vertical law-formula">
        <div className="horizontal">
            <div className="circular">
                {canSeeName ? law.icon : '❔'}
            </div>
            <div>
                <strong>
                    {canSeeName ? law.name : 'Unknown'}
                </strong>
                <div>
                    {
                        canSeeName ? <small> {law.description} </small> : null
                    }
                </div>
            </div>
        </div>
        <div className="vertical">
            {
                law.prereqs.map((x) => {
                    const has = PlayerKnowsPrereq(x, props.seenBeliefs);
                    const key = PrereqKey(x);
                    return !has ? <span className="law-formula-ingredient unknown" key={key}>
                        <span role="img" aria-label="question">❔</span> Unknown
                    </span> : <span className="law-formula-ingredient" key={key}>
                        {PrereqString(x)}
                    </span>
                })
            }
        </div>
        {
            props.enacted ? <button className="callout"  onClick={() => props.revokeLaw(props.id)}>
                <span role="img" aria-label="trash">🗑️</span>&nbsp;Revoke Active Law
            </button> : <button className="callout" disabled={!unlocked} onClick={() => props.enactLaw(props.id)}>
                {
                    unlocked ? '✒️' : <span className="grey"><span role="img" aria-label="lock">🔒</span></span>
                }
                &nbsp;Enact
            </button>
        }
        {props.children}
    </div>;
}