import React from "react";
import { useAppSelector } from "../state/hooks";

export class CapsuleLabel extends React.Component<{
    icon?: string,
    label?: string
}, {
}> {

    constructor(props: any){
        super(props);
        this.state = {
        };
    }

    render(){
        const classN = 'capsule-label '+this.props.label||'';
        return <span className={classN}>
            <span className="capsule-icon">
                {this.props.icon}
            </span>
            <span className="capsule-text">
                {this.props.label}:
            </span>
            <span className="capsule-value">
                {this.props.children}
            </span>
        </span>
    }
}

export const EnergyAmount: React.FC = () => {
    const amt = useAppSelector(x => x.world.alien.energy.amount);
    return <span>{amt.toFixed(1)}</span>
}
export const BotsAmount: React.FC = () => {
    const amt = useAppSelector(x => x.world.alien.bots.amount);
    return <span>{amt.toFixed(1)}</span>
}
export const HedonAmount: React.FC = () => {
    const amt = useAppSelector(x => x.world.alien.hedons.amount);
    return <span>{amt.toFixed(0)}</span>
}