import React, { useEffect, useRef, useState } from "react";
import { MoverContext } from "../App";
import { LiveList, PubSub } from "../events/Events";
import { Bean } from "../simulation/Bean";
import { Pickup } from "../simulation/City";
import { Point } from "../simulation/Geography";
import { MoverType } from "../simulation/MoverBus";
import { IPickup } from "../simulation/Pickup";
import { doSelectBean } from "../state/features/selected.reducer";
import { selectCityBeanIDs } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { AnimatedBean } from "./AnimatedBean";
import { AnimatedPickup } from "./AnimatedPickup";

export const Mover: React.FC<{
    moverType: MoverType,
    moverKey: number
}> = (props) => {
    const mover = React.useContext(MoverContext);
    const el = useRef<HTMLDivElement|null>(null);
    const onMove = (p: Point) => {
        if (el.current && p)
            el.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
    useEffect(() => {
        mover.Get(props.moverType, props.moverKey).subscribe(onMove);
        // onMove(props.startPoint);
        return () => mover.Get(props.moverType, props.moverKey).unsubscribe(onMove)
    }, []);
    return <div ref={el}>
        {props.children}
    </div>
}

export const PickupList: React.FC<{
    pickups: LiveList<Pickup>
}> = (props) => {
    const [list, setList] = useState(props.pickups.get);
    const onChange = (l: Pickup[]) => {
        setList(l);
    }
    useEffect(() => {
        props.pickups.onChange.subscribe(onChange)
        return () => props.pickups.onChange.unsubscribe(onChange)
    }, []);
    return <>
        {
            list.map((p: Pickup) => {
                return <Mover moverType='pickup' moverKey={p.key}>
                    <AnimatedPickup pickup={p}></AnimatedPickup>
                </Mover>
            })
        }
    </>;
}

export const PetriBeanList: React.FC<{
    cityKey: number
}> = (props) => {
    const beanKeys = useAppSelector(state => selectCityBeanIDs(state.world, props.cityKey));
    return <>
        {
            beanKeys.map((beanKey: number) => {
                return <Mover moverKey={beanKey} key={beanKey} moverType='bean'>
                    <AnimatedBean cityKey={props.cityKey} beanKey={beanKey}></AnimatedBean>
                </Mover>
            })
        }
    </>;
}


export const PickupList2: React.FC<{
    cityKey: number
}> = (props) => {
    const list = useAppSelector(state => state.world.cities.byID[props.cityKey].pickupKeys);
    return <>
        {
            list.map((pKey: number) => {
                return ;
                // <Mover onMove={p.onMove} key={p.key} startPoint={p.point}>
                //     <AnimatedPickup pickup={p}></AnimatedPickup>
                // </Mover>
            })
        }
    </>;
}