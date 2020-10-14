import React from "react";
import { World, Axis, TraitIcon } from "../World";
import { policy, keyToName } from "../App";
import { PolicyDropdown } from "../widgets/PolicyDropdown";
import { PolicyTree, PolicyByKey, IPolicy } from "../Politics";

export interface PartyOverviewPS{
    world: World;
    setPolicy(axis: Axis, policy: IPolicy): void;
}
interface PartyOverviewS{

}

export class PartyOverview extends React.Component<PartyOverviewPS, PartyOverviewS> {
    constructor(props: any) {
        super(props);
    }
    setPolicy(axis: Axis){
        return (policyKey: string) => {
            const pol = PolicyByKey(policyKey);
            if (pol){
                this.props.setPolicy(axis, pol);
            }
        }
    }
    render(){
        const hqs = this.props.world.cities.filter((x) => x.partyHQ != null);
        const hq_names = hqs.map((x, i) => <i>{(i > 0 ? ', ': '')}{x.name}</i>);
        const actionLimit = this.props.world.party.activeHQs.length + 2;

        return <div>
            <div className="col-2">
            <div>
              <h2>
                {this.props.world.party.name}
              </h2>
            </div>
            <div>
                <h4>
                <i>{this.props.world.party.slogan}</i>
                </h4>
            </div>
          </div>
          <div className="policies">
            {this.props.world.party.availablePolicies.map((p) => policy(p))}
          </div>
          <div className="pad-4p">
                <h3 className="small">
                    Platform
                    <button type="button" className="pull-r">
                    🧪 View Political Science
                    </button>
                </h3>
                <div className="horizontal">
                    <div className="vertical reverse">
                        <div className="platform-subheader">Welfare</div>
                        <PolicyDropdown options={PolicyTree.wel_food} value={this.props.world.party.platform.wel_food} onChange={this.setPolicy('wel_food')} hint="Nutrition"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.wel_house} value={this.props.world.party.platform.wel_house} onChange={this.setPolicy('wel_house')} hint="Housing"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.wel_health} value={this.props.world.party.platform.wel_health} onChange={this.setPolicy('wel_health')} hint="Healthcare"></PolicyDropdown>
                    </div>
                    <div className="vertical reverse">
                        <div className="platform-subheader">Taxation</div>
                        <PolicyDropdown options={PolicyTree.tax_basic} value={this.props.world.party.platform.tax_basic} onChange={this.setPolicy('tax_basic')} hint="Basic Tax"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.tax_second} value={this.props.world.party.platform.tax_second} onChange={this.setPolicy('tax_second')} hint="Secondary Tax"></PolicyDropdown>
                    </div>
                    <div className="vertical reverse">
                        <div className="platform-subheader">Economics</div>
                        <PolicyDropdown options={PolicyTree.econ_ex} value={this.props.world.party.platform.econ_ex} onChange={this.setPolicy('econ_ex')} hint="External"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.econ_labor} value={this.props.world.party.platform.econ_labor} onChange={this.setPolicy('econ_labor')} hint="Labor"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.econ_sub} value={this.props.world.party.platform.econ_sub} onChange={this.setPolicy('econ_sub')} hint="Subsidies"></PolicyDropdown>
                    </div>
                    <div className="vertical reverse">
                        <div className="platform-subheader">Culture</div>
                        <PolicyDropdown options={PolicyTree.cul_rel} value={this.props.world.party.platform.cul_rel} onChange={this.setPolicy('cul_rel')} hint="Religion"></PolicyDropdown>
                        {
                            this.props.world.party.platform.cul_rel && this.props.world.party.platform.cul_rel.key == '20' ?
                            <PolicyDropdown options={PolicyTree.cul_theo} value={this.props.world.party.platform.cul_theo} onChange={this.setPolicy('cul_theo')} hint="Theocracy"></PolicyDropdown> : null
                        }
                        <PolicyDropdown options={PolicyTree.cul_ed} value={this.props.world.party.platform.cul_ed} onChange={this.setPolicy('cul_ed')} hint="Education"></PolicyDropdown>
                    </div>
                    <div className="vertical reverse">
                        <div className="platform-subheader">Law</div>
                        <PolicyDropdown options={PolicyTree.law_vote} value={this.props.world.party.platform.law_vote} onChange={this.setPolicy('law_vote')} hint="Voting"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.law_bribe} value={this.props.world.party.platform.law_bribe} onChange={this.setPolicy('law_bribe')} hint="Corruption"></PolicyDropdown>
                        <PolicyDropdown options={PolicyTree.law_imm} value={this.props.world.party.platform.law_imm} onChange={this.setPolicy('law_imm')} hint="Immigration"></PolicyDropdown>
                    </div>
                </div>
                <div className="horizontal">
                    <div className="grow-1 platform-identity">
                        { keyToName[this.props.world.party.community]}
                        &nbsp;
                        {TraitIcon[this.props.world.party.community]}
                    </div>
                    <div className="grow-1 platform-identity">
                        { keyToName[this.props.world.party.ideals]}
                        &nbsp;
                        {TraitIcon[this.props.world.party.ideals]}
                    </div>
                </div>
                <div>
                    <label>
                        Legislative Focus: &nbsp;
                        <PolicyDropdown 
                            options={Object.values(this.props.world.party.platform).filter(x => x != null)}
                            onChange={() => {}}
                        ></PolicyDropdown>
                    </label>
                </div>
          </div>
          <div className="col-2">
            <div>
                <h3 className="small">Finances</h3>
                <small>Where money is being raised and spent</small>
                <table className="classic">
                {/* <thead>
                    <tr>
                        <th colSpan={3}>Finances</th>
                    </tr>
                </thead> */}
                <tbody>
                <tr>
                    <th rowSpan={3}>Revenue</th>
                    <td>
                        Solicitations
                    </td>
                    <td> +$1 </td>
                </tr>
                <tr>
                    <td>Unsolicited Donations</td>
                    <td>+$1</td>
                </tr>
                <tr>
                    <td>Fundraisers</td>
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
            </div>
            <div>
                <h3 className="small">Headquarters</h3>
                <small>Party HQs add Activities and cash donations</small>
                <div>
                    <strong>HQ Locations:</strong> {hq_names}
                </div>
                <h3 className="small">Activities</h3>
                <small>Number of things that can be done in one season</small>
                <div>
                    2 free actions + {this.props.world.party.activeHQs.length} Activities from party HQs
                </div>
                <div>
                    {actionLimit - this.props.world.party.seasonalActions} Activities remaining this season
                </div>
            </div>
          </div>
        </div>
    }
}