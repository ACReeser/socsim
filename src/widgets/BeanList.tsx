import React from "react";
import { Bean } from "../Bean";
import { AnimatedBean } from "../AnimatedBean";
import "./SocialGraph.css";

interface BeanListP{
    beans: Bean[];
    costOfLiving: number;
    onClick: (b: Bean) => void
}
interface BeanListS{
    
}
export class BeanList extends React.Component<BeanListP, BeanListS>{
    constructor(props: BeanListP){
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