import React from "react";
import { ResourceTriad, triadToString } from "../Game";

export class CostSmall extends React.Component<{
    cost: ResourceTriad
}>{

    render(){
        return <small>
            {triadToString(this.props.cost, '-')}
        </small>
    }
}