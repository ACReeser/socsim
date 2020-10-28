import React from "react";
import { ResourceTriad } from "../Game";

export class CostSmall extends React.Component<{
    cost: ResourceTriad
}>{

    render(){
        const costs: string[] = []; 
        if (this.props.cost.energy){
            costs.push('-'+this.props.cost.energy+' Energy');
        }
        if (this.props.cost.bots){
            costs.push('-'+this.props.cost.bots+' Bots');
        }
        if (this.props.cost.psi){
            costs.push('-'+this.props.cost.psi+' Psi');
        }
        return <small>
            {costs.join(' ')}
        </small>
    }
}