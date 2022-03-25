import React from "react";
import { PlayerResources, triadToString } from "../Game";

export class CostSmall extends React.Component<{
    cost: PlayerResources,
    rider?: string,
    qty?: number
}>{

    render(){
        if (this.props.cost == null)
            return "No Cost";
        return <small>
            {triadToString(this.props.cost, '-', this.props.qty)} {this.props.rider}
        </small>
    }
}