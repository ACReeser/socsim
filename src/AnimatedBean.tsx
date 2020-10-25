import { Bean } from "./Bean";
import React from "react";
import { origin_point, Point, transformPoint } from "./simulation/Geography";

interface AnimatedBeanP {
  bean: Bean;
  costOfLiving: number;
  sitStill?: boolean;
  onClick: () => void;
  static?: boolean;
}

interface AnimatedBeanS{
  paused: boolean,
  point: Point
}

export class AnimatedBean extends React.Component<AnimatedBeanP, AnimatedBeanS> {
    constructor(props: AnimatedBeanP) {
      super(props);
      this.delaySeedSec = (Math.random() * 60) + this.props.bean.key;
      this.state = {
        paused: false,
        point: props.static ? origin_point : props.bean.city ? props.bean.city.how.bean[props.bean.key] : {x: 0, y: 0}
      };
      props.bean.animate.subscribe(this.animate);
    }
    animate = (deltaMS: number) => {
      this.setState({
        point: this.props.bean.city ? this.props.bean.city.how.bean[this.props.bean.key] : {x: 0, y: 0}
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
    render() {
      let classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
      classes += this.state.paused || !this.props.bean.alive ? ' paused' : '';
      if (this.props.sitStill){

      } else {
        classes += ' bean-walker';
      }
      let style = {
        ...transformPoint(this.state.point),
        animationDelay: '-'+this.delaySeedSec+'s'
      };
      style.animationDelay = '';
      let title = `${this.props.bean.food} ${this.props.bean.shelter} ${this.props.bean.health}`
      return (
        <span className={classes+" bean interactable"}
          style={style} title={title}
          onClick={(e) => {e.stopPropagation(); this.props.onClick(); }}
        >
          {this.props.bean.getFace()} {this.getIdea()}
        </span>
      )
    }
  }