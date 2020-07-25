import React from "react";

export interface modalPs{
    show: boolean;
    onClick: () => void;
  }
export class Modal extends React.Component<modalPs> {
    constructor(props: modalPs) {
        super(props);
        this.state = {
        show: false
        }
    }
    render() {
        if (!this.props.show) {
        return null;
        }
        return (
        <div className="modal">
            {this.props.children}
            <button type="button" className="done" onClick={() => this.props.onClick()} >Done</button>
        </div>
        )
    }
}