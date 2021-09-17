import React, { useState } from "react";
import { UFO } from "../simulation/City";
import { hex_to_pixel, origin_point, transformPoint } from "../simulation/Geography";
import { useAppSelector } from "../state/hooks";


export const AnimatedUFO2:  React.FC<{
    ufoKey: number,
    cityKey: number
}> = (props) => {
    const [showBeam, setShowBeam] = useState(false);
    const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
    const ufo = useAppSelector(state => state.world.ufos.byID[props.ufoKey]);
    setTimeout(() => {
        setShowBeam(true);
        setTimeout(() => {
            setShowBeam(false)
        }, 1800);
    }, 1800);
    let style = {
        ...transformPoint(hex_to_pixel(city.hex_size, city.petriOrigin, ufo.point))
    };
    return <span style={style} className="ufo">
        🛸
        {showBeam ? <span className="beam"></span> : null}
    </span>
}