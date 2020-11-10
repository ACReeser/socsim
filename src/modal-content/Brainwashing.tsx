import React from "react";
import { BeliefAdjDropdown, BeliefSubjectDropdown, SelfVerbDropdown } from "../widgets/Dropdown";
import { BeliefSubject, BeliefVerb, TraitBelief, BeliefAdjData } from "../simulation/Beliefs";
import './modals.css';
import { World } from "../World";

export class BrainwashingContent extends React.Component<{
    world: World
}, {

}>{
    render(){
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
                <div className="horizontal">
                    <button className="callout grow-0 pad-4 marg-0">
                        🚿 <small>Warp Belief</small>
                    </button>
                    <div>
                        <BeliefSubjectDropdown options={[{key:'self' as BeliefSubject}, {key:'other' as BeliefSubject}]}
                        onChange={() => {}}
                        ></BeliefSubjectDropdown>
                        <SelfVerbDropdown options={[{key:'are' as BeliefVerb}, {key:'arenot' as BeliefVerb}]}
                        onChange={() => {}}
                        ></SelfVerbDropdown>
                        <BeliefAdjDropdown options={Object.keys(BeliefAdjData).map((x) => {return {key: x as TraitBelief}})}
                        onChange={() => {}}
                        ></BeliefAdjDropdown>
                    </div>
                    <div>
                        Crime chance +25%
                    </div>
                    <div>
                    </div>
                </div>
                <div className="horizontal">
                    <button className="callout grow-0 pad-4 marg-0">
                        💉 <small>Implant Belief</small>
                    </button>
                    <div>
                        Redheads
                        should be
                        greedy
                    </div>
                    <div>
                        Will never report Redhead Crime
                    </div>
                </div>
            </div>
        </div>
    }
}