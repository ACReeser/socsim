import React from "react";
import { UFO, City, Pickup } from "../simulation/City";
import { transformPoint, hex_to_pixel } from "../simulation/Geography";
import { PickupIcon } from "../World";

export class AnimatedPickup extends React.Component<{
    pickup: Pickup,
    city: City
}, {
    bob: boolean
}>{
    constructor(props: any){
        super(props);
        this.state = {
            bob: false
        };
        this.props.pickup.onAnimate.subscribe((p) => this.setState({}));
        setTimeout(() => this.setState({bob: true}), Math.random() * 2000);
    }
    render(){
        let style = {
          ...transformPoint(this.props.pickup.point)
        };
        const c = "pickup " + (this.state.bob ? 'bob': '');
        return <span style={style} className={c}>
            {PickupIcon[this.props.pickup.type]}
        </span>
    }
}