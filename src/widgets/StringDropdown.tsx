import React, { ChangeEvent } from "react";
import { BeliefSubjectIcon, BeliefSubjectText, BeliefVerbOption, BeliefVerbIcon, BeliefVerbText, BeliefSubject, BeliefVerb } from "../simulation/Beliefs";

export interface StringDropdownPS{
    options: Array<string>,
    onChange: (key: any) => void,
    hint?: string,
    value?: any,
    titleCase?: boolean
}
interface StringDropdownS{
    key: any;
}

export class StringDropdown extends React.Component<StringDropdownPS, StringDropdownS> {
    constructor(props: any) {
        super(props);
        this.state = {
            key: props.value || null
        }
    }
    onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.target.value);
        this.setState({key: e.target.value})
    }
    hint(){
        if (this.props.hint){
            return <option value="" disabled selected hidden>{this.props.hint}</option>
        } 
        return undefined;
    }
    protected getTextForOption(data: string): string{
        if (this.props.titleCase){
            data = data[0].toUpperCase()+data.slice(1);
        }
        return data;
    }
    options(){
        return this.props.options.map((str) => {
            return <option value={str} key={str} title={this.getTitleForOption(str)}>
                {this.getTextForOption(str)}
            </option>
        })
    }
    render(){
        return <select onChange={this.onChange} value={this.state.key} required={this.props.hint != null}>
            {this.hint()}
            {this.options()}
        </select>
    }
    protected getTitleForOption(data: string): string|undefined{
        return undefined;
    }
}


export class BeliefSubjectDropdown extends StringDropdown{
    getTextForOption(data: string): string{
        return BeliefSubjectIcon[data as BeliefSubject] + ' ' +BeliefSubjectText[data as BeliefSubject];
    }
}

export class SelfVerbDropdown extends StringDropdown{
    getTextForOption(data: string): string{
        return BeliefVerbIcon[data as BeliefVerb]+' '+BeliefVerbText['self'][data as BeliefVerb];
    }
}
export class OtherVerbDropdown extends StringDropdown{
    getTextForOption(data: string): string{
        return BeliefVerbIcon[data as BeliefVerb]+' '+BeliefVerbText['other'][data as BeliefVerb];
    }
}