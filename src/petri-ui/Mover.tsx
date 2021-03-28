import React, { useEffect, useRef, useState } from "react";
import { LiveList, PubSub } from "../events/Events";
import { Bean } from "../simulation/Bean";
import { Pickup } from "../simulation/City";
import { Point } from "../simulation/Geography";
import { AnimatedBean } from "./AnimatedBean";
import { AnimatedPickup } from "./AnimatedPickup";

export const Mover: React.FC<{
    onMove: PubSub<Point>,
    startPoint: Point
}> = (props) => {
    const el = useRef<HTMLDivElement|null>(null);
    const onMove = (p: Point) => {
        if (el.current && p)
            el.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
    useEffect(() => {
        props.onMove.subscribe(onMove);
        onMove(props.startPoint);
        return () => props.onMove.unsubscribe(onMove)
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
                return <Mover onMove={p.onMove} key={p.key} startPoint={p.point}>
                    <AnimatedPickup pickup={p}></AnimatedPickup>
                </Mover>
            })
        }
    </>;
}

export const BeanList: React.FC<{
    beans: LiveList<Bean>,
    activeBeanID: number|null;
    onBeanClick: (b: Bean) => void;
}> = (props) => {
    const [list, setList] = useState(props.beans.get);
    const onChange = (l: Bean[]) => {
        setList(l);
    }
    useEffect(() => {
        props.beans.onChange.subscribe(onChange)
        return () => props.beans.onChange.unsubscribe(onChange)
    }, []);
    return <>
        {
            list.map((bean: Bean) => {
                return <Mover onMove={bean.onMove} key={bean.key} startPoint={bean.point}>
                    <AnimatedBean bean={bean} selected={bean.key === props.activeBeanID} onClick={() => props.onBeanClick(bean)}></AnimatedBean>
                </Mover>
            })
        }
    </>;
}