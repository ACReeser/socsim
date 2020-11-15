import React from "react";
import { BeliefSubject, BeliefVerb, BeliefAdjData, TraitBelief, Belief, BeliefSubjectOption, BeliefVerbOption, BeliefAdjOption, BeliefsAll, BeliefSubjectAll, BeliefVerbAll } from "../simulation/Beliefs";

import { BeliefSubjectDropdown, OtherVerbDropdown, SelfVerbDropdown, StringDropdown } from "../widgets/StringDropdown";

export class EditBeliefInput extends React.Component<{

}, {

}>{

    render(){
        return <div>
            
        </div>
    }
}

interface NewBeliefInputP {
    change: (b: Belief) => void
}

export class NewBeliefInput extends React.Component<NewBeliefInputP, {
    subject: BeliefSubject,
    verb: BeliefVerb,
    adj: TraitBelief
}>{
    constructor(props: NewBeliefInputP) {
        super(props);
        this.state = {
            subject: 'other',
            verb: 'are',
            adj: 'afraid'
        }
    }
    render_verbs_other(){
        return <OtherVerbDropdown 
            options={BeliefVerbAll} 
            value={this.state.verb}
            onChange={(v) => {this.setState({verb: v});}}
        ></OtherVerbDropdown>
    };
    render_verbs_self(){
        return <SelfVerbDropdown 
            options={BeliefVerbAll}
            value={this.state.verb}
            onChange={(v) => {this.setState({verb: v});}}
        ></SelfVerbDropdown>
    }
    
    render(){
        return <div>
            <BeliefSubjectDropdown options={BeliefSubjectAll} value={this.state.subject}
            onChange={(e) => { this.setState({subject: e});}}
            ></BeliefSubjectDropdown>
            {this.state.subject == 'self' ? this.render_verbs_self(): this.render_verbs_other()}
            <StringDropdown titleCase={true}
            options={BeliefsAll} 
            value={this.state.adj}
            onChange={(a: string) => {
                console.log(a);
                this.setState({adj: a as TraitBelief})
            }}
            ></StringDropdown>
        </div>
    }
}