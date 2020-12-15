import React from "react";

export class ConfirmButton extends React.Component<{
    confirmText: string,
    onConfirm: () => void,
    disabled?: boolean,
    className?: string
}, {
    confirming: boolean
}> {
    constructor(props:any){
        super(props);
        this.state = {
            confirming: false
        }
    }
    click(){
        if (this.state.confirming){
            this.props.onConfirm();
            this.setState({confirming: false});
        } else {
            this.setState({confirming: true});
        }
    }
    render(){
        return <button className={this.props.className} onClick={() => this.click()} disabled={this.props.disabled}>
            { this.state.confirming ? this.props.confirmText : this.props.children}
        </button>
    }
}