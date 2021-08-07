import React from "react";
import { AnimatedBean } from "../petri-ui/AnimatedBean";
import { doSelectBean } from "../state/features/selected.reducer";
import { selectCityBeanIDs } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import "./SocialGraph.css";

export const SocialBeanList: React.FC<{
    cityKey: number
}> = (props) => {
    const beanKeys = useAppSelector(state => selectCityBeanIDs(state.world, props.cityKey));
    const dispatch = useAppDispatch();
    return <div className="social-graph">
        {
            beanKeys.map((bKey) => 
            <div className="bean-node" onClick={() => dispatch(doSelectBean({cityKey: props.cityKey, beanKey: bKey}))} key={bKey}>
                <AnimatedBean beanKey={bKey} static={true} sitStill={true} cityKey={props.cityKey}>
                </AnimatedBean>
            </div>)
        }
    </div>
}