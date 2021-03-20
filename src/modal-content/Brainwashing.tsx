import React from "react";
import { BeliefSubject, BeliefVerb, TraitBelief, SecondaryBeliefData, Belief, PrimaryBeliefData, NarrativeBeliefData, IsBeliefDivergent } from "../simulation/Beliefs";
import './modals.css';
import { TraitCommunity, TraitFaith, TraitIdeals, World } from "../World";
import { AddBeliefInput, EditBeliefInput } from "./BeliefRow";
import { Bean } from "../simulation/Bean";

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
        const bean = this.props.world.beans.find(x => x.key == this.props.beanID);
        if (bean == null) return;
        const dogmatic = bean.believesIn('Dogmatism');
        return <div>
            <div className="horizontal fancy-header">
                <div>
                    BRAIN
                </div>
                <div className="emoji-3">
                💉🧠🚿
                </div>
                <div>
                    WASH
                </div>
            </div>
            <div>
                <div className="text-center">
                    <strong>{bean.name}</strong> has {bean.discrete_sanity.toFixed(0)} sanity 🧠
                </div>
                {
                    dogmatic ? <div className="text-center">
                        🐶 Dogmatic subjects cannot change their minds
                    </div> : null
                }
                <div className="horizontal">
                    <div>
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
                            bean.beliefs.map((b) => <EditBeliefInput
                            available={bean.discrete_sanity} frozen={dogmatic && b != 'Dogmatism'}
                            divergent={IsBeliefDivergent(b, this.props.world.party.ideals, this.props.world.party.community)}
                            wash={() => this.props.washBelief(bean, b)} 
                                cost={this.props.world.alien.difficulty.cost.bean_brain.brainwash_secondary.sanity || 0}
                                data={SecondaryBeliefData[b]}
                            >
                            </EditBeliefInput>)
                        }
                        {
                            dogmatic ? null : <AddBeliefInput
                                available={bean.discrete_sanity}
                                add={(b) => this.props.implantBelief(bean, b)} 
                                cost={this.props.world.alien.difficulty.cost.bean_brain.brainimplant_secondary.sanity || 0}
                            ></AddBeliefInput>
                        }
                    </div>
                </div>
            </div>
        </div>
    }
}