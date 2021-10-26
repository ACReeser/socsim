import React, { ReactElement } from "react";
import { BeliefsAll, IBeliefData, SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { ConfirmButton } from "../widgets/ConfirmButton";
import { StringDropdown } from "../widgets/StringDropdown";
import { TraitIcon } from "../World";
import './beliefs.css';



export const BeliefWidget: React.FC<{
    data: IBeliefData,
    cost?: number,
    leftButton?: ReactElement,
    titleView: ReactElement,
    bottomView: ReactElement
}> = (props) => {
    return <div className="belief">
        <div className="horizontal badger">
            <div className="vertical">
                <div className="circular">
                    {props.data.icon}
                </div>
                {
                    props.leftButton
                }
            </div>
            <div className="vertical">
                <div className="text-center">
                    {
                        props.titleView
                    }
                    {
                        props.cost ? 
                        <span className="pull-r">{props.cost}🧠</span>
                        : null
                    }
                </div>
                {
                props.data.description ? props.data.description.split(';').map((x, i) => 
                    <small className="marg-b-6" key={i}> {x}
                    </small>
                    ) : null
                }
                <div className="grow-1 text-center">
                    {
                       props.bottomView
                    }
                </div>
            </div>
        </div>
    </div>
}

export const EditBeliefInput: React.FC<{
    data: IBeliefData,
    frozen?: boolean,
    divergent?: boolean,
    available: number,
    cost: number,
    wash: () => void,
    extract: () => void,
}> = (props) => {
    return <div className="belief">
        <div className="horizontal edit badger">
            <div className="vertical">
                <div className="circular">
                    {props.data.icon}
                </div>
            </div>
            <div className="vertical">
                <div className="text-center">
                    <strong title={props.data.description} className={props.divergent ? 'divergent marg-r-6': 'marg-r-6'}>
                        {props.data.noun}
                    </strong>
                    <span className="pull-r">{props.cost}🧠</span>
                </div>
                <small className="marg-b-6">{props.data.description}</small>
                <div className="grow-1 text-center">
                </div>
            </div>
        </div>
        <div className="horizontal">
            {
                props.frozen ? null : <ConfirmButton className="callout pad-4 marg-0"
                    confirmText={'-'+props.cost.toString()+'🧠?'} disabled={props.available < props.cost} onConfirm={props.wash}>
                🚿 <small>Wash Out</small>
                </ConfirmButton>
            }
            {
                <ConfirmButton className="callout pad-4 marg-0"
                    confirmText={'-'+props.cost.toString()+'🧠?'} disabled={props.available < props.cost} onConfirm={props.extract}>
                💎 <small>Copy to Gem</small>
                </ConfirmButton>
            }
        </div>
    </div>
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
            belief: 'Neuroticism'
        }
    }
    render(){
        const data = SecondaryBeliefData[this.state.belief]
        return <div className="belief"><div className="horizontal badger add">
            <div className="vertical">
                <div className="circular">
                    {data.icon}
                </div>
                <ConfirmButton className="callout grow-0 pad-4 marg-0" disabled={this.props.available < this.props.cost} 
                    confirmText={'-'+this.props.cost.toString()+'🧠?'} onConfirm={() => this.props.add(this.state.belief)}>
                    💉 <small>Implant</small>
                </ConfirmButton>
            </div>
            <div className="vertical">
                <div className="text-center">                    
                    <StringDropdown titleCase={true}
                    options={SortedBeliefs} 
                    value={this.state.belief}
                    onChange={(a: string) => {
                        this.setState({belief: a as TraitBelief})
                    }}
                    ></StringDropdown>
                    <span className="pull-r">{this.props.cost}🧠</span>
                </div>
                <small className="marg-b-6">{data.description}</small>
                <div className="grow-1 text-center">
                    {
                        (data.idealPro || []).map((x) => <span className="pos badge align-mid" key={x}>+{TraitIcon[x]}</span>)
                    }
                    {
                        (data.idealCon || []).map((x) => <span className="neg badge align-mid" key={x}>-{TraitIcon[x]}</span>)
                    }
                </div>
            </div>
        </div></div>
    }
}