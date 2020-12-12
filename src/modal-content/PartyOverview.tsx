import React from "react";
import { World, Axis, TraitIcon } from "../World";
import { policy, keyToName } from "../App";
import { PolicyDropdown } from "../widgets/PolicyDropdown";
import { PolicyTree, PolicyByKey, IPolicy } from "../simulation/Politics";
import { PrimaryBeliefData } from "../simulation/Beliefs";

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

        return <div>
            <div className="col-2">
                <h2 className="marg-b-0">Utopia Government</h2>
                <div>
                    <h2 className="marg-b-0">5 🗳️ 
                        <small>
                        Leadership
                        </small>                        
                        <button type="button" className="callout pull-r">
                        🧪 View Research Lab
                        </button>
                    </h2>  
                </div>
            </div>
            <div className="pad-4p">
                {this.props.world.party.name} is a&nbsp;
                {PrimaryBeliefData[this.props.world.party.community].adj} {PrimaryBeliefData[this.props.world.party.community].icon}&nbsp; 
                {PrimaryBeliefData[this.props.world.party.ideals].adj} {PrimaryBeliefData[this.props.world.party.ideals].icon}&nbsp;
                Utopia
            </div>
            <div className="col-2-30-60">
                <div className="max-h-365">
                <table className="full">
                    <tbody>
                        <tr>
                            <td>
                                <strong>Taxation</strong>
                            </td>
                            <td>
                                <button className="callout marg-0">Add 🗳️</button>
                                <button className="callout marg-0">📁</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Poll Tax</i> 🦅
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Welfare</strong>
                            </td>
                            <td>
                                <button className="callout marg-0">Add 🗳️</button>
                                <button className="callout marg-0">📁</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Food Bank</i> 🦅
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Universal Healthcare</i> 🕊️ 
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Council Housing</i> 🕊️ 
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Economics</strong>
                            </td>
                            <td>
                                <button className="callout marg-0">Add 🗳️</button>
                                <button className="callout marg-0">📁</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Grain Subsidy</i> 🦅
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Crime</strong>
                            </td>
                            <td>
                                <button className="callout marg-0">Add 🗳️</button>
                                <button className="callout marg-0">📁</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Free Speech</i> 🦅
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Culture</strong>
                            </td>
                            <td>
                                <button className="callout marg-0">Add 🗳️</button>
                                <button className="callout marg-0">📁</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <i>Secularism</i> 🦅
                            </td>
                            <td>
                                <button className="callout marg-0">🔍</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <div className="border">

                </div>
            </div>
          <div className="policies">
            {this.props.world.party.availablePolicies.map((p) => policy(p))}
          </div>
          {/* <div className="pad-4p">
                <h3 className="small">
                    Platform
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
          </div>
           */}
        </div>
    }
}