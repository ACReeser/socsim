import React from "react";
import { Bean } from "../Bean";
import { AnimatedBean } from "../AnimatedBean";
import "./SocialGraph.css";

interface SocialGraphP{
    beans: Bean[];
    costOfLiving: number;
    onClick: (b: Bean) => void
}
interface SocialGraphS{
    
}
export class SocialGraph extends React.Component<SocialGraphP, SocialGraphS>{
    constructor(props: SocialGraphP){
        super(props);
        this.state = {

        };
    }
    render(){
        return <div className="social-graph">
            {
                this.props.beans.map((b) => 
                <div className="bean-node" onClick={() => this.props.onClick(b)}>
                    <AnimatedBean bean={b} costOfLiving={this.props.costOfLiving} sitStill={true} 
                        onClick={() => {this.props.onClick(b);}}>
                    </AnimatedBean>
                </div>)
            }
        </div>
    }
}