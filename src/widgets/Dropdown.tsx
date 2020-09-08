import React from "react";
import { City } from "../World";

export interface DropdownPS<T>{
    options: Array<T&{key: any}>
}
interface DropdownS{

}

export abstract class Dropdown<T> extends React.Component<DropdownPS<T>, DropdownS> {
    constructor(props: any) {
        super(props);

    }
    abstract getTextForOption(data: T): string;
    options(){
        return this.props.options.map((o) => {
            return <option value={o.key}>{this.getTextForOption(o)}</option>
        })
    }
    render(){
        return <select>
            {this.options()}
        </select>
    }
}
export class CityDropdown extends Dropdown<City>{
    getTextForOption(data: City): string{
        return data.name;
    }
}