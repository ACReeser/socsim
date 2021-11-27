import React, { useState } from "react";
import { Act, ActivityDisplay, ActivityIcon, GetPriorities, IBean } from "../simulation/Agent";
import { BeanGetFace } from "../simulation/Bean";
import { SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { ICity } from "../simulation/City";
import { IPlayerData, PlayerCanAfford } from "../simulation/Player";
import { ITitle } from "../simulation/Titles";
import { doSelectCity, doSelectNone } from "../state/features/selected.reducer";
import { abduct, beanInter, beanSetTitle, scan, vaporize } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectSelectedBean, selectSelectedCity } from "../state/state";
import { CardButton, TraitToCard } from "../widgets/CardButton";
import { CostSmall } from "../widgets/CostSmall";
import { EmoteIcon, IHappinessModifier, TraitIcon } from "../World";
import './BeanPanel.css';


interface BeanPanelP{
    city: ICity,
    bean: IBean,
    alien: IPlayerData;
    brainwash: () => void;
    entitle: () => void;
}
function happyTable(mods: IHappinessModifier[]){
    return mods.filter((y) => y.mod != 0).map((x, i) => {
        return <tr key={i}>
            <td className="small text-right">{x.reason}</td>
            <td className="small">{Math.round(x.mod * 100)}%</td>
        </tr>
    });
}
function hedonTable(bean: IBean){
    return Object.keys(bean.happiness.all).map((x, i) => {
        return <tr key={i}>
            <td className="small text-right">{bean.happiness.all[x]} {bean.happiness.all[x] >= 0 ? EmoteIcon['happiness'] : EmoteIcon['unhappiness']} from </td>
            <td className="small">{x}</td>
        </tr>
    });
}
function actDurations(bean: IBean){
    const acts = Object.keys(bean.activity_duration).map((x) => x as Act);
    acts.sort((a, b) => bean.activity_duration[b] - bean.activity_duration[a]);
    return acts;
}
function beliefTable(beliefs: TraitBelief[]): React.ReactNode {
    return beliefs.map((b, i) => {
        const classes = 'belief-name shadow text-left '+SecondaryBeliefData[b].rarity;
        return <table className="width-100p" key={b+i}><tbody><tr>
        <th className={classes}>
            <span role="img" aria-label="icon">{SecondaryBeliefData[b].icon}</span> {SecondaryBeliefData[b].adj}
        </th>
        <td className="text-right">
            {(SecondaryBeliefData[b].idealPro || []).map(y => <span key={y}>+{TraitIcon[y]}</span>)}
            {(SecondaryBeliefData[b].idealCon || []).map(y => <span key={y}>-{TraitIcon[y]}</span>)}
        </td>
    </tr><tr><td className="small text-center" colSpan={2}>{
        SecondaryBeliefData[b].description ? SecondaryBeliefData[b].description?.split(';').map((x, i) => <div key={i}>{x}</div>) : null
    }</td></tr></tbody></table>});
}
function renderInner(scanned: boolean, innerView: string, bean: IBean, city: ICity, alien: IPlayerData){
    if (!scanned){
        return <div className="width-100p text-center">
            <small>
                Subject needs a Scan to reveal their thoughts
            </small>
        </div>
    }
    switch(innerView){
        case 'beliefs':
            return scanned ? beliefTable(bean.beliefs) : null
        case 'feelings':
            return <table className="width-100p"><tbody>
                {scanned ? hedonTable(bean) : null}
                </tbody>
            </table>
        default:
        case 'priorities':
            return <table className="width-100p">
                <tbody>
                    <tr>
                        <td>
                            Currently {ActivityDisplay(bean.actionData)}
                        </td>
                    </tr>
                    {
                        bean.priorities.map((x) => {
                            return <tr key={`p-${x.act}-${x.good}`}>
                                <td>
                                {x.priority.toFixed(2)} {ActivityIcon(x)}
                                </td>
                            </tr>
                        })
                    }
                    {
                        actDurations(bean).filter((x) => bean.activity_duration[x] > 0).map((x) => {
                            const act = x as Act;
                            return <tr key={act}>
                                <td>{x}</td>
                                <td>
                                    {
                                        (bean.activity_duration[act] / 1000).toFixed(1)
                                    }s
                                </td>
                            </tr>
                            
                        })
                    }
                </tbody>
            </table>
    }
}
function renderTraits(scanned: boolean, bean: IBean, alien: IPlayerData, brainwash: () => void, scan: () => void){
    if (scanned){
        return <div>
            <div className="card-parent">
                {TraitToCard(bean, bean.ethnicity, undefined)}
                {TraitToCard(bean, bean.faith, brainwash)}
            </div>
            <div className="card-parent">
                {
                    bean.beliefs.map((b) => <CardButton key={b} icon={SecondaryBeliefData[b].icon} title={SecondaryBeliefData[b].adj} name='' thin={true} singleLine={true} onClick={() => {brainwash()}}></CardButton>)
                }
            </div>
            <div className="card-parent">
                {TraitToCard(bean, bean.food, undefined)}
                {TraitToCard(bean, bean.stamina, undefined)}
                {TraitToCard(bean, bean.health, undefined)}
                {TraitToCard(bean, bean.housing, undefined)}
            </div>
        </div>
    } else {
        return <div className="card-parent">
            <CardButton icon="🛰️" name="Scan" subtext="-Energy +Info" onClick={scan} disabled={!PlayerCanAfford(alien, alien.difficulty.cost.bean.scan)}></CardButton>
        </div>
    }
}
export const BeanInnerPanel: React.FC<{
    bean: IBean,
    alien: IPlayerData,
    city: ICity
}> = (props) => {
    const [innerView, setInnerView] = useState<'priorities'|'feelings'|'beliefs'>('beliefs');
    return <div className="grow-1 pad-4 bean-panel-content">
        <div className="cylinder blue-orange horizontal">
            <button type="button" className={innerView=='beliefs'?'active':''} onClick={()=>setInnerView('beliefs')}>
                😇 Traits
            </button>
            <button type="button" className={innerView=='feelings'?'active':''} onClick={()=>setInnerView('feelings')}>
                😐 Feelings
            </button>
            <button type="button" className={innerView=='priorities'?'active':''} onClick={()=>setInnerView('priorities')}>
                💪 Priorities
            </button>
        </div>
        {renderInner(props.alien.scanned_bean[props.bean.key], innerView, props.bean, props.city, props.alien)}
    </div>
}
export const DeadBeanActions: React.FC<{
    beanKey: number
}> = (props) => {
    const dispatch = useAppDispatch();
    const graveyard = useAppSelector(s => s.world.buildings.allIDs.find(x => {
        const build = s.world.buildings.byID[x]; 
        return build.type === 'graveyard' && build.interredBeanKeys && build.interredBeanKeys.length < 6
    }));
    return <div className="bean-action-card-parent"> 
        {graveyard === undefined ? <div className="text-center">
            No ⚱️ Graveyard
        </div>: null}
        <div className="card-parent">
            <button type="button" className="button card" onClick={() => {
                if (graveyard != null){
                    dispatch(beanInter({
                        bean: props.beanKey,
                        graveyard: graveyard
                    }));
                }
            }} disabled={graveyard === undefined}
                title="Dispose of the body"
            >⚰️ Dispose
                <small>-Body</small>
            </button>
        </div>
    </div>;
}

