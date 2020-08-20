import { Bean } from "./Bean";
import React from "react";

export class AnimatedBean extends React.Component<{bean: Bean}, {paused: boolean}> {
    constructor(props: {bean: Bean}) {
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
    render() {
      let classes = this.props.bean.job + ' ' + this.props.bean.ethnicity;
      classes += this.state.paused || !this.props.bean.alive ? ' paused' : '';
      let title = `${this.props.bean.food} ${this.props.bean.shelter} ${this.props.bean.health} ${this.props.bean.community} ${this.props.bean.ideals} $${this.props.bean.cash}`
      return (
        <span className={classes+" bean-walker interactable"}
      style={{animationDelay: '-'+this.delaySeedSec+'s'}} title={title}>{this.props.bean.getFace()}</span>
      )
    }
  }