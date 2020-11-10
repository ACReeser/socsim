import React from "react";
import { BeliefSubject, BeliefVerb, BeliefAdjData, TraitBelief, BeliefSubjectOptions, BeliefOptions, BeliefVerbOptions, Belief } from "../simulation/Beliefs";
import { BeliefAdjDropdown, BeliefSubjectDropdown, OtherVerbDropdown, SelfVerbDropdown } from "../widgets/Dropdown";

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
            options={BeliefVerbOptions} 
            value={this.state.verb}
            onChange={(v) => {this.setState({verb: v as BeliefVerb}, () => this.props.change(this.state));}}
        ></OtherVerbDropdown>
    };
    render_verbs_self(){
        return <SelfVerbDropdown 
            options={BeliefVerbOptions}
            value={this.state.verb}
            onChange={(v) => {this.setState({verb: v as BeliefVerb}, () => this.props.change(this.state));}}
        ></SelfVerbDropdown>
    }
    
    render(){
        return <div>
            <BeliefSubjectDropdown options={BeliefSubjectOptions} value={this.state.subject}
            onChange={(e) => { this.setState({subject: e as BeliefSubject}, () => this.props.change(this.state));}}
            ></BeliefSubjectDropdown>
            {this.state.subject == 'self' ? this.render_verbs_self(): this.render_verbs_other()}
            <BeliefAdjDropdown options={BeliefOptions} value={this.state.adj}
            onChange={(a) => {this.setState({adj: a as TraitBelief}, () => this.props.change(this.state));}}
            ></BeliefAdjDropdown>
        </div>
    }
}