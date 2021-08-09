import React, { useEffect, useRef, useState } from "react";
import { SfxContext } from "../App";
import { UFO, City, Pickup } from "../simulation/City";
import { transformPoint, hex_to_pixel } from "../simulation/Geography";
import { IPickup } from "../simulation/Pickup";
import { useAppSelector } from "../state/hooks";
import { EmoteIcon } from "../World";

export const AnimatedPickup: React.FC<{
    pickupKey: number
}> = (props) => {
    const [played, setPlayed] = useState(false);
    const pickup = useAppSelector(state => state.world.pickups.byID[props.pickupKey]);
    const sfx = React.useContext(SfxContext);
    useEffect(() => {
        if (!played && sfx){
            sfx.play('drop');
            setPlayed(true);
        }
    })
    return <span className="pickup bob">
        {EmoteIcon[pickup.type]}
    </span>
}