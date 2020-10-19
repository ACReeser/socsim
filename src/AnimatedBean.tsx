import { Bean } from "./Bean";
import React from "react";
import { Point, transformPoint } from "./simulation/Geography";

interface AnimatedBeanP {
  bean: Bean;
  costOfLiving: number;
  sitStill?: boolean;
  where: Point,
  onClick: () => void;
}

export class AnimatedBean extends React.Component<AnimatedBeanP, {paused: boolean}> {
    constructor(props: AnimatedBeanP) {
      super(props);
      this.timerID = null;
      this.delaySeedSec = (Math.random() * 60) + this.props.bean.key;
      this.waitSeedSec = 1 + (Math.random() * 3) + this.props.bean.key;
      this.state = {
        paused: false
      }
    }
    timerID: number|null;
    delaySeedSec: number;
    waitSeedSec: number;
    componentDidMount() {
      this.startWander();
    }
    startWander(){
      this.setState({paused: false});
      this.timerID = window.setTimeout(
        () => this.stopWander(),
        (1000 * this.waitSeedSec)
      );
    }
    componentWillUnmount() {
      if(this.timerID)
        window.clearInterval(this.timerID);
    }
    stopWander(){
      this.setState({paused: true});
      this.timerID = window.setTimeout(
        () => this.startWander(),
        1000
      );
    }
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
        ...transformPoint(this.props.where),
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