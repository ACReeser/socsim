import React from "react";
import { BeanBelievesIn, BeanGetFace } from "../simulation/Bean";
import { NarrativeBeliefData, SecondaryBeliefData } from "../simulation/Beliefs";
import { HasResearched } from "../simulation/Player";
import { extractBelief, implant, washBelief, washNarrative } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectSelectedBean } from "../state/state";
import { ConfirmButton } from "../widgets/ConfirmButton";
import { EmoteIcon } from "../World";
import { BeliefWidget, EditBeliefInput } from "./BeliefRow";
import './modals.css';

export const TraitInventoryList: React.FC<{
    dogmatic: boolean,
    beanKey: number
}> = (props) => {
    const beliefInventory = useAppSelector(x => x.world.alien.beliefInventory);
    const dispatch = useAppDispatch();
    return <>
        {beliefInventory.map((x) => <BeliefWidget 
        key={x.trait} data={SecondaryBeliefData[x.trait]} titleView={<strong>{SecondaryBeliefData[x.trait].noun}</strong>}
        leftButton={
            <ConfirmButton onConfirm={() => dispatch(implant({beanKey: props.beanKey, trait: x.trait}))} className="callout marg-0" confirmText="-1 🧠?" disabled={x.charges < 1 || props.dogmatic}>
                Implant
            </ConfirmButton>
        }
        bottomView={<span><span className="trait-gem"></span>x{x.charges}</span>}>
        </BeliefWidget>)}
    </>
};

export const BrainwashingContent: React.FC<{
}> = () => {
    const bean = useAppSelector(selectSelectedBean);
    const isScanned = useAppSelector(s => bean?.key != null && s.world.alien.scanned_bean[bean.key]);
    const difficulty = useAppSelector(s => s.world.alien.difficulty);
    const techProgress = useAppSelector(s => s.world.alien.techProgress);
    const dispatch = useAppDispatch();
    const sanityCostBonus = HasResearched(techProgress, 'sanity_bonus') ? -1 : 0;
    if (bean == null) return <div></div>;
    const dogmatic = BeanBelievesIn(bean, 'Dogmatism');
    const brains = [];
    for (let i = 1; i < 11; i++) {
        brains.push(bean.discrete_sanity >= i ? '🧠': '😵');
    }
    return <div>
        <div className="horizontal fancy-header">
            <div>
            🧠🚿 BRAINWASH
            </div>
            <div>
                <strong>{BeanGetFace(bean)} {bean.name}</strong>
            </div>
            <div>
                <table className="trait-measure">
                    <tbody>
                    <tr>
                        {
                            brains.map((x, i) => <td key={i} className={x === '😵' ? 'grey' : ''}>{x}</td>)
                        }
                    </tr>
                    <tr>
                        <td colSpan={2} className="set-1"><small>Psychotic</small></td>
                        <td colSpan={2} className="set-2"><small>Disturbed</small></td>
                        <td colSpan={3} className="set-3"><small>Stressed</small></td>
                        <td colSpan={3} className="set-4"><small>Sane</small></td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <p className="pad-4p text-center">
            {
                bean.sanity != 'sane' ?
                    <small>Low sanity 🧠 causes {EmoteIcon['unhappiness']}! Negative sanity 🧠 causes extremely negative traits!</small>
                : null
            }
        </p>
        <div style={{clear: 'both'}}>
            {
                dogmatic ? <div className="text-center">
                    🐶 Dogmatic subjects cannot change their minds
                </div> : null
            }
            { isScanned ? <div className="horizontal scroll">
                {/* <EditBeliefInput
                    available={bean.discrete_sanity} frozen={dogmatic}
                    wash={() => this.props.washCommunity(bean, bean.community)} 
                    cost={this.props.world.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0}
                    data={PrimaryBeliefData[bean.community]}
                ></EditBeliefInput>
                <EditBeliefInput
                    available={bean.discrete_sanity}  frozen={dogmatic}
                    wash={() => this.props.washMotive(bean, bean.ideals)} 
                    cost={this.props.world.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0}
                    data={PrimaryBeliefData[bean.ideals]}
                ></EditBeliefInput> */}
                <EditBeliefInput
                    available={bean.discrete_sanity} frozen={dogmatic}
                    wash={() => dispatch(washNarrative({beanKey: bean.key, faith:bean.faith}))} 
                    extract={() => {
                        
                    }} 
                    cost={difficulty.cost.bean_brain.brainwash_ideal.sanity || 0}
                    data={NarrativeBeliefData[bean.faith]}
                ></EditBeliefInput>
                {/* IsBeliefDivergent(b, this.props.world.party.ideals, this.props.world.party.community) */}
                {
                    bean.beliefs.map((b) => <EditBeliefInput key={b}
                    available={bean.discrete_sanity} frozen={dogmatic && b != 'Dogmatism'}
                    divergent={false}
                    wash={() => dispatch(washBelief({beanKey: bean.key, trait: b}))} 
                    extract={() => dispatch(extractBelief({beanKey: bean.key, trait: b}))} 
                        cost={(difficulty.cost.bean_brain.brainwash_secondary.sanity || 0) + sanityCostBonus}
                        data={SecondaryBeliefData[b]}
                    >
                    </EditBeliefInput>)
                }
                {/* {
                    dogmatic ? null : <AddBeliefInput
                        available={bean.discrete_sanity}
                        add={(b) => this.props.implantBelief(bean, b)} 
                        cost={this.props.world.alien.difficulty.cost.bean_brain.brainimplant_secondary.sanity || 0}
                    ></AddBeliefInput>
                } */}
            </div> : <div className="text-center">🛰️ Scan this subject to reveal its Traits! </div>}
            <h3 className="pad-4p">
                <span className="trait-gem"></span> Trait Gems
            </h3>
            <div className="horizontal scroll">
                <TraitInventoryList beanKey={bean.key}
                    dogmatic={dogmatic}></TraitInventoryList>
            </div>
        </div>
    </div>
}