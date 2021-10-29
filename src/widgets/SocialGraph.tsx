import React from "react";
import { AnimatedBean } from "../petri-ui/AnimatedBean";
import { SocialBuildings } from "../petri-ui/PetriHexes";
import { IBean } from "../simulation/Agent";
import { ICity } from "../simulation/City";
import { IBuilding } from "../simulation/Geography";
import { doSelectBean } from "../state/features/selected.reducer";
import { selectCityBeanIDs } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import "./SocialGraph.css";

interface SocialGraphP{
    city: ICity,
    onClick: (b: IBean) => void;
    onClickBuilding: (b: IBuilding) => void;
}

export const SocialGraph: React.FC<SocialGraphP> = (props) => {
    const beanKeys = useAppSelector(state => selectCityBeanIDs(state.world, props.city.key));
    const scannedBeans = useAppSelector(s => s.world.alien.scanned_bean)
    const dispatch = useAppDispatch();
    return <div className="social-graph">
        <div className="social-graph-row">
        {
            beanKeys.map((b) => 
            <div key={b} className="bean-node" onClick={() => dispatch(doSelectBean({cityKey:props.city.key, beanKey: b}))}>
                <AnimatedBean beanKey={b} static={true} sitStill={true} cityKey={props.city.key}>
                </AnimatedBean>
                {
                    scannedBeans[b] ? null : <span className="social-graph-unscanned prohibited-emoji">🛰️</span>
                }
            </div>)
        }
        </div>
        <div className="social-graph-row">
        {
            <SocialBuildings city={props.city} onClickBuilding={props.onClickBuilding}></SocialBuildings>
        }
        </div>
    </div>
}