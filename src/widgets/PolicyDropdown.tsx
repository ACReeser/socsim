import React from "react";
import { IPolicy } from "../simulation/Politics";
import { Dropdown } from "./Dropdown";
import { TraitIcon } from "../World";

export class PolicyDropdown extends Dropdown<IPolicy|undefined>{
    getTextForOption(data: IPolicy): string{
        return `${data.name} ${data.community ? TraitIcon[data.community]: ''}${data.ideals ? TraitIcon[data.ideals]: ''}`;
    }
    getTitleForOption(data: IPolicy): string|undefined{
        return data.hint;
    }
}