import React, { RefObject } from "react";

export class Particles extends React.Component<{
    particleCount: number,
    className?: string,
    delay: number
}, {
    active: boolean,
    parts: RefObject<HTMLDivElement>[]
}> {
    private animations: Array<Animation|null> = [];
    private finishedAnimationCount: number = 0;
    constructor(props: any){
        super(props);
        let parts: RefObject<HTMLDivElement>[] = []
        for (let i = 0; i < this.props.particleCount; i++) {
            parts.push(React.createRef());
        }
        this.state = {
            active: true,
            parts: parts
        }
    }
    componentDidMount(){
        this.animations = this.state.parts.map((p) => {
            if (p.current){
                const x = Math.floor(Math.random() * 400) - 200;
                const y = Math.floor(Math.random() * 400) - 400;
                return p.current.animate([
                    {
                      transform: `translate(0px, 0px)`,
                      opacity: 1
                    },
                    {
                      transform: `translate(${x}px, ${y}px)`,
                      opacity: 0
                    }    
                ], {
                    duration: 1500 + Math.random() * 1000,
                    easing: 'ease-in-out',
                    delay: this.props.delay + (Math.random() * 200)
                });
            }
            return null;
        });
        this.animations.forEach((x) => {
            if (x)
            x.onfinish = () => {
                this.finishedAnimationCount++;
                if (this.finishedAnimationCount >= this.props.particleCount){

                    this.setState({active: false, parts: []});
                }
            }
        })
    }
    render(){
        return <div className={(this.props.className || '') + " particle-parent"}>
            {
                this.state.active ? this.state.parts.map((x, i) => {
                    return <div key={i} className="particle" ref={x}></div>;
                }) : null
            }
        </div>
    }
}

export class DelayedParticles extends React.Component<{
    particleCount: number,
    className?: string,
    delay: number
}, {
    active: boolean
}> {
    constructor(props: any){
        super(props);
        this.state = {
            active: false
        };
    }
    componentDidMount(){
        window.setTimeout(() => {
            this.setState({active: true});
        }, this.props.delay);
    }
    render(){
        if (this.state.active){
            return <Particles delay={0} className={this.props.className} particleCount={this.props.particleCount}></Particles>
        } else {
            return this.props.children;
        }
    }
}