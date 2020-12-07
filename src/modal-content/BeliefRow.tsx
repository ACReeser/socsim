import React from "react";
import './beliefs.css';
import { BeliefSubject, BeliefVerb, SecondaryBeliefData, TraitBelief, Belief, BeliefSubjectOption, BeliefVerbOption, BeliefAdjOption, BeliefsAll, BeliefSubjectAll, BeliefVerbAll, IBeliefData } from "../simulation/Beliefs";

import { BeliefSubjectDropdown, OtherVerbDropdown, SelfVerbDropdown, StringDropdown } from "../widgets/StringDropdown";
import { TraitIcon } from "../World";
import { IDifficulty } from "../Game";

export class EditBeliefInput extends React.Component<{
    data: IBeliefData,
    frozen?: boolean,
    divergent?: boolean,
    available: number,
    cost: number,
    wash: () => void
}, {

}>{

    render(){
        return <div className="belief"><div className="horizontal badger">
            <div className="vertical">
                <div className="circular">
                    {this.props.data.icon}
                </div>
                {
                    this.props.frozen ? null : <button className="callout pad-4 marg-0" disabled={this.props.available < this.props.cost} onClick={this.props.wash}>
                    🚿 <small>Wash</small>
                    </button>
                }
            </div>
            <div className="vertical">
                <div className="text-center">
                    <strong title={this.props.data.description} className={this.props.divergent ? 'divergent marg-r-6': 'marg-r-6'}>
                        {this.props.data.noun}
                    </strong>
                    <span className="pull-r">{this.props.cost}🧠</span>
                </div>
                <small className="marg-b-6">{this.props.data.description}</small>
                <div className="grow-1 text-center">
                    {
                        (this.props.data.idealPro || []).map((x) => <span className="pos badge align-mid">+{TraitIcon[x]}</span>)
                    }
                    {
                        (this.props.data.idealCon || []).map((x) => <span className="neg badge align-mid">-{TraitIcon[x]}</span>)
                    }
                </div>
            </div>
        </div></div>
    }
}

const SortedBeliefs = BeliefsAll.slice().sort((a, b) => a.localeCompare(b));
export class AddBeliefInput extends React.Component<{
    available: number,
    cost: number,
    add: (b: TraitBelief) => void
}, {
    belief: TraitBelief,
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
            <div className="vertical">
                <div className="circular">
                    {data.icon}
                </div>
                <button className="callout grow-0 pad-4 marg-0" disabled={this.props.available < this.props.cost} 
                    onClick={() => this.props.add(this.state.belief)}>
                    💉 <small>Implant</small>
                </button>
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
                    <span className="pull-r">{this.props.cost}🧠</span>
                </div>
                <small className="marg-b-6">{data.description}</small>
                <div className="grow-1 text-center">
                    {
                        (data.idealPro || []).map((x) => <span className="pos badge align-mid">+{TraitIcon[x]}</span>)
                    }
                    {
                        (data.idealCon || []).map((x) => <span className="neg badge align-mid">-{TraitIcon[x]}</span>)
                    }
                </div>
            </div>
        </div></div>
    }
}