import React, { useEffect, useState } from "react";
import { IPlayerData, IPlayerTechProgress, ITechInfo, Tech, TechData, TechProgress } from "../simulation/Player";
import { release, setResearch } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { ConfirmButton } from "../widgets/ConfirmButton";
import { RobotArm } from "../widgets/RobotArm";
import './research.css';

function renderTech(tech: ITechInfo, techProgress: TechProgress, currentlyResearchingTech: Tech|undefined, setResearch: (t: Tech) => void){
  const unstarted = techProgress[tech.tech] == null;
  const progress = unstarted ? 0 : techProgress[tech.tech].researchPoints;
  const total = tech.techPoints;
  const style = {width: (Math.min(progress/total*100, 100))+'%'};
  const complete = progress >= total;
  const isCurrent = currentlyResearchingTech === tech.tech;
  const state: '⭕️'|'✅'|'🔬' = complete ? '✅' : isCurrent ? '🔬' : '⭕️';
  const rootClassName = isCurrent ? 'active': 'inactive';
  return <div className={"card-parent "+rootClassName} key={tech.tech}>
    <button className="card button" onClick={() => setResearch(tech.tech)}>
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

const tools = [
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
function loop(lastI: number){
  let i = lastI + 1;
  if (i === tools.length)
    i = 0;
  return i;
}
export const ResearchPanel: React.FC<{}> = () => {
  const abductedBeanKeys = useAppSelector(x => x.world.alien.abductedBeanKeys);
  const techProgress = useAppSelector(x => x.world.alien.techProgress);
  const currentTech = useAppSelector(x => x.world.alien.currentlyResearchingTech);
  const dispatch = useAppDispatch();
  const [tool1, setTool1] = useState(0);
  const [tool2, setTool2] = useState(3);
  const [tool3, setTool3] = useState(2);
  const [tool4, setTool4] = useState(1);
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (Math.random() < .51)
        setTool1(loop(tool1));
      if (Math.random() < .51)
        setTool2(loop(tool2));
      if (Math.random() < .51)
        setTool3(loop(tool3));
      if (Math.random() < .51)
        setTool4(loop(tool4));
    }, 1000);
    return () => {
      window.clearInterval(interval);
    }
  });
  const techs = Object.values(TechData);
  return <div>
      <div className="col-2">
        <div>
          <h2>Research 🧪 Lab</h2>
          <div className="vertical">
            {
              techs.map((t) => renderTech(t, techProgress, currentTech, (t) => dispatch(setResearch({t: t}))))
            }
          </div>
        </div>
      <div className="vertical">
        <div>
          <div className="robot">
            🤖
            <RobotArm classN="far-left" tool={tools[tool1]}></RobotArm>
            <RobotArm classN="left" tool={tools[tool2]}></RobotArm>
            <RobotArm classN="near-right" tool={tools[tool3]}></RobotArm>
            <RobotArm classN="far-right" tool={tools[tool4]}></RobotArm>
          </div>
        </div>
        <div className="h-42em">
          {
            abductedBeanKeys.map((b) => {
              return <span key={b} className="victim bean triangle shake">😨</span>
            })
          }
        </div>

        <div className="text-center">
          Currently probing {abductedBeanKeys.length} beings for {abductedBeanKeys.length} tech a day
          <p>
            <small>1 tech per research subject per day</small>
          </p>
        </div>
        {
          abductedBeanKeys.length > 0 ? <div className="text-right">
            <ConfirmButton className="callout" onConfirm={() => {dispatch(release())}} confirmText="-1 Research Subject?">
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