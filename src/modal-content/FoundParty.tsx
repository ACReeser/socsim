import React, { ChangeEvent } from "react";
import { TraitCommunity, TraitIdeals } from "../World";

export interface FoundPartyPS
{
}
interface FoundPartyS
{
    community: TraitCommunity|null
    ideal: TraitIdeals|null,
    name: string,
    slogan: string
}

export class FoundParty extends React.Component<FoundPartyPS, FoundPartyS> {
    constructor(props: any) {
        super(props);
        this.state = {
            community: null,
            ideal: null,
            name: "Citizen's Party",
            slogan: "Vote for us!"
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
            this.setState({name: 'Family Liberty Party'});
        } else if (this.state.community === 'ego' && this.state.ideal === 'prog') {
            this.setState({name: "Free Labor Party"});
        } else if (this.state.community === 'state' && this.state.ideal === 'trad') {
            this.setState({name: "National Landowners's Party"});
        } else if (this.state.community === 'state' && this.state.ideal === 'prog') {
            this.setState({name: "Social People's Party"});
        }
    }
    onName = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({name: e.target.value});
    }
    onSlogan = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({slogan: e.target.value});
    }
    render(){
        return <div>            
          <h2>Found your Political Party</h2>
          <div className="col-2">
            <div>
              My fellow party members believe the
              <div>
                <label>
                  <input type="radio" name="community" value="state" checked={this.state.community === 'state'} onChange={(e) => this.onCommunity(e.currentTarget.value as TraitCommunity)} /> <b>Government</b>
                </label>
                &nbsp;&nbsp;or&nbsp;&nbsp;
                <label>
                  <input type="radio" name="community" value="ego" checked={this.state.community === 'ego'} onChange={(e) => this.onCommunity(e.currentTarget.value as TraitCommunity)}/> <b>Individual</b>
                </label>
              </div>
              &nbsp;
              is responsible for well-being.
            </div>
            <div>
              My fellow party members believe in
              <div>
                <label>
                  <input type="radio" name="ideal" value="trad" checked={this.state.ideal === 'trad'} onChange={(e) => this.onIdeal(e.currentTarget.value as TraitIdeals)}/> <b>Traditional</b>
                </label>
                &nbsp;&nbsp;or&nbsp;&nbsp;
                <label>
                  <input type="radio" name="ideal" value="prog" checked={this.state.ideal === 'prog'} onChange={(e) => this.onIdeal(e.currentTarget.value as TraitIdeals)} /> <b>Progressive</b>
                </label>
              </div>
              &nbsp;
              social values.
            </div>
          </div>
          <hr />
          <div className="col-2">
            <div>
              My party's first members are mostly <b>Low-Income</b>
            </div>
            <div>
              My party's first major legislative goal is to pass <b>Food Welfare</b>
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
        </div>
    }
}