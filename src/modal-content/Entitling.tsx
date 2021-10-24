import React from "react";
import { ITitle } from "../simulation/Titles";
import { beanSetTitle } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";

export const EntitleModalContent: React.FC<{

}> = (props) => {
    const selectedBeanKey = useAppSelector(s => s.selected.selectedBeanKey);
    const titles = useAppSelector(s => s.world.titles.allIDs.reduce( (all, id)=>{all.push(s.world.titles.byID[id]); return all;}, [] as ITitle[]));
    const dispatch = useAppDispatch();
    return <div className="pad-4p">
        <h1>Award Title</h1>
        <div>
        {
            titles.map((x, i) => <div key={i} className="card-parent">
                <button className="button card" onClick={() => {
                    if (selectedBeanKey != null)
                        dispatch(beanSetTitle({beanKey: selectedBeanKey, titleKey: x.key}))
                }}>
                    {x.headwear} {x.name} {x.badge}
                </button>
            </div>)
        }
        </div>
    </div>
};