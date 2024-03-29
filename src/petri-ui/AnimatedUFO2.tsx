import React, { useEffect, useState } from "react";
import { hex_to_pixel, transformPoint } from "../simulation/Geography";
import { useAppSelector } from "../state/hooks";
import { WorldSfxInstance } from "../WorldSound";


export const AnimatedUFO2:  React.FC<{
    ufoKey: number,
    cityKey: number
}> = (props) => {
    const [showBeam, setShowBeam] = useState(false);
    const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
    const ufo = useAppSelector(state => state.world.ufos.byID[props.ufoKey]);
    useEffect(() => {
        setTimeout(() => {
            setShowBeam(true);
            WorldSfxInstance.play('teleport');
            setTimeout(() => {
                setShowBeam(false)
            }, 1800);
        }, 1800);
    }, []);
    let style = {
        ...transformPoint(hex_to_pixel(city.district_hex_size, city.petriOrigin, ufo.hex))
    };
    return <span style={style} className="ufo">
        <span role="img" aria-label="saucer">🛸</span>
        {showBeam ? <span className="beam"></span> : null}
    </span>
}