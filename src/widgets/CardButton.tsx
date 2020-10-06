import { ReactComponent } from "*.svg";
import React from "react";
import { keyToName } from "../App";
import { Bean } from "../Bean";
import { Trait, TraitIcon } from "../World";

export class CardButton extends React.Component<{
    icon: string,
    name: string,
    onClick?: () => void,
    title?: string,
    subtext?: string,
    thin?: boolean
}>{
    render(){
        let classes = "card button";
        if (this.props.thin) classes += ' thin';
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
            return <CardButton icon={TraitIcon[trait]} name="" subtext={keyToName[trait]} thin={true} onClick={onClick}></CardButton>
        default:
            return null;
    }
} 