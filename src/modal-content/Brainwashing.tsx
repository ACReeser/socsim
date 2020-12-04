import React from "react";
import { BeliefSubject, BeliefVerb, TraitBelief, SecondaryBeliefData, Belief, PrimaryBeliefData, NarrativeBeliefData } from "../simulation/Beliefs";
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
                <div>
                    <strong>{bean.name}</strong> believes in:
                </div>
                <div className="horizontal">
                    <div>
                        <EditBeliefInput
                            available={this.props.world.alien.psi.amount}
                            wash={() => this.props.washCommunity(bean, bean.community)} 
                            cost={this.props.world.alien.difficulty.cost.bean.brainwash_ideal.psi || 0}
                            data={PrimaryBeliefData[bean.community]}
                        ></EditBeliefInput>
                        <EditBeliefInput
                            available={this.props.world.alien.psi.amount}
                            wash={() => this.props.washMotive(bean, bean.ideals)} 
                            cost={this.props.world.alien.difficulty.cost.bean.brainwash_ideal.psi || 0}
                            data={PrimaryBeliefData[bean.ideals]}
                        ></EditBeliefInput>
                        <EditBeliefInput
                            available={this.props.world.alien.psi.amount}
                            wash={() => this.props.washNarrative(bean, bean.faith)} 
                            cost={this.props.world.alien.difficulty.cost.bean.brainwash_ideal.psi || 0}
                            data={NarrativeBeliefData[bean.faith]}
                        ></EditBeliefInput>
                        {
                            bean.beliefs.map((b) => <EditBeliefInput
                            available={this.props.world.alien.psi.amount}
                            wash={() => this.props.washBelief(bean, b)} 
                                cost={this.props.world.alien.difficulty.cost.bean.brainwash_secondary.psi || 0}
                                data={SecondaryBeliefData[b]}
                            >
                            </EditBeliefInput>)
                        }
                        <AddBeliefInput
                            available={this.props.world.alien.psi.amount}
                            add={(b) => this.props.implantBelief(bean, b)} 
                            cost={this.props.world.alien.difficulty.cost.bean.brainimplant_secondary.psi || 0}
                        ></AddBeliefInput>
                    </div>
                </div>
            </div>
        </div>
    }
}