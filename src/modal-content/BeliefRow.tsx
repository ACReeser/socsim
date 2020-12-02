import React from "react";
import './beliefs.css';
import { BeliefSubject, BeliefVerb, SecondaryBeliefData, TraitBelief, Belief, BeliefSubjectOption, BeliefVerbOption, BeliefAdjOption, BeliefsAll, BeliefSubjectAll, BeliefVerbAll, IBeliefData } from "../simulation/Beliefs";

import { BeliefSubjectDropdown, OtherVerbDropdown, SelfVerbDropdown, StringDropdown } from "../widgets/StringDropdown";

export class EditBeliefInput extends React.Component<{
    data: IBeliefData
}, {

}>{

    render(){
        return <div className="belief"><div className="horizontal badger">
            <div className="circular">
                {this.props.data.icon}
            </div>
            <div className="vertical">
                <div className="text-center">
                    <strong title={this.props.data.description}>
                        {this.props.data.noun}
                    </strong>
                </div>
                <small>{this.props.data.description}</small>
                <div>
                </div>
            </div>
            <button className="callout grow-0 pad-4 marg-0">
                🚿 <small>Warp</small>
            </button>
        </div></div>
    }
}

const SortedBeliefs = BeliefsAll.slice().sort((a, b) => a.localeCompare(b));
export class AddBeliefInput extends React.Component<{
}, {
    belief: TraitBelief
}>{
    constructor(props: any){
        super(props);
        this.state = {
            belief: 'Paranoia'
        }
    }
    render(){
        const data = SecondaryBeliefData[this.state.belief]
        return <div className="belief"><div className="horizontal badger add">
            <div className="circular">
                {data.icon}
            </div>
            <div className="vertical">
                <div className="text-center">                    
                    <StringDropdown titleCase={true}
                    options={SortedBeliefs} 
                    value={this.state.belief}
                    onChange={(a: string) => {
                        console.log(a);
                        this.setState({belief: a as TraitBelief})
                    }}
                    ></StringDropdown>
                </div>
                <small>{data.description}</small>
            </div>
            <button className="callout grow-0 pad-4 marg-0">
                💉 <small>Implant</small>
            </button>
        </div></div>
    }
}