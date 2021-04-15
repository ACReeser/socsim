import React from "react";
import { Bean } from "../simulation/Bean";
import { AnimatedBean } from "../petri-ui/AnimatedBean";
import "./SocialGraph.css";
import { IBuilding, origin_point } from "../simulation/Geography";
import { LiveList } from "../events/Events";
import { SocialBuildings } from "../petri-ui/Buildings";
import { City } from "../simulation/City";
import { Building } from "../simulation/RealEstate";

interface SocialGraphP{
    city: City,
    beans: LiveList<Bean>;
    scanned_beans: {[beanKey: number]: boolean},
    costOfLiving: number;
    onClick: (b: Bean) => void;
    onClickBuilding: (b: IBuilding) => void;
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
            <div className="social-graph-row">
            {
                this.props.beans.get.map((b) => 
                <div key={b.key} className="bean-node" onClick={() => this.props.onClick(b)}>
                    <AnimatedBean bean={b} static={true} sitStill={true} 
                        onClick={() => {this.props.onClick(b);}}>
                    </AnimatedBean>
                    {
                        this.props.scanned_beans[b.key] ? null : <span className="social-graph-unscanned prohibited-emoji">🛰️</span>
                    }
                </div>)
            }
            </div>
            <div className="social-graph-row">
            {
                <SocialBuildings city={this.props.city} onClickBuilding={this.props.onClickBuilding}></SocialBuildings>
            }
            </div>
        </div>
    }
}