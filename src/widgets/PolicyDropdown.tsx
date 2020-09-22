import React from "react";
import { IPolicy } from "../Politics";
import { Dropdown } from "./Dropdown";
import { TraitCommunityIcon, TraitIdealsIcon } from "../World";

export class PolicyDropdown extends Dropdown<IPolicy|undefined>{
    getTextForOption(data: IPolicy): string{
        return `${data.name} ${data.community ? TraitCommunityIcon[data.community]: ''}${data.ideals ? TraitIdealsIcon[data.ideals]: ''}`;
    }
    getTitleForOption(data: IPolicy): string|undefined{
        return data.hint;
    }
}