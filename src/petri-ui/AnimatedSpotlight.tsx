import React from "react";
import { EventTrigger, IEvent } from "../events/Events";
import { Bean, BeanDeathCause } from "../simulation/Bean";
import { transformPoint } from "../simulation/Geography";
import { Particles } from "../widgets/particles";
import './spotlight.css';

interface SpotlightState{
  name: string;
  beanClasses: string;
  faceOV?: string,
  particles: {className:string,delay:number}[]
}
interface SpotlightAnimationState extends SpotlightState{
  start: number;
}
const spotlightAnimations: {[key:string]:SpotlightAnimationState[]} = {
  'death-exposure': [
    {
      start: 0,
      name: 'death-exposure',
      beanClasses: '',
      
      particles: []
    }
  ],
  'death-vaporization': [
    {
      start: 0,
      name: 'death-vaporization',
      beanClasses: '',
      
      particles: []
    },
    {
      start: 1000,
      name: 'death-vaporization',
      beanClasses: '',
      
      particles: [
        {className: 'head', delay: 2000},
        {className: 'work', delay: 1000},
        {className: 'body', delay: 1500}
      ]
    }
  ],
  'death-sickness': [
    {
      start: 0,
      name: 'death-vaporization',
      beanClasses: '',
      
      particles: []
    }
  ],
  'death-starvation': [
    {
      start: 0,
      name: 'death-starvation',
      beanClasses: '',
      
      particles: []
    }
  ]
}
export class AnimatedSpotlight extends React.Component<{
    event: IEvent,
    bean: Bean,
}, SpotlightState>{
    constructor(props: any){
        super(props);
        const name = `${this.props.event.trigger}-${this.getSubtype(this.props.event.message)}`;
        this.state = spotlightAnimations[name][0];
    }
    private lastTickMS: DOMHighResTimeStamp = 0;
    private currentTime: number = 0;
    private tickHandle: number = 0;
    componentDidMount(){
      window.requestAnimationFrame((time: DOMHighResTimeStamp) => {
        this.lastTickMS = time; //initialize tick time
        this.tickHandle = window.requestAnimationFrame(this.tick);
      });
    }
    componentWillUnmount(){
      window.cancelAnimationFrame(this.tickHandle);
    }
    tick = (timeMS: DOMHighResTimeStamp) => {
      // Compute the delta-time against the previous time
      const deltaTimeMS = (timeMS - this.lastTickMS);
    
      // Update the previous time
      this.lastTickMS = timeMS;
      if (deltaTimeMS > 0){
        this.currentTime += timeMS;
        const name = `${this.props.event.trigger}-${this.getSubtype(this.props.event.message)}`;
        this.setState(spotlightAnimations[name].reduce((lastValid: SpotlightAnimationState, anim: SpotlightAnimationState) => {
          if (this.currentTime >= anim.start)
            return anim;
          else
            return lastValid;
        }, spotlightAnimations[name][0]));

      }
      this.tickHandle = window.requestAnimationFrame(this.tick);
    }
    getSubtype(msg: string): BeanDeathCause|undefined{
        return msg.includes('vaporiz') ? 'vaporization' : msg.includes('exposure') ? 'exposure' : msg.includes('sickness') ? 'sickness' : 'starvation';
    }
    render(){
        let t: React.CSSProperties|undefined;
        if (this.props.event.point)
          t = transformPoint(this.props.event?.point);

        const classes = [this.props.bean.job, this.props.bean.ethnicity, this.state.name].join(' ');
        return <div className="spotlight" style={t}>
        <div className="bean-parent">
          <span className={classes+" bean"}>
            <span className="bean-face">
            {this.state.faceOV || this.props.bean.getFace()}
            </span>
          </span>
          {
              this.state.particles.map((x, i) => <Particles key={i}
                className={this.state.name+' '+x.className} delay={x.delay} particleCount={30}
              ></Particles>)
          }
        </div>
        <div className="label">
          {this.props.event.message.replace('A subject', this.props.bean.name)}
        </div>
      </div>
    }
}