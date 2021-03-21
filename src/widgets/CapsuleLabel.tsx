import React from "react";

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