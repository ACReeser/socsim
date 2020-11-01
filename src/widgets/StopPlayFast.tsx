import React from "react";
import "./StopPlayFast.css"

export class StopPlayFastButtons extends React.Component<{
    timeScale: number,
    setTimeScale: (s: number) => void
}>{
    render(){
        return <div className="s-p-f button-group">
            <button type="button" className={this.props.timeScale == 0 ? 'active': ''} onClick={() => this.props.setTimeScale(0)}>⏹</button>
            <button type="button" className={this.props.timeScale == 1 ? 'active': ''} onClick={() => this.props.setTimeScale(1)}>▶️</button>
            <button type="button" className={this.props.timeScale == 2 ? 'active': ''} onClick={() => this.props.setTimeScale(2)}>⏩</button>
        </div>
    }
}