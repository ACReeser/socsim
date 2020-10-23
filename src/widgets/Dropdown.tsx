import React, { ChangeEvent } from "react";
import { City } from "../simulation/City";

export interface DropdownPS<T>{
    options: Array<T&{key: any}>,
    onChange: (key: any) => void,
    hint?: string,
    value?: any
}
interface DropdownS{
    key: any;
}

export abstract class Dropdown<T> extends React.Component<DropdownPS<T>, DropdownS> {
    constructor(props: any) {
        super(props);
        this.state = {
            key: props.value || null
        }
    }
    onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.target.value);
    }
    hint(){
        if (this.props.hint){
            return <option value="" disabled selected hidden>{this.props.hint}</option>
        } 
        return undefined;
    }
    abstract getTextForOption(data: T): string;
    options(){
        return this.props.options.map((o) => {
            return <option value={o.key} key={o.key} title={this.getTitleForOption(o)}>
                {this.getTextForOption(o)}
            </option>
        })
    }
    render(){
        return <select onChange={this.onChange} value={this.state.key} required={this.props.hint != null}>
            {this.hint()}
            {this.options()}
        </select>
    }
    protected getTitleForOption(data: T): string|undefined{
        return undefined;
    }
}
export class CityDropdown extends Dropdown<City>{
    getTextForOption(data: City): string{
        return data.name;
    }
}