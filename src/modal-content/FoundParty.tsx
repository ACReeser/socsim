import React, { ChangeEvent } from "react";
import { TraitCommunity, TraitIdeals, City } from "../World";
import { CityDropdown } from "../widgets/Dropdown";

export interface FoundPartyPS
{
    cities: City[],
    onFound: (state: FoundPartyS) => void
}
export interface FoundPartyS
{
    community: TraitCommunity|null
    ideal: TraitIdeals|null,
    name: string,
    slogan: string,
    members: string,
    goal: string,
    cityKey: number
}

export class FoundParty extends React.Component<FoundPartyPS, FoundPartyS> {
    constructor(props: any) {
        super(props);
        this.state = {
            community: null,
            ideal: null,
            name: "Superbeing",
            slogan: "Perfection is achievable.",
            members: "Citizens",
            goal: "Legislation",
            cityKey: 0
        }
    }
    onCommunity(val: TraitCommunity){
        this.setState({community: val}, () => {
            this.onBigFourChange();
        });
    }
    onIdeal(val: TraitIdeals){
        this.setState({ideal: val}, () => {
            this.onBigFourChange();
        });
    }
    onBigFourChange(){
        if (this.state.community === 'ego' && this.state.ideal === 'trad'){
            this.setState({
                name: 'Arcadia',
                slogan: "A man belongs on the farm.",
                members: "Farmers", goal: "Tariffs"});
        } else if (this.state.community === 'ego' && this.state.ideal === 'prog') {
            this.setState({
                name: "Libertaria",
                slogan: "Freedom for every being!",
                members: "Builders", goal: "Right to Strike"});
        } else if (this.state.community === 'state' && this.state.ideal === 'trad') {
            this.setState({
                name: "Ultimate Kingdom",
                slogan: "Honor to King and family.",
                members: "Homeowners", goal: "Repeal Property Tax"});
        } else if (this.state.community === 'state' && this.state.ideal === 'prog') {
            this.setState({
                name: "Equus",
                slogan: "True equality is peace.",
                members: "Penniless", goal: "Food Welfare"});
        }
    }
    onName = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({name: e.target.value});
    }
    onSlogan = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({slogan: e.target.value});
    }
    onCity = (key: any) => {
        this.setState({cityKey: +key});
    }
    render(){
        return <div>            
          <h2>Found your Utopia</h2>
          <div className="col-2">
            <div>
              Perfect societies rely on the
              <div>
                <label>
                  <input type="radio" name="community" value="state" checked={this.state.community === 'state'} onChange={(e) => this.onCommunity(e.currentTarget.value as TraitCommunity)} /> <b>Government</b> 🐘 {/*🤝*/}
                </label>
                &nbsp;&nbsp;or&nbsp;&nbsp;
                <label>
                  <input type="radio" name="community" value="ego" checked={this.state.community === 'ego'} onChange={(e) => this.onCommunity(e.currentTarget.value as TraitCommunity)}/> <b>Individual</b> 🦅 {/*✌️*/}
                </label>
              </div>
              &nbsp;
              to guarantee well-being.
            </div>
            <div>
              Perfect beings devote themselves to
              <div>
                <label>
                  <input type="radio" name="ideal" value="trad" checked={this.state.ideal === 'trad'} onChange={(e) => this.onIdeal(e.currentTarget.value as TraitIdeals)}/> <b>Traditional</b> {/*🕯️ 🔮*/} 👑
                </label>
                &nbsp;&nbsp;or&nbsp;&nbsp;
                <label>
                  <input type="radio" name="ideal" value="prog" checked={this.state.ideal === 'prog'} onChange={(e) => this.onIdeal(e.currentTarget.value as TraitIdeals)} /> <b>Progressive</b> {/*💡 🔬*/} 🎓
                </label>
              </div>
              &nbsp;
              social values.
            </div>
          </div>
          <hr />
          <div className="col-2">
            <div>
              My Utopia is named <input type="text" value={this.state.name} onChange={this.onName} />
            </div>
            <div>
              My Utopia's mantra is <input type="text" value={this.state.slogan} onChange={this.onSlogan}  />
            </div>
          </div>
          <hr/>
          <button type="button" disabled={this.state.community == null || this.state.ideal == null} className="important btn-found-party" onClick={() => this.props.onFound(this.state)}>Found the {this.state.name} Utopia</button>
        </div>
    }
}