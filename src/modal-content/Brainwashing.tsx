import React from "react";
import { BeliefSubject, BeliefVerb, TraitBelief, SecondaryBeliefData, Belief, PrimaryBeliefData, NarrativeBeliefData } from "../simulation/Beliefs";
import './modals.css';
import { TraitIcon, World } from "../World";
import { AddBeliefInput, EditBeliefInput } from "./BeliefRow";
import { Bean } from "../simulation/Bean";

export class BrainwashingContent extends React.Component<{
    world: World,
    beanID: number|null
}, {
    newBelief: Belief
}>{
    constructor(props: any){
        super(props);
        this.state = {
            newBelief: {
                subject: 'other',
                verb: 'are',
                adj: 'Paranoia'
            }
        }
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
                            data={PrimaryBeliefData[bean.community]}
                        ></EditBeliefInput>
                        <EditBeliefInput
                            data={PrimaryBeliefData[bean.ideals]}
                        ></EditBeliefInput>
                        <EditBeliefInput
                            data={NarrativeBeliefData[bean.faith]}
                        ></EditBeliefInput>
                        {
                            bean.beliefs.map((b) => <EditBeliefInput
                                data={SecondaryBeliefData[b]}
                            >
                            </EditBeliefInput>)
                        }
                        <AddBeliefInput
                        ></AddBeliefInput>
                    </div>
                </div>
            </div>
        </div>
    }
}