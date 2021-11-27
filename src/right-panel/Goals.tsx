import React from "react";
import { triadToString } from "../Game";
import { Curriculums, GetAverage, Goals, IGoal, IGoalProgress } from "../simulation/Player";
import { useAppSelector } from "../state/hooks";


function renderReward(g: IGoal){
  return <div>
    <small>
    <span role="img" aria-label="gift">🎁</span> {triadToString(g.reward || {}, '+')}
    </small>
  </div>
}
function renderGoal(progress: IGoalProgress|undefined, g: IGoal){
  return <li>
    {progress?.done ? '☑️': '⭕️'}
    {g.text}
    {g.tooltip != null ? <small title={g.tooltip}>❔</small> : null}
    {progress?.done || g.reward == null ? null : renderReward(g)}
  </li>
}
export const GoalsPanel: React.FC = () => {
  const progress = useAppSelector(x => x.world.alien.goalProgress);
  const goals = useAppSelector(x => x.world.alien.goals);
  const workingReportCard = useAppSelector(x => x.world.alien.workingReportCard);
  return (<div className="goals">
    <div><b>Goals</b></div>
    <ul>
      {goals.map((key) => {
        return renderGoal(progress[key], Goals[key]);
      })}
    </ul>
    <div><b>Report Card</b></div>
    <p className="horizontal">
      <span>
        Last Grade: <b>D</b>
      </span>
      <span>
        Next Grade in: <b>2 mo.</b>
      </span>
    </p>
    <p>
    </p>
    <table style={{margin: 'auto'}}>
      <tbody>
        <tr>
          <th><span role="img" aria-label="target">🎯</span> Happiness
          </th>
          <td>
            {workingReportCard.Happiness}
          </td>
          <td>
            <small title="Are your subjects happy?">❔</small>
          </td>
        </tr>
        <tr>
          <td className="text-left" colSpan={3}>
            <small>
          {Curriculums.Default.RubricDescription.Happiness}
            </small>
          </td>
        </tr>
        <tr>
          <th><span role="img" aria-label="target">🎯</span> Prosperity</th>
          <td>
            {workingReportCard.Prosperity}
          </td>
          <td>
            <small title="Are your subjects fed and healthy?">❔</small>
          </td>
        </tr>
        <tr>
          <td className="text-left" colSpan={3}>
          <small>{Curriculums.Default.RubricDescription.Prosperity}</small>
          </td>
        </tr>
        <tr>
          <th><span role="img" aria-label="target">🎯</span> Stability
          </th>
          <td>
            {workingReportCard.Stability}
          </td>
          <td>
            <small title="Are your subjects sane and civil?">❔</small>
          </td>
        </tr>
        <tr>
          <td className="text-left" colSpan={3}>
          <small>{Curriculums.Default.RubricDescription.Stability}</small>
          </td>
        </tr>
        <tr>
          <th><span role="img" aria-label="target">🎯</span> Dogma
          </th>
          <td>
            {workingReportCard.Dogma}
          </td>
          <td>
            <small title="Do your society's rules match your utopian ideals?">❔</small>
          </td>
        </tr>
        <tr>
          <td className="text-left" colSpan={3}>
          <small>{Curriculums.Default.RubricDescription.Dogma}</small>
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <hr />
          </td>
        </tr>
        <tr>
          <th>
            Avg. Grade
          </th>
          <td>
            {GetAverage(workingReportCard)}
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>)
}