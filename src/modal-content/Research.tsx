import React from "react";
import { IPlayerData, ITechInfo, Tech, TechData } from "../simulation/Player";
import { ConfirmButton } from "../widgets/ConfirmButton";
import { RobotArm } from "../widgets/RobotArm";
import './research.css';

export class ResearchPanel extends React.Component<{
  player: IPlayerData,
  setResearch: (t: Tech) => void,
  release: () => void
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
  setResearch(tech: Tech){
    this.props.setResearch(tech);
  }
  renderTech(tech: ITechInfo){
    const unstarted = this.props.player.techProgress[tech.tech] == null;
    const progress = unstarted ? 0 : this.props.player.techProgress[tech.tech].researchPoints;
    const total = tech.techPoints;
    const style = {width: (Math.min(progress/total*100, 100))+'%'};
    const complete = progress >= total;
    const isCurrent = this.props.player.currentlyResearchingTech === tech.tech;
    const state: '⭕️'|'✅'|'🔬' = complete ? '✅' : isCurrent ? '🔬' : '⭕️';
    const rootClassName = isCurrent ? 'active': 'inactive';
    return <div className={"card-parent "+rootClassName} key={tech.tech}>
      <button className="card button" onClick={() => this.setResearch(tech.tech)}>
        <strong>{tech.name}</strong>
        <strong className="pull-r f-size-125em">{state}</strong>
        <div>
          {tech.description}
        </div>      
        <div className="bar f-size-12 h-12">
            <div className="bar-inner text-center" style={style}>
            </div>
            {progress}/{total} tech
        </div>
      </button>
    </div>
  }
  render(){
      const techs = Object.values(TechData);
      return <div>
          <div className="col-2">
            <div>
              <h2>Research Lab</h2>
              <div className="vertical">
                {
                  techs.map((t) => this.renderTech(t))
                }
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
              {
                this.props.player.abductedBeans.map((b) => {
                  return <span key={b.key} className="victim bean triangle shake">😨</span>
                })
              }
            </div>

            <div className="text-center">
              Currently probing {this.props.player.abductedBeans.length} beings for {this.props.player.abductedBeans.length} tech a day
              <p>
                <small>1 tech per research subject per day</small>
              </p>
            </div>
            {
              this.props.player.abductedBeans.length > 0 ? <div className="text-right">
                <ConfirmButton className="callout" onConfirm={() => {this.props.release()}} confirmText="-1 Research Subject?">
                🎈 Release Research Subject
                </ConfirmButton>
              </div> : null
            }
          </div>
        </div>
        <div>

        </div>
      </div>
  }
}