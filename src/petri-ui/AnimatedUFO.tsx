import React from "react";
import { City, UFO } from "../simulation/City";
import { hex_to_pixel, origin_point, transformPoint } from "../simulation/Geography";


export class AnimatedUFO extends React.Component<{
    ufo: UFO,
    city: City
}, {
    showBeam: boolean
}>{
    constructor(props: any){
        super(props);
        this.state = {
            showBeam: false
        };
        setTimeout(() => {
            this.setState({showBeam: true});
            setTimeout(() => {
                this.setState({showBeam: false})
            }, 1800);
        }, 1800);
    }
    render(){
        let style = {
          ...transformPoint(hex_to_pixel(this.props.city.hex_size, this.props.city.petriOrigin, this.props.ufo.point))
        };
        return <span style={style} className="ufo">
            🛸
            {this.state.showBeam ? <span className="beam"></span> : null}
            
        </span>
    }
}