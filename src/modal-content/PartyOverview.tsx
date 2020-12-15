import React from "react";
import { World, TraitIcon } from "../World";
import { policy, keyToName } from "../App";
import { PolicyDropdown } from "../widgets/PolicyDropdown";
import { IPolicy } from "../simulation/Politics";
import { PrimaryBeliefData } from "../simulation/Beliefs";
import { ILaw, LawAxis, LawAxisData, LawData, LawGroup, LawKey } from "../simulation/Government";

export interface PartyOverviewPS{
    world: World;
    setPolicy(axis: LawAxis, policy: IPolicy): void;
}
interface PartyOverviewS{
    detailView: 'none'|'group_add'|'law_view',
    detailGroup?: LawGroup,
    detailLaw?: ILaw,
    collapsedGroups: {[key in LawGroup]: boolean}
}

export class PartyOverview extends React.Component<PartyOverviewPS, PartyOverviewS> {
    constructor(props: any) {
        super(props);
        this.state = {
            detailView: 'none',
            collapsedGroups: {
                Crime: false,
                Taxation: false,
                Welfare: false,
                Culture: false,
                Economics: false,
            }
        }
    }
    setPolicy(axis: LawAxis){
    }
    renderDetailLaw(law: LawKey){
        const ldata = LawData[law];
        const incompatibilities = Object.values(LawData).filter(
            (x) => x.key != law && x.axis === ldata.axis
        );
        return  <div>
        <div className="horizontal">
            <strong className="f-size-15em">
                {ldata.name}
            </strong>
            <span>
                <span className="badge pos">
                    +🦅
                </span>
                <span className="badge neg">
                    -🦅
                </span>
            </span>
        </div>
        <div>
            <i>Government Policy for
                {LawAxisData[ldata.axis].name}
            </i>
        </div>
        <div>
            <p>
                {ldata.description}
            </p>
            <div className="horizontal">
                <span>
                    <strong>Subjects Fed:</strong> 1
                </span>
                <span>
                    <strong>Last Monthly Cost:</strong> $1
                </span>
            </div>
            <div className="horizontal">
                <span>
                    <strong>Max. Monthly Cost:</strong> <input type="number" />
                </span>
            </div>
            <strong>Incompatible with</strong>
            {
                incompatibilities.map((x, i) => <i key={x.name}>{i > 0 ? <span>,</span>: null} {x.name}</i>
                )
            }
        </div>
    </div>;
    }
    renderDetailGroup(){
        return <div>
            <div className="horizontal">
                <strong className="f-size-15em">
                    Food Banks
                </strong>
                <span>
                    <span className="badge pos">
                        +🦅
                    </span>
                    <span className="badge neg">
                        -🦅
                    </span>
                </span>
                <button className="callout marg-0">
                    Adopt for 3 🗳️ 
                </button>
            </div>
            <div>
                <i>Government Policy for Food Welfare</i>
            </div>
            <div>
                <p>
                    Hungry Subjects are provided food purchased by the government.
                </p>
                <div className="horizontal">
                    <span>
                        <strong>Max. Monthly Cost:</strong> <input type="number" />
                    </span>
                </div>
                <strong>Incompatible with</strong> <i>Let Them Eat Cake</i>, <i>Food Stamps</i>, <i>Universal Rations</i>
            </div>
        </div>;
    }
    toggleGroup(group: LawGroup){
        this.state.collapsedGroups[group] = !this.state.collapsedGroups[group];
        this.setState({collapsedGroups: this.state.collapsedGroups});
    }
    renderHeader(group: LawGroup){
        return <tr>
            <td>
                <strong>{group}</strong>
            </td>
            <td>
                <button className="callout marg-0" onClick={() => this.setState({detailView: 'group_add'})}>Add 🗳️</button>
                <button className="callout marg-0" onClick={() => this.toggleGroup(group)}>📁</button>
            </td>
        </tr>
    }
    renderRow(group: LawGroup){
        if (this.state.collapsedGroups[group])
            return null;
        return <tr>
            <td>
                <i>Food Bank</i> 🦅
            </td>
            <td>
                <button onClick={() => this.setState({detailView: 'law_view'})} className="callout marg-0">🔍</button>
            </td>
        </tr>;
    }
    render(){
        const hqs = this.props.world.cities.filter((x) => x.partyHQ != null);
        const hq_names = hqs.map((x, i) => <i>{(i > 0 ? ', ': '')}{x.name}</i>);

        return <div>
            <div className="col-2">
                <h2 className="marg-b-0">Utopia Government</h2>
                <div>
                    <div className="horizontal blue-orange cylinder f-size-15em marg-t-20">
                        <button type="button" className="active">
                            📜 Laws
                        </button>
                        <button type="button" className=" ">
                            5 🗳️ Leadership
                        </button>
                        <button type="button" className="">
                            💰 Funding
                        </button>
                    </div>
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
                        {this.renderHeader('Taxation')}
                        {this.renderRow('Taxation')}
                        {this.renderHeader('Welfare')}
                        {this.renderRow('Welfare')}
                        {this.renderHeader('Economics')}
                        {this.renderRow('Economics')}
                        {this.renderHeader('Crime')}
                        {this.renderRow('Crime')}
                        {this.renderHeader('Culture')}
                        {this.renderRow('Culture')}
                    </tbody>
                </table>
                </div>
                <div className="border">
                    {this.renderDetail()}
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
    renderDetail(): React.ReactNode {
        if (this.state.detailView === 'group_add'){
            return this.renderDetailGroup();
        } else if (this.state.detailView === 'law_view'){
            return this.renderDetailLaw('stay_healthy')
        }
        return null;
    }
}