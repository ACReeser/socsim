import React, { ChangeEvent } from "react";

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
