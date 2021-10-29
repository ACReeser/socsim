import React from "react";
import { IEvent } from "../events/Events";
import { doSelectBean } from "../state/features/selected.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectEventIDs } from "../state/state";

function shouldEventJumpToBean(e: IEvent): boolean{
    return e.beanKey != null && (
        e.trigger === 'speechcrime' ||
        e.trigger === 'birth');
}

export const EventsPanel: React.FC<{
    
}> = (props) => {
    const eventIDs = useAppSelector(selectEventIDs);
    const events = useAppSelector(state => eventIDs.slice().reverse().map(id => state.world.events.byID[id]));
    const dispatch = useAppDispatch();
    let elements = events.map((e, i) => {
        const alert = e.icon === '🚨';
        const tallTrigger = e.trigger === 'nojobslots' || e.trigger === 'persuasion';
        return <div key={i} className={alert||tallTrigger ? 'tall': ''}>
            <span className={alert ? 'police-siren': ''}>{e.icon}</span>&nbsp;
            {
                shouldEventJumpToBean(e) ? <a onClick={() => {
                    if (e.beanKey && e.cityKey) {
                        dispatch(doSelectBean({beanKey: e.beanKey, cityKey: e.cityKey}));
                    }
            }} href="javascript:void(0)">{e.message}</a> : <span>{e.message}</span>
            }
        </div>
    });
    if (events.length === 0){
        elements = [<div key={0}>
            <small>No events yet</small>
        </div>]
    }
    return (                
    <div className="events-panel">
        <div>
            <b>Events</b>
        </div>
        {elements}
    </div>
    )
}