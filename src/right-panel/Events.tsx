import { IEvent } from "../World";
import React from "react";

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
        const events = this.props.events.map((e, i) => {
            return <div key={i}>
                <span>{e.icon}</span>&nbsp;
                <span>{e.message}</span>
            </div>
        });
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