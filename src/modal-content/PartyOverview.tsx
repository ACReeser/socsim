import React from "react";
import { World } from "../World";
import { policy } from "../App";

export interface PartyOverviewPS{
    world: World;
}
interface PartyOverviewS{

}

export class PartyOverview extends React.Component<PartyOverviewPS, PartyOverviewS> {
    constructor(props: any) {
        super(props);
    }
    render(){
        return <div>
            <div className="col-2">
            <div>
              <h2>
                {this.props.world.party.name}
              </h2>
            </div>
            <div>              
              <h2 className="slogan-group">
                <span className="slogan-before">
                  <span className="align-base">
                    ★★★
                  </span>
                </span>
                <span className="slogan">
                  {this.props.world.party.slogan}
                </span>
                <span className="slogan-after">
                  <span className="align-base">
                    ★★★
                  </span>
                </span>
              </h2>
            </div>
          </div>
          <div className="policies">
            {this.props.world.party.availablePolicies.map((p) => policy(p))}
          </div>
          <div className="col-2">
              <table className="classic">
                  <thead>
                      <tr>
                          <th colSpan={3}>Finances</th>
                      </tr>
                  </thead>
                  <tbody>
                    <tr>
                        <th rowSpan={2}>Revenue</th>
                        <td>
                            Megadonors
                        </td>
                        <td> +$1 </td>
                    </tr>
                    <tr>
                        <td>Grassroots</td>
                        <td>+$1</td>
                    </tr>
                    <tr>
                        <th className="border-t" rowSpan={2}>Expenses</th>
                        <td className="border-t">
                            Charities
                        </td>
                        <td className="border-t">
                            -$1
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Propaganda
                        </td>
                        <td>
                            -$1
                        </td>
                    </tr>
                    <tr>
                        <th className="border-t" rowSpan={2}>Physical<br/>Capital</th>
                        <td className="border-t">
                            Income
                        </td>
                        <td className="border-t">
                            ${this.props.world.party.seasonalIncome.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            On Hand
                        </td>
                        <td>
                            ${this.props.world.party.materialCapital.toFixed(2)}
                        </td>
                    </tr>
                  </tbody>
              </table>
            <div>

            </div>
          </div>
        </div>
    }
}