import React from "react";
import { ActivityPeriod, ActivityPeriodMetadata } from "../simulation/Agent";
import { DateGetActivityPeriodIndex, TicksPerDay } from "../simulation/Time";
import { useAppSelector } from "../state/hooks";

export const ActivityClock: React.FC<{clock: ActivityPeriod[]}> = (props) => {
    const tick = useAppSelector(s => s.world.date.hour);
    const activeSlot = DateGetActivityPeriodIndex(tick)
    const opacityWhenNot = 0.5;
    return <div className="activity-clock">
        <svg height="100%" width="100%" viewBox="0 0 20 20">
            <circle r="5" cx="10" cy="10" fill="none" className={ActivityPeriodMetadata[props.clock[0]].class}
                opacity={activeSlot === 0 ? 1 : opacityWhenNot}
                strokeWidth="10"
                strokeDasharray="calc(25 * 31.4 / 100) 31.4" transform="rotate(-90) translate(-20)" />
            <circle r="5" cx="10" cy="10" fill="none" className={ActivityPeriodMetadata[props.clock[1]].class}
                opacity={activeSlot === 1 ? 1 : opacityWhenNot}
                strokeWidth="10"
                strokeDasharray="calc(25 * 31.4 / 100) 31.4" />
            <circle r="5" cx="10" cy="10" fill="none" className={ActivityPeriodMetadata[props.clock[2]].class}
                opacity={activeSlot === 2 ? 1 : opacityWhenNot}
                strokeWidth="10"
                strokeDasharray="calc(25 * 31.4 / 100) 31.4" transform="rotate(90) translate(0,-20)" />
            <circle r="5" cx="10" cy="10" fill="none" className={ActivityPeriodMetadata[props.clock[3]].class}
                opacity={activeSlot === 3 ? 1 : opacityWhenNot}
                strokeWidth="10"
                strokeDasharray="calc(25 * 31.4 / 100) 31.4" transform="rotate(180) translate(-20, -20)" />
            <g transform={'rotate('+((tick/TicksPerDay)*360)+')'} transform-box="fill-box" transform-origin="center">
                <rect strokeWidth="0.75" stroke="rgba(0,0,0,1)" x="10" y="0" height="10" width="0.01" ></rect>
            </g>
            <text x="75%" y="35%" textAnchor="middle" >{ActivityPeriodMetadata[props.clock[0]].icon}</text>
            <text x="75%" y="75%" textAnchor="middle" >{ActivityPeriodMetadata[props.clock[1]].icon}</text>
            <text x="25%" y="75%" textAnchor="middle" >{ActivityPeriodMetadata[props.clock[2]].icon}</text>
            <text x="25%" y="35%" textAnchor="middle" >{ActivityPeriodMetadata[props.clock[3]].icon}</text>
        </svg>
    </div>
}