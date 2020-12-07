import React from "react";
import { triadToString } from "../Game";
import { Goals, IGoal, IPlayerData, IProgressable } from "../simulation/Player";

export interface GoalPanelPS
{
  player: IPlayerData;
  progress: IProgressable;
}

export class GoalsPanel extends React.Component<GoalPanelPS> {
  renderReward(g: IGoal){
    return <div>
      <small>
      🎁 {triadToString(g.reward || {}, '+')}
      </small>
    </div>
  }
  renderGoal(g: IGoal){
    const done = this.props.progress.goalProgress[g.key] != null && this.props.progress.goalProgress[g.key].done;
    return <li>
      {done ? '☑️': '⭕️'}
      {g.text}
      {g.tooltip != null ? <small title={g.tooltip}>❔</small> : null}
      {done || g.reward == null ? null : this.renderReward(g)}
    </li>
  }
    render(){
        return (<div className="goals">
        <div><b>Goals</b></div>
        <ul>
          {this.props.progress.goals.map((key) => {
            return this.renderGoal(Goals[key]);
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
              <th>Happiness
              </th>
              <td>
                D
              </td>
              <td>
                <small title="Are your subjects happy?">❔</small>
              </td>
            </tr>
            <tr>
              <th>Prosperity</th>
              <td>
                D
              </td>
              <td>
                <small title="Are your subjects fed and healthy?">❔</small>
              </td>
            </tr>
            <tr>
              <th>Stability
              </th>
              <td>
                D
              </td>
              <td>
                <small title="Are your subjects sane and civil?">❔</small>
              </td>
            </tr>
            <tr>
              <th>Dogma
              </th>
              <td>
                B
              </td>
              <td>
                <small title="Do your society's rules match your utopian ideals?">❔</small>
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
                C
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <p>
          Receive an "A" in "Prosperity" <br/> to receive 3 Psi
        </p>
      </div>)
    }
}