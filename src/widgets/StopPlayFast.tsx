import React from "react";
import "./StopPlayFast.css"

export class StopPlayFastButtons extends React.Component<{
    timeScale: number,
    setTimeScale: (s: number) => void
}>{
    render(){
        return <div className="s-p-f button-group cylinder blue-orange">
            <span role="img" aria-label="hourglass">⌛️</span>
            <button type="button" className={this.props.timeScale == 0 ? 'active': ''} onClick={() => this.props.setTimeScale(0)}><span role="img" aria-label="stop">⏹</span></button>
            <button type="button" className={this.props.timeScale == 1 ? 'active': ''} onClick={() => this.props.setTimeScale(1)}><span role="img" aria-label="play">▶️</span></button>
            <button type="button" className={this.props.timeScale == 2 ? 'active': ''} onClick={() => this.props.setTimeScale(2)}><span role="img" aria-label="fastforward">⏩</span></button>
        </div>
    }
}


export const GeoNetworkButtons: React.FC<{
    activeMain: 'geo' | 'network';
    setActiveMain: (v: 'geo' | 'network' ) => void
}> = (props) => {
    
    return <div className="s-p-f button-group cylinder blue-orange">
        👁️
        <button type="button" className={props.activeMain == 'geo' ? 'active': ''} onClick={() => props.setActiveMain('geo')}>🌎</button>
        <button type="button" className={props.activeMain == 'network' ? 'active': ''} onClick={() => props.setActiveMain('network')}>🌐</button>
    </div>
    
}