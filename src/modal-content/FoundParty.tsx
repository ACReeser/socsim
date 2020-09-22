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
            name: "Citizen's Party",
            slogan: "Vote for us!",
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
                name: 'Liberal Family Party',
                slogan: "Father Knows Best.",
                members: "Farmers", goal: "Tariffs"});
        } else if (this.state.community === 'ego' && this.state.ideal === 'prog') {
            this.setState({
                name: "Free Worker's Party",
                slogan: "Liberty for Labor!",
                members: "Builders", goal: "Right to Strike"});
        } else if (this.state.community === 'state' && this.state.ideal === 'trad') {
            this.setState({
                name: "National Landowners' Party",
                slogan: "For Culture & Country!",
                members: "Homeowners", goal: "Repeal Property Tax"});
        } else if (this.state.community === 'state' && this.state.ideal === 'prog') {
            this.setState({
                name: "Social People's Party",
                slogan: "Equality, Guaranteed.",
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
          <h2>Found your Political Party</h2>
          <div className="col-2">
            <div>
              My fellow party members believe the
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
              is responsible for well-being.
            </div>
            <div>
              My fellow party members believe in
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
              My party's first members are mostly <b>{this.state.members}</b>
            </div>
            <div>
              My party's first major goal is to pass <b>{this.state.goal}</b>
            </div>
          </div>
          <hr />
          <div className="col-2">
            <div>
              My party is named <input type="text" value={this.state.name} onChange={this.onName} />
            </div>
            <div>
              My party's slogan is <input type="text" value={this.state.slogan} onChange={this.onSlogan}  />
            </div>
          </div>
          <hr />
          <div className="col-2">
            <div>
              My party is based in&nbsp;<CityDropdown options={this.props.cities} onChange={this.onCity}></CityDropdown>
            </div>
            <div>
              
            </div>
          </div>
          <button type="button" disabled={this.state.community == null || this.state.ideal == null} className="important btn-found-party" onClick={() => this.props.onFound(this.state)}>Found the {this.state.name}</button>
        </div>
    }
}