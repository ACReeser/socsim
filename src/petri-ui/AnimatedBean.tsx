import { Bean } from "../simulation/Bean";
import React from "react";
import { origin_point, Point, transformPoint } from "../simulation/Geography";
import { GoodIcon } from "../World";

interface AnimatedBeanP {
  bean: Bean;
  costOfLiving: number;
  sitStill?: boolean;
  onClick: () => void;
  static?: boolean;
}

interface AnimatedBeanS{
  paused: boolean,
  point: Point,
  spin: boolean;
  face: string;
  good?: string;
}

function BeanIsBuying(bean: Bean){
  return bean.state.data.act == 'buy' && bean.state.data.good != 'shelter';
}

export class AnimatedBean extends React.Component<AnimatedBeanP, AnimatedBeanS> {
    constructor(props: AnimatedBeanP) {
      super(props);
      this.delaySeedSec = (Math.random() * 60) + this.props.bean.key;
      this.state = {
        paused: false,
        point: props.static ? origin_point : props.bean.city ? props.bean.city.movers.bean[props.bean.key] : {x: 0, y: 0},
        spin: false,
        face: props.bean.getFace(),
      };
      props.bean.onAct.subscribe(this.animate);
    }
    animate = (deltaMS: number) => {
      this.setState({
        point: this.props.bean.city ? this.props.bean.city.movers.bean[this.props.bean.key] : {x: 0, y: 0},
        spin: this.props.bean.state.data.act == 'work',
        face: this.props.bean.getFace(),
        good: BeanIsBuying(this.props.bean) ? GoodIcon[this.props.bean.state.data.good || 'food'] : undefined
      })
    }
    delaySeedSec: number;
    getIdea(){
        if (this.state.paused) {
            const idea = this.props.bean.getIdea(this.props.costOfLiving)
            if (idea){
                return <span className={idea.bad ? 'bad idea': 'idea'}>{idea.idea}</span>
            }
        }
        return null;
    }
    getPurchase(){
      if (this.state.good){
        return <span className="purchase">
          <span className="money">💸</span>
          <span className="purchase-good">{this.state.good}</span>
        </span>
      }
    }
    render() {
      let classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
      classes += this.state.paused || !this.props.bean.alive ? ' paused' : '';
      if (this.props.sitStill){

      } else {
        classes += ' bean-walker';
        if (this.state.spin)
          classes += ' spin';
        if (this.props.bean.state.data.act != 'travel')
          classes += ' paused';
      }

      let style = {
        ...transformPoint(this.state.point),
        animationDelay: '-'+this.delaySeedSec+'s'
      };
      style.animationDelay = '';
      let title = '';
      return (
        <span className={classes+" bean interactable"}
          style={style} title={title}
          onClick={(e) => {e.stopPropagation(); this.props.onClick(); }}
        >
          {this.state.face} {this.getPurchase()}
        </span>
      )
    }
  }