import React from "react";
import { TraitCommunity, TraitIcon, TraitIdeals } from "../World";

export function RenderIdealBadges(comm: Array<TraitCommunity|TraitIdeals>, effect: 'pos'|'neg'){
    return comm.map((x) => RenderIdealBadge(x, effect));
}
export function RenderIdealBadge(comm: TraitCommunity|TraitIdeals, effect: 'pos'|'neg'){
    return RenderBadge(TraitIcon[comm], effect);
}
export function RenderBadge(str: string, effect: 'pos'|'neg'){
    const c = 'badge align-mid '+effect;
    const output = `${effect === 'neg' ? '-': '+'}${str}`;
    return <span className={c} key={output}>
        {output}
    </span>
}