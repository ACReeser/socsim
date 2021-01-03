import React from "react";
import { Bean } from "../simulation/Bean";
import { AnimatedBean } from "../petri-ui/AnimatedBean";
import "./SocialGraph.css";
import { origin_point } from "../simulation/Geography";

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
                    <AnimatedBean bean={b} static={true} sitStill={true} 
                        onClick={() => {this.props.onClick(b);}}>
                    </AnimatedBean>
                </div>)
            }
        </div>
    }
}