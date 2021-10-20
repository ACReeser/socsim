import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";


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