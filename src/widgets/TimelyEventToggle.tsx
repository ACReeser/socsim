import React from "react";
import { IEvent, PubSub } from "../events/Events";

export class TimelyEventToggle extends React.Component<{
    event: PubSub<IEvent>,
    eventIcon: string,
    eventClass: string
}, {
 eventCount: number,
}>{
    constructor(props: any){
        super(props);
        this.props.event.subscribe(this.onEvent);
        this.state = {
            eventCount: 0
        };
    }
    onEvent = (e: IEvent) => {
        this.setState({eventCount: this.state.eventCount+1});
        window.setTimeout(() => {
            this.setState({
                eventCount: this.state.eventCount-1
            });
        }, 3000);
    }
    render(){
        return <span>
            {this.state.eventCount < 1 ? this.props.children : <span className={this.props.eventClass}>{this.props.eventIcon}</span>}
        </span>
    }
}