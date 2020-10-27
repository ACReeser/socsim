import { ReactComponent } from "*.svg";
import React from "react";
import { keyToName } from "../App";
import { Bean } from "../simulation/Bean";
import { Trait, TraitIcon } from "../World";

export class CardButton extends React.Component<{
    icon: string,
    name: string,
    onClick?: () => void,
    title?: string,
    subtext?: string,
    thin?: boolean,
    singleLine?: boolean
}>{
    render(){
        let classes = "card button";
        if (this.props.thin) classes += ' thin';
        if (this.props.singleLine) classes += ' single';
        return <button className={classes} title={this.props.title} onClick={() => {
            if (this.props.onClick) this.props.onClick()
        }} type="button">
            {this.props.icon} {this.props.name}
            {
                (this.props.subtext != null) ? <small>{this.props.subtext}</small> : null
            }
        </button>
    }
}

export function TraitToCard(bean: Bean, trait: Trait, onClick?: () => void){
    switch(trait){
        case 'ego':
        case 'state':
        case 'fresh':
        case 'sick':
        case 'trad':
        case 'prog':
        case 'hungry':
        case 'stuffed':
        case 'podless':
        case 'homeowner':
        case 'circle':
        case 'square':
        case 'triangle':
        case 'sane':
        case 'confused':
        case 'mad':
            return <CardButton icon={TraitIcon[trait]} title={keyToName[trait]} name="" subtext={keyToName[trait]} thin={true} singleLine={true} onClick={onClick}></CardButton>
        default:
            return null;
    }
} 