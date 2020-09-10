import React from "react";
import { ChangePubSub } from "../events/Events";

export class BubbleText extends React.Component<{
    bubbleClass?: string,
    icon?: string,
    changeEvent?: ChangePubSub
}, {
    bubbles: Array<{s: string, t: number, c?: string}>
}> {

    constructor(props: any){
        super(props);
        this.state = {
            bubbles: []
        };
    }
    componentDidMount(){
        if (this.props.changeEvent){
            this.props.changeEvent.subscribe(this.onChange)
        }
    }

    onChange = (ev: {change: number}) => {
        const id = +(new Date());
        const positive = ev.change > 0;
        this.setState({
            bubbles: this.state.bubbles.concat([{
                s: (positive ? '+': '') + ev.change,
                t: id,
                c: positive ? 'pos' : 'neg'
            }])
        });
        setTimeout(() => {
            this.setState({
                bubbles: this.state.bubbles.filter((b) => b.t != id)
            })
        }, 1500)
    }

    componentWillUnmount(){
        if (this.props.changeEvent){
            this.props.changeEvent.unsubscribe(this.onChange);
        }
    }

    render(){
        const bubbles = this.state.bubbles.map((b) => <span key={b.t} className={[b.c, this.props.bubbleClass, "bubbler"].join(' ')}>
            {this.props.icon} {b.s}
        </span>)
        return <span className="bubble-parent">
            {this.props.children}
            {bubbles}
        </span>
    }
}