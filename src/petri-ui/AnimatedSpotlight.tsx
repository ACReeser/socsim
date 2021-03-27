import React from "react";
import { EventTrigger, IEvent } from "../events/Events";
import { BeanDeathCause } from "../Game";
import { Bean } from "../simulation/Bean";
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
      name: 'death-exposure', faceOV: '🥶',
      beanClasses: 'drop-tool turn-blue',      
      particles: []
    },
    {
      start: 2000,
      name: 'death-exposure',faceOV: '💀',
      beanClasses: 'drop-tool turn-blue',      
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
      beanClasses: 'drop-tool',
      particles: []
    },
    {
      start: 2000,
      name: 'death-vaporization', 
      beanClasses: 'drop-tool', faceOV: ' ',
      particles: [
        {className: 'head', delay: 0}
      ]
    },
    {
      start: 3000,
      name: 'death-vaporization', 
      beanClasses: 'drop-tool hide-body', faceOV: ' ',
      particles: [
        {className: 'head', delay: 0},
        {className: 'body', delay: 0}
      ]
    }
  ],
  'death-sickness': [
    {
      start: 0,
      name: 'death-sickness', faceOV: '🤢',
      beanClasses: '',      
      particles: []
    },
    {
      start: 1000,
      name: 'death-sickness', 
      beanClasses: 'drop-tool', faceOV: '🤮',
      particles: [
        {className: 'head', delay: 0}
      ]
    },
    {
      start: 1400,
      name: 'death-sickness', 
      beanClasses: 'drop-tool', faceOV: '🤮',
      particles: [
        {className: 'head', delay: 0},
        {className: 'head', delay: 0}
      ]
    },
    {
      start: 2000,
      name: 'death-sickness', 
      beanClasses: 'drop-tool', faceOV: '💀',
      particles: [
        {className: 'head', delay: 0}
      ]
    },
  ],
  'death-starvation': [
    {
      start: 0,
      name: 'death-starvation', faceOV: '🥺',
      beanClasses: '',      
      particles: []
    },
    {
      start: 500,
      name: 'death-starvation', faceOV: '😖',
      beanClasses: 'body-shrink',      
      particles: []
    },
    {
      start: 1000,
      name: 'death-starvation', faceOV: '😫',
      beanClasses: 'body-shrink drop-tool',      
      particles: []
    },
    {
      start: 3000,
      name: 'death-starvation', faceOV: '💀',
      beanClasses: 'body-shrink drop-tool',      
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
        this.currentTime += deltaTimeMS;
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

        const classes = [this.props.bean.job, this.props.bean.ethnicity, this.state.name, this.state.beanClasses].join(' ');
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
        {
          (
            this.props.event.trigger === 'death' ? 
            <div className="card-parent">
              <button className="card button" disabled>
                Prevent Death<br/>-4 🤖
              </button>
            </div> : null
          )
        }
      </div>
    }
}