export const BeanPanel: React.FC<BeanPanelP> = (props) => {
    const dispatch = useAppDispatch();
    const alien = useAppSelector(state => state.world.alien);
    const bean = useAppSelector(selectSelectedBean);
    const city = useAppSelector(selectSelectedCity);
    if (!bean || !city) 
        return null;
    const classes = bean.job + ' ' + bean.ethnicity;
    return (                
    <div className="vertical bean-panel">
        <div className="bean-panel-header">
            <div>
                <b>{bean.name}&nbsp;
                {
                    city ? <small> of {city.name} </small>
                    : null
                }
                </b>
                <button type="button" className="pull-r" onClick={() => {
                    dispatch(doSelectCity({cityKey:bean.cityKey}))
                }} >❌</button>
            </div>
            <div className="bean-view">                
                <span className={classes+" bean"}>
                    {
                        BeanGetFace(bean)
                    }
                </span>
            </div>
            {
                bean.titleKey != null ? <TitleView titleKey={bean.titleKey}></TitleView> : null
            }
            <div className="horizontal">
                <span className="text-center">
                    💰 ${bean.cash.toFixed(2)}
                </span>
                <span className="text-center">
                    🙂 {Math.round(bean.lastHappiness)}%
                </span>
                <span className="text-center">
                    {Math.round(bean.happiness.flatAverage)} {EmoteIcon['happiness']} /day
                </span>
            </div>
            {renderTraits(alien.scanned_bean[bean.key], bean, alien, () => {
                if (bean.lifecycle != 'dead')
                    props.brainwash();
            }, () => {
                dispatch(scan({beanKey: bean.key}));
            })}
        </div>
        {
            bean.lifecycle === 'dead' ? <div className="bean-panel-content">
                <div className="text-center">
                    <small>
                    This subject has ceased biological functions. <br/> The carbon shell requires disposal.
                    </small>
                </div>
            </div> : <BeanInnerPanel bean={bean} city={city} alien={alien}></BeanInnerPanel>
        }
        {
            bean.lifecycle === 'dead' ? <DeadBeanActions beanKey={bean.key}></DeadBeanActions> : <div className="bean-action-card-parent">
            <div className="card-parent">
                <button type="button" className="button card" onClick={() => {
                    props.brainwash()
                }}
                    title="Rewrite one of this being's traits"
                >😵 Brainwash
                    <small>-Sanity +-Trait</small>
                </button>
            </div>
            
            <TitleButton beanKey={bean.key} entitle={props.entitle}></TitleButton>
            <div className="card-parent">
                <button type="button" className="button card" onClick={() => {
                    dispatch(vaporize({beanKey: bean.key}));
                }}
                    disabled={!PlayerCanAfford(alien, alien.difficulty.cost.bean.vaporize)}
                    title="Delete this being from the experiment"
                >
                    ☠️ Vaporize
                    <CostSmall cost={alien.difficulty.cost.bean.vaporize}></CostSmall>
                </button>
            </div>
            <div className="card-parent">
                <button type="button" className="button card"
                    disabled={bean.lifecycle != 'alive' || !PlayerCanAfford(alien, alien.difficulty.cost.bean.abduct)}
                    onClick={() => dispatch(abduct({beanKey: bean.key}))}
                    title="Remove this being for study"
                >
                    👾 Abduct for Research
                    <CostSmall cost={alien.difficulty.cost.bean.abduct} rider="+Tech"></CostSmall>
                </button>
            </div>
        </div>
        }
    </div>
    )
}

export const TitleButton: React.FC<{
    beanKey: number,
    entitle: () => void
}> = (props) => {
    const titles = useAppSelector(s => s.world.titles.allIDs);
    if (titles.length > 0){
        return <div className="card-parent">
            <button type="button" className="button card"
                // disabled={bean.lifecycle != 'alive' || !PlayerCanAfford(alien, alien.difficulty.cost.bean.abduct)}
                onClick={() => props.entitle()}
                title="Give this bean a title"
            >
                👑 Give Title
                <CostSmall cost={{}} rider="+Title"></CostSmall>
            </button>
        </div>
    }
    return null
}

export const TitleView: React.FC<{
    titleKey: number
}> = (props) => {
    const title = useAppSelector(s => s.world.titles.byID[props.titleKey]);
    return <div className="text-center">
        <strong>
        {title.headwear} {title.name} {title.badge} 
        </strong>
    </div>
}