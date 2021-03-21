import React from "react";

export interface modalPs{
    show: boolean;
    onClick: () => void;
    closeButtonText?: string;
    hideCloseButton?: boolean
}
export class Modal extends React.Component<modalPs> {
    constructor(props: modalPs) {
        super(props);
        this.state = {
            show: false
        }
    }
    getButton(){
        if (this.props.hideCloseButton)
            return null;
        else
            return <button type="button" className="done" onClick={() => this.props.onClick()} >{this.props.closeButtonText || 'Done'}</button>
    }
    render() {
        if (!this.props.show) {
            return null;
        }
        return (
        <div className="modal">
            {this.props.children}
            {this.getButton()}
        </div>
        )
    }
}