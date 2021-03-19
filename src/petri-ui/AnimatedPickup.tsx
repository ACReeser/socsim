import React, { useEffect, useRef, useState } from "react";
import { SfxContext } from "../App";
import { UFO, City, Pickup } from "../simulation/City";
import { transformPoint, hex_to_pixel } from "../simulation/Geography";
import { EmoteIcon } from "../World";

export const AnimatedPickup: React.FC<{
    pickup: Pickup,
    //city: City
}> = (props) => {
    const [played, setPlayed] = useState(false);
    const sfx = React.useContext(SfxContext);
    useEffect(() => {
        if (!played && sfx){
            sfx.play('drop');
            setPlayed(true);
        }
    })
    return <span className="pickup bob">
        {EmoteIcon[props.pickup.type]}
    </span>
}