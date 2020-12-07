import React from "react";
import { IEvent } from "../events/Events";

export interface EventsPanelPS
{
    events: IEvent[],
    selectBean: (beanKey?: number) => void
}

export class EventsPanel extends React.Component<EventsPanelPS> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        let events = this.props.events.map((e, i) => {
            const speechcrime = e.icon === '🚨';
            return <div key={i} className={speechcrime ? 'tall': ''}>
                <span className={speechcrime ? 'police-siren': ''}>{e.icon}</span>&nbsp;
                {
                    e.beanKey != null ? <a onClick={() => this.props.selectBean(e.beanKey)} href="javascript:void(0)">{e.message}</a> : <span>{e.message}</span>
                }
            </div>
        });
        if (this.props.events.length === 0){
            events = [<div key={0}>
                <small>No events yet this year</small>
            </div>]
        }
        return (                
        <div className="events-panel">
            <div>
                <b>Events</b>
            </div>
            {events}
        </div>
        )
    }
}