import React from "react";

export interface GoalPanelPS
{
}

export class GoalsPanel extends React.Component<GoalPanelPS> {
    render(){
        return (<div className="goals">
        <div><b>Goals</b></div>
        <ul>
          <li>
          ☑️ Found Utopia
          </li>
          <li>
          ⭕️ Scan a Subject
            <small title="Select a single earthling and Scan it">❔</small>
          </li>
          <li>
          ⭕️ Brainwash a Subject
          </li>
          <li>
          ⭕️ Set Government Policy
          </li>
          <li>
          ⭕️ Get a C+ Utopia Grade
          </li>
        </ul>
        <div><b>Report Card</b></div>
        <p>
          Last Grade: <b>D</b>
        </p>
        <p>
          6 mo s til next grade.
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