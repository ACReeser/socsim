import React, { useEffect, useState } from "react";
import { ChangePubSub, PubSub } from "../events/Events";

interface Bubble {string: string, id: number, className?: string};

function useBubbles<T>(sub: PubSub<T>, transform: (input: T) => {string: string, className: string}){
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    let bubbleSeed = 0;
    const onEvent = (event: T) => {
        const id = ++bubbleSeed;
        setBubbles(bubbles.concat([{
            id: id,
            ...transform(event)
        }]));
        setTimeout(() => {
            setBubbles(
                bubbles.filter((b) => b.id !== id)
            )
        }, 1500)
    }
    useEffect(() => {
        sub.subscribe(onEvent);
        return () => sub.unsubscribe(onEvent);
    });
    return bubbles;
}

export class BubbleNumberText extends React.Component<{
    bubbleClass?: string,
    icon?: string,
    changeEvent?: ChangePubSub
}, {
    bubbles: Array<Bubble>
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
    bubbleSeed = 0;
    onChange = (ev: {change: number}) => {
        const id = ++this.bubbleSeed;
        const positive = ev.change > 0;
        this.setState({
            bubbles: this.state.bubbles.concat([{
                string: (positive ? '+': '') + ev.change,
                id: id,
                className: positive ? 'pos' : 'neg'
            }])
        });
        setTimeout(() => {
            this.setState({
                bubbles: this.state.bubbles.filter((b) => b.id !== id)
            })
        }, 1500)
    }

    componentWillUnmount(){
        if (this.props.changeEvent){
            this.props.changeEvent.unsubscribe(this.onChange);
        }
    }

    render(){
        const bubbles = this.state.bubbles.map((b) => <span key={b.id} className={[b.className, this.props.bubbleClass, "bubbler"].join(' ')}>
            {this.props.icon} {b.string}
        </span>)
        return <span className="bubble-parent">
            {this.props.children}
            {bubbles}
        </span>
    }
}

export const BubbleSeenTraitsText: React.FC<{
    bubbleClass?: string,
    icon?: string,
    changeEvent: PubSub<{k: string, v: boolean}>
}> = (props) => {
    const bubbles = useBubbles(props.changeEvent, (input: {k: string, v: boolean}) => {
        return {
            string: `Discovered ${input.k}!`,
            className: 'seen-belief'
        }
    })
    return <span className="bubble-parent">
        {props.children}
        {bubbles.map((b) => <span key={b.id} className={[b.className, props.bubbleClass, "bubbler"].join(' ')}>
            {props.icon} {b.string}
        </span>)}
    </span>
}