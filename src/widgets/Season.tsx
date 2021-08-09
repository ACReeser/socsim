import React from "react"
import { Hour, Season } from "../simulation/Time"
import { useAppSelector } from "../state/hooks"

function SeasonHour(hour: Hour){
    switch (hour) {
        default: return '☀️';
        case Hour.Evening: return '🌇';
        case Hour.Morning: return '🌄';
        case Hour.Midnight: return '🌙';
    }
}
export const SeasonWidget: React.FC = () => {
    const date = useAppSelector(s => s.world.date)
    return <span>
        &nbsp;Year {date.year},&nbsp;{Season[date.season]} {date.day} {SeasonHour(date.hour)}
    </span>
}