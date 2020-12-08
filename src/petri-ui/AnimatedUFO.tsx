import React from "react";
import { City, UFO } from "../simulation/City";
import { hex_to_pixel, origin_point, transformPoint } from "../simulation/Geography";


export class AnimatedUFO extends React.Component<{
    ufo: UFO,
    city: City
}, {

}>{
    render(){
        let style = {
          ...transformPoint(hex_to_pixel(this.props.city.hex_size, this.props.city.petriOrigin, this.props.ufo.point))
        };
        return <span style={style} className="ufo">
            🛸
        </span>
    }
}