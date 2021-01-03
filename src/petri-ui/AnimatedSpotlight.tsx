import React from "react";
import { EventTrigger, IEvent } from "../events/Events";
import { Bean, BeanDeathCause } from "../simulation/Bean";
import { transformPoint } from "../simulation/Geography";
import { Particles } from "../widgets/particles";

const vaporizeParticles = [
    {className: 'head', delay: 2600},
    {className: 'work', delay: 1000},
    {className: 'body', delay: 1800},
]
export class AnimatedSpotlight extends React.Component<{
    event: IEvent,
    bean: Bean,
}, {
    type: EventTrigger,
    subtype?: BeanDeathCause
}>{
    constructor(props: any){
        super(props);
        this.state = {
            type: this.props.event.trigger,
            subtype: this.getSubtype(this.props.event.message)
        }
    }
    getSubtype(msg: string): BeanDeathCause|undefined{
        return msg.includes('vaporiz') ? 'vaporization' : msg.includes('exposure') ? 'exposure' : msg.includes('sickness') ? 'sickness' : undefined;
    }
    render(){
        let t: React.CSSProperties|undefined;
        if (this.props.event.point)
          t = transformPoint(this.props.event?.point);

        const classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
        return <div className="spotlight" style={t}>
        <div className="bean-parent">
          <span className={classes+" bean"}>
            <span className="bean-face">
            {
                this.props.bean.getFace()
            }
            </span>
          </span>
          {
              this.state.subtype === 'vaporization' ? vaporizeParticles.map((x, i) => <Particles key={i}
                className={this.state.subtype+' '+x.className} delay={x.delay} particleCount={30}
              ></Particles>) : null
          }
        </div>
        <div className="label">
          {this.props.event.message.replace('A subject', this.props.bean.name)}
        </div>
      </div>
    }
}