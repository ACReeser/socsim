import React from "react";
import { ConfirmButton } from "../widgets/ConfirmButton";
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
  renderTech(name: string, description: string, state: '⭕️'|'✅'|'🔬'){
    return <div>
      <strong>{name}</strong>
      <strong className="pull-r">{state}</strong>
      <div>
        {description}
      </div>
      <div>
        <small>
        0/30 tech
        </small>
      </div>
    </div>
  }
  render(){
      return <div>
          <div className="col-2">
            <div>
              <h2>Research Lab</h2>
              <div className="vertical">
                {this.renderTech('Surgical Psychops', 'Brainwashing causes -1 🧠 sanity damage', '⭕️')}
                {this.renderTech('0 Dimensional Supersiphons', 'Faster ⚡️🧠🤖 accumulation', '🔬')}
                {this.renderTech('Trauma Nanobots', 'Spend 🤖 to stop Subject from dying', '⭕️')}
                {this.renderTech('Advanced Marketing', 'Faster 🗳️ Leadership accumulation', '⭕️')}
              </div>
            </div>
          <div className="vertical">
            <div>
              <div className="robot">
                🤖
                <RobotArm classN="far-left" tool={this.tools[this.state.toolI]}></RobotArm>
                <RobotArm classN="left" tool={this.tools[this.state.toolI2]}></RobotArm>
                <RobotArm classN="near-right" tool={this.tools[this.state.toolI3]}></RobotArm>
                <RobotArm classN="far-right" tool={this.tools[this.state.toolI4]}></RobotArm>
              </div>
            </div>
            <div className="h-42em">
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
              <span className="victim bean triangle shake">😨</span>
            </div>

            <div className="text-center">
              Currently probing 0 beings for 0 tech a day
              <p>
                <small>1 tech per research subject per day</small>
              </p>
            </div>
            <div className="text-right">
              <ConfirmButton className="callout" onConfirm={() => {}} confirmText="-1 Research Subject?">
              🎈 Release Research Subject
              </ConfirmButton>
            </div>
          </div>
        </div>
        <div>

        </div>
      </div>
  }
}