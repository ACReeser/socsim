import React from "react";
import { RobotArm } from "../widgets/RobotArm";
import './research.css';

export class ResearchPanel extends React.Component<{

}, {
  toolI: number, toolI2: number, toolI3: number, toolI4: number
}>{
  tools = [
  '📡',
  '🗜️',
  '🔬',
  '💉',
  '🔎',
  '🧼',
  '🧲',
  '🎥',
  '🔧',
  ];
  constructor(props:any){
    super(props);
    this.state = {
      toolI: 0,
      toolI2: 2,
      toolI3: 4,
      toolI4: 1,
    };
  }
  interval?: number;
  loop(lastI: number){
    let i = lastI + 1;
    if (i === this.tools.length)
      i = 0;
    return i;
  }
  componentDidMount(){
    this.interval = window.setInterval(() => {
      this.setState({
        toolI: this.loop(this.state.toolI),
        toolI2: this.loop(this.state.toolI2),
        toolI3: this.loop(this.state.toolI3),
        toolI4: this.loop(this.state.toolI4),
      });
    }, 1000);
  }
  componentWillUnmount(){
    if (this.interval != null)
      window.clearInterval(this.interval);
  }
  render(){
      return <div>
          <div className="col-2">
            <div>
              <h2>Research Lab</h2>

            </div>
          <div className="vertical">
            <div className="text-center">
              Currently probing 0 beings
            </div>
            <div>
              <div className="robot">
                🤖
                <RobotArm classN="far-left" tool={this.tools[this.state.toolI]}></RobotArm>
                <RobotArm classN="left" tool={this.tools[this.state.toolI2]}></RobotArm>
                <RobotArm classN="near-right" tool={this.tools[this.state.toolI3]}></RobotArm>
                <RobotArm classN="far-right" tool={this.tools[this.state.toolI4]}></RobotArm>
              </div>
            </div>
            <div className="">
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
            </div>
            <div>

            </div>
          </div>
        </div>
        <div>

        </div>
      </div>
  }
}