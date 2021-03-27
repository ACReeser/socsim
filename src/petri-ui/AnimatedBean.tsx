import { Bean } from "../simulation/Bean";
import React from "react";
import { origin_point, Point, transformPoint } from "../simulation/Geography";
import { GoodIcon } from "../World";

interface AnimatedBeanP {
  bean: Bean;
  selected?: boolean;
  sitStill?: boolean;
  onClick: () => void;
  static?: boolean;
}

interface AnimatedBeanS{
  paused: boolean,
  spin: boolean;
  face: string;
  good?: string;
  speech?: string;
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
        spin: false,
        face: props.bean.getFace(),
      };
      props.bean.onAct.subscribe(this.animate);
    }
    animate = (deltaMS: number) => {
      this.setState({
        spin: this.props.bean.state.data.act == 'work',
        face: this.props.bean.getFace(),
        good: BeanIsBuying(this.props.bean) ? GoodIcon[this.props.bean.state.data.good || 'food'] : undefined,
        speech: this.props.bean.getSpeech()
      })
    }
    delaySeedSec: number;
    getPurchase(){
      if (this.state.good){
        return <span className="purchase">
          <span className="money">💸</span>
          <span className="purchase-good">{this.state.good}</span>
        </span>
      }
    }
    getSpeech(){
      if (this.state.speech){
        return <span className="speech">
          <span className="">{this.state.speech}</span>
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
        if (this.props.selected)
          classes += ' selected';
        if (this.props.bean.state.data.act != 'travel')
          classes += ' paused';
      }

      let style = {
        animationDelay: '-'+this.delaySeedSec+'s'
      };
      style.animationDelay = '';
      let title = '';
      return (
        <span className={classes+" bean interactable"}
          style={style} title={title}
          onClick={(e) => {e.stopPropagation(); this.props.onClick(); }}
        >
          {this.state.face} {this.getPurchase()} {this.getSpeech()}
        </span>
      )
    }
  }