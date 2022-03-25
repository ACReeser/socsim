import React from "react"
import { PartOfDay, Season } from "../simulation/Time"
import { useAppSelector } from "../state/hooks"

function SeasonHour(hour: number){
    if (hour < PartOfDay.Morning)
        return '🌙';
    if (hour < PartOfDay.Noon)
        return '🌄';
    if (hour < PartOfDay.Evening)
        return '☀️';
    return '🌇';
}
export const SeasonWidget: React.FC = () => {
    const date = useAppSelector(s => s.world.date)
    return <span>
        &nbsp;<span className="hide-mobile">Year</span><span className="show-mobile-inline">Y</span> {date.year},&nbsp;{Season[date.season]} {date.day} {SeasonHour(date.hour)}
    </span>
}