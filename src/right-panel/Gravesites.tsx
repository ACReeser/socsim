
import React from "react";
import { useAppSelector } from "../state/hooks";

export const Gravesites: React.FC<{
     interredBeanKeys: number[]
}> = (p) => {
    const c = useAppSelector(s => p.interredBeanKeys.map(x => s.world.beans.byID[x]));

    return <div>
        {
            c.map(y => <div>
                Here lies {y.name}, dead of {y.deathCause || 'unknown'}
            </div>)
        }
    </div>
}