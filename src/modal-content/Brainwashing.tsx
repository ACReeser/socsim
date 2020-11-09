import React from "react";
import { World } from "../World";
import './modals.css';

export class BrainwashingContent extends React.Component<{
    world: World
}, {

}>{
    render(){
        return <div>
            <div className="horizontal fancy-header">
                <div>
                    BRAIN
                </div>
                <div className="emoji-3">
                💉🧠🚿
                </div>
                <div>
                    WASH
                </div>
            </div>
            <div>

                
            </div>
        </div>
    }
}