import React, { ChangeEvent } from "react";
import { City } from "../World";

export interface DropdownPS<T>{
    options: Array<T&{key: any}>,
    onChange: (key: any) => void
}
interface DropdownS{
    key: any;
}

export abstract class Dropdown<T> extends React.Component<DropdownPS<T>, DropdownS> {
    constructor(props: any) {
        super(props);
        this.state = {
            key: null
        }
    }
    onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.target.value);
    }
    abstract getTextForOption(data: T): string;
    options(){
        return this.props.options.map((o) => {
            return <option value={o.key} key={o.key}>{this.getTextForOption(o)}</option>
        })
    }
    render(){
        return <select onChange={this.onChange} value={this.state.key}>
            {this.options()}
        </select>
    }
}
export class CityDropdown extends Dropdown<City>{
    getTextForOption(data: City): string{
        return data.name;
    }
}