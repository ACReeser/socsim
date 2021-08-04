import React from "react";
import { Bean } from "../simulation/Bean";
import { Trait } from "../World";
import { keyToName } from "../i18n/text";
import { IBean } from "../simulation/Agent";

export class NeedReadout extends React.Component<{
    beans: IBean[], 
    need: (b: IBean) => Trait, 
    dire: Trait, 
    abundant: Trait,
    className?: string}> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    header(){
        if (this.props.children){
            return <b>{this.props.children}</b>;
        } else {
            return null;
        }
    }
    render(){
        const dire = this.props.beans.filter(b => this.props.need(b) == this.props.dire).length;
        const dire_style = {
            width: Math.floor((dire / this.props.beans.length)*100)+'%'
        }
        const full = this.props.beans.filter(b => this.props.need(b) == this.props.abundant).length;
        const full_style = {
            width: Math.floor((full / this.props.beans.length)*100)+'%'
        }
        return (                
        <div className={this.props.className}>
            {this.header()}
            {/* <span>{keyToName[this.props.report.winner]}</span> */}
            <div className="bar">
                <div className="bar-inner dire" style={dire_style}>
                    {(dire > 0 ? `${dire} ${keyToName[this.props.dire]}`: '')}
                </div>
                <div className="bar-inner abundant" style={full_style}>
                    {full > 0 ? full : ''}
                </div>
            </div>
        </div>
        )
    }
}