import React from "react";
import { IEvent, PubSub } from "../events/Events";

export class TimelyEventToggle extends React.Component<{
    event: PubSub<IEvent>
}, {
 eventCount: number
}>{
    constructor(props: any){
        super(props);
        this.props.event.subscribe(this.onEvent);
        this.state = {
            eventCount: 0
        };
    }
    onEvent = (e: IEvent) => {
        
    }
    render(){
        return <span></span>
    }
}