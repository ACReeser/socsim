import React, { useEffect, useRef, useState } from "react";
import { LiveList, PubSub } from "../events/Events";
import { Pickup } from "../simulation/City";
import { Point } from "../simulation/Geography";
import { AnimatedPickup } from "./AnimatedPickup";

export const Mover: React.FC<{
    onMove: PubSub<Point>
}> = (props) => {
    const el = useRef<HTMLDivElement|null>(null);
    const onMove = (p: Point) => {
        if (el.current)
            el.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
    useEffect(() => {
        props.onMove.subscribe(onMove)
        return () => props.onMove.unsubscribe(onMove)
    }, []);
    return <div ref={el}>
        {props.children}
    </div>
}

export const PickupList: React.FC<{
    movers: LiveList<Pickup>
}> = (props) => {
    const [list, setList] = useState(props.movers.get);
    const onChange = (l: Pickup[]) => {
        setList(l);
    }
    useEffect(() => {
        props.movers.onChange.subscribe(onChange)
        return () => props.movers.onChange.unsubscribe(onChange)
    }, []);
    return <>
        {
            list.map((p: Pickup) => {
                return <Mover onMove={p.onMove} key={p.key}>
                    <AnimatedPickup pickup={p}></AnimatedPickup>
                </Mover>
            })
        }
    </>;
}