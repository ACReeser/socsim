import React from "react";
import { PlayerResources, triadToString } from "../Game";

export class CostSmall extends React.Component<{
    cost: PlayerResources,
    qty?: number
}>{

    render(){
        return <small>
            {triadToString(this.props.cost, '-', this.props.qty)}
        </small>
    }
}