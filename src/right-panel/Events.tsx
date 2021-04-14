import React from "react";
import { IEvent } from "../events/Events";

export interface EventsPanelPS
{
    events: IEvent[],
    selectBean: (beanKey?: number) => void
}
function shouldEventJumpToBean(e: IEvent): boolean{
    return e.beanKey != null && (
        e.trigger === 'speechcrime' ||
        e.trigger === 'birth');
}

export class EventsPanel extends React.Component<EventsPanelPS> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    render(){
        let events = this.props.events.map((e, i) => {
            const alert = e.icon === '🚨';
            const tallTrigger = e.trigger === 'nojobslots' || e.trigger === 'persuasion';
            return <div key={i} className={alert||tallTrigger ? 'tall': ''}>
                <span className={alert ? 'police-siren': ''}>{e.icon}</span>&nbsp;
                {
                    shouldEventJumpToBean(e) ? <a onClick={() => this.props.selectBean(e.beanKey)} href="javascript:void(0)">{e.message}</a> : <span>{e.message}</span>
                }
            </div>
        });
        if (this.props.events.length === 0){
            events = [<div key={0}>
                <small>No events yet</small>
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