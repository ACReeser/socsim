import { ReactComponent } from "*.svg";
import React from "react";
import { keyToName } from "../i18n/text";
import { Bean } from "../simulation/Bean";
import { NarrativeBeliefData, PrimaryBeliefData } from "../simulation/Beliefs";
import { Trait, TraitIcon } from "../World";

export class CardButton extends React.Component<{
    icon: string,
    name: string,
    onClick?: () => void,
    title?: string,
    subtext?: string,
    thin?: boolean,
    singleLine?: boolean,
    disabled?: boolean
}>{
    render(){
        let classes = "card button";
        if (this.props.thin) classes += ' thin';
        if (this.props.singleLine) classes += ' single';
        return <button className={classes} title={this.props.title} onClick={() => {
            if (this.props.onClick) this.props.onClick()
        }} type="button" disabled={this.props.disabled}>
            {this.props.icon} {this.props.name}
            {
                (this.props.subtext != null) ? <small>{this.props.subtext}</small> : null
            }
        </button>
    }
}

export function TraitToCard(bean: Bean, trait: Trait, onClick?: () => void){
    switch(trait){
        case 'trad':
        case 'prog':
        case 'ego':
        case 'state':
            return <CardButton icon={TraitIcon[trait]} title={PrimaryBeliefData[trait].description} name="" subtext={keyToName[trait]} thin={true} singleLine={true} onClick={onClick}></CardButton>
        case 'fresh':
        case 'sick':
        case 'hungry':
        case 'starving':
        case 'stuffed':
        case 'homeless':
        case 'rested':
        case 'circle':
        case 'square':
        case 'triangle':
        case 'sane':
        case 'disturbed':
        case 'stressed':
            return <CardButton icon={TraitIcon[trait]} title={keyToName[trait]} name="" subtext={keyToName[trait]} thin={true} singleLine={true} onClick={onClick}></CardButton>
        case 'noFaith':
        case 'rocket':
        case 'dragon':
        case 'music':
            return <CardButton icon={TraitIcon[trait]} title={NarrativeBeliefData[trait].description} name="" subtext={keyToName[trait]} thin={true} singleLine={true} onClick={onClick}></CardButton>
        default:
            return null;
    }
} 