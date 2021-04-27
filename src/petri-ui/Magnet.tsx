import React, { useEffect, useRef, useState } from "react";
import { Live } from "../events/Events";
import { HexPoint, Point } from "../simulation/Geography";
import { useAppDispatch, useAppSelector } from "../state/hooks";


export const Magnet: React.FC<{
    pickupMagnetPoint: Live<Point|undefined>
}> = (props) => {
    const el = useRef<HTMLDivElement|null>(null);
    const [point, setPoint] = useState(props.pickupMagnetPoint.get);
    const updatePoint = (p: Point|undefined) => {
        setPoint(p);
        if (el.current && p)
            el.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
    useEffect(() => {
        props.pickupMagnetPoint.onChange.subscribe(updatePoint);
        updatePoint(props.pickupMagnetPoint.get);
        return () => props.pickupMagnetPoint.onChange.unsubscribe(updatePoint)
    });

    if (point){
        return <div className="magnet" ref={el}>🧲</div>
    } else {
        return null;
    }
}


export const Magnet2: React.FC<{
    cityKey: number
}> = (props) => {
    const el = useRef<HTMLDivElement|null>(null);
    const magnetPoint = useAppSelector(state => state.world.cities.byID[props.cityKey].pickupMagnetPoint);

    if (magnetPoint){
        return <div className="magnet" style={{transform: `translate(${magnetPoint.x}px, ${magnetPoint.y}px)`}}>🧲</div>
    } else {
        return null;
    }
}