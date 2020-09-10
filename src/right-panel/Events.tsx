import React from "react";
import { IEvent } from "../events/Events";

export interface EventsPanelPS
{
    events: IEvent[]
}

export class EventsPanel extends React.Component<EventsPanelPS> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        let events = this.props.events.map((e, i) => {
            return <div key={i}>
                <span>{e.icon}</span>&nbsp;
                <span>{e.message}</span>
            </div>
        });
        if (this.props.events.length === 0){
            events = [<div key={0}>
                <small>No events yet this year</small>
            </div>]
        }
        return (                
        <div>
            <div>
                <b>Events</b>
            </div>
            {events}
        </div>
        )
    }
}