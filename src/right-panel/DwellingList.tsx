import React from "react";
import { DwellingKindToIcon } from "../simulation/RealEstate";
import { toTitleCase } from "../simulation/Utils";
import { useAppSelector } from "../state/hooks";

export const DwellingList: React.FC<{
    dwellingKeys: number[]
}> = (props) => {
    const dwellings = useAppSelector(state => props.dwellingKeys.map(y => state.world.dwellings.byID[y]));
    const beanNames = useAppSelector(state => dwellings.reduce((x, d) => {
        if (d.occupantKey != null)
            x[d.key] = state.world.beans.byID[d.occupantKey].name;
        return x;
    }, {} as {[dKey: number]: string}))
    return <div>
        <div>
            <strong>
                Housing:
            </strong>
        </div>
        {
            dwellings.map((x,i) => <div key={x.key}>
                {DwellingKindToIcon[x.kind]} {toTitleCase(x.kind)} #{i+1} {beanNames[x.key] || ''}
            </div>)
        }
    </div>
}