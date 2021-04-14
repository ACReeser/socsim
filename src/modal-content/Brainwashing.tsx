import React, { useEffect, useState } from "react";
import { BeliefSubject, BeliefVerb, TraitBelief, SecondaryBeliefData, Belief, PrimaryBeliefData, NarrativeBeliefData, IsBeliefDivergent } from "../simulation/Beliefs";
import './modals.css';
import { EmoteIcon, TraitCommunity, TraitFaith, TraitIdeals, World } from "../World";
import { AddBeliefInput, BeliefWidget, EditBeliefInput } from "./BeliefRow";
import { Bean } from "../simulation/Bean";
import { LiveList } from "../events/Events";
import { BeliefInventory } from "../simulation/Player";
import { ConfirmButton } from "../widgets/ConfirmButton";

export const TraitInventoryList: React.FC<{
    dogmatic: boolean,
    live: LiveList<BeliefInventory>,
    implant: (t: TraitBelief) => void
}> = (props) => {
    const [list, setList] = useState(props.live.get);
    const onChange = (b: BeliefInventory[]) => {
        setList(b);
    };
    useEffect(() => {
        props.live.onChange.subscribe(onChange);
        return () => props.live.onChange.unsubscribe(onChange)
    });

    return <>
        {list.map((x) => <BeliefWidget 
        key={x.trait} data={SecondaryBeliefData[x.trait]} titleView={<strong>{SecondaryBeliefData[x.trait].noun}</strong>}
        leftButton={
            <ConfirmButton onConfirm={() => props.implant(x.trait)} className="callout marg-0" confirmText="-1 🧠?" disabled={x.charges < 1 || props.dogmatic}>
                Implant
            </ConfirmButton>
        }
        bottomView={<span>{x.charges} 🧠</span>}>
        </BeliefWidget>)}
    </>
};

export class BrainwashingContent extends React.Component<{
    world: World,
    beanID: number|null,
    washCommunity: (bean: Bean, c: TraitCommunity) => void,
    washMotive: (bean: Bean, m: TraitIdeals) => void,
    washNarrative: (bean: Bean, n: TraitFaith) => void,
    washBelief: (bean: Bean, b: TraitBelief) => void,
    implantBelief: (bean: Bean, b: TraitBelief) => void
}, {
}>{
    constructor(props: any){
        super(props);
    }
    render(){
        const bean = this.props.world.beans.get.find(x => x.key == this.props.beanID);
        const isScanned =  this.props.beanID && this.props.world.alien.scanned_bean[this.props.beanID];
        const sanityCostBonus = this.props.world.alien.hasResearched('sanity_bonus') ? -1 : 0;
        if (bean == null) return <div></div>;
        const dogmatic = bean.believesIn('Dogmatism');
        return <div>
            <div className="horizontal fancy-header">
                <div>
                    BRAIN
                </div>
                <div className="emoji-3">
                🧠🚿
                </div>
                <div>
                    WASH
                </div>
            </div>
            <div>
                <p className="pad-4p">
                    <strong>{bean.name}</strong> has {bean.discrete_sanity.toFixed(0)} sanity 🧠. 
                    {
                        bean.sanity === 'stressed' || bean.sanity === 'disturbed' ?
                            <small className="pull-r">(Low sanity 🧠 causes {EmoteIcon['unhappiness']}; Negative sanity 🧠 causes extremely negative traits)</small>
                        : null
                    }
                </p>
                {
                    dogmatic ? <div className="text-center">
                        🐶 Dogmatic subjects cannot change their minds
                    </div> : null
                }
                { isScanned ? <div className="horizontal scroll">
                    <EditBeliefInput
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
                    ></EditBeliefInput>
                    <EditBeliefInput
                        available={bean.discrete_sanity} frozen={dogmatic}
                        wash={() => this.props.washNarrative(bean, bean.faith)} 
                        cost={this.props.world.alien.difficulty.cost.bean_brain.brainwash_ideal.sanity || 0}
                        data={NarrativeBeliefData[bean.faith]}
                    ></EditBeliefInput>
                    {
                        bean.beliefs.map((b) => <EditBeliefInput key={b}
                        available={bean.discrete_sanity} frozen={dogmatic && b != 'Dogmatism'}
                        divergent={IsBeliefDivergent(b, this.props.world.party.ideals, this.props.world.party.community)}
                        wash={() => this.props.washBelief(bean, b)} 
                            cost={(this.props.world.alien.difficulty.cost.bean_brain.brainwash_secondary.sanity || 0) + sanityCostBonus}
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
                    🧠 Trait Inventory
                </h3>
                <div className="horizontal scroll">
                    <TraitInventoryList 
                        live={this.props.world.alien.beliefInventory} 
                        dogmatic={dogmatic} 
                        implant={(t: TraitBelief) => this.props.implantBelief(bean, t)}></TraitInventoryList>
                </div>
            </div>
        </div>
    }
}