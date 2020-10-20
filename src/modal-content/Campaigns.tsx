import React from "react";

export class CampaignsPanel extends React.Component<{

}>{
    render(){
        return <div className="pad-4p">
        <div className="subheader">
            <h3>Propaganda</h3>
            <button type="button" className="callout" onClick={() => void(0)} >🎙️ Buy Propaganda</button>
        </div>
        <span>
          Propaganda changes beans' feelings on a wide variety of topics.
        </span>
        <div className="card-parent">
          <button type="button" className="card button">
            <span className="h">
              📺 Broadcast Campaign
            </span>
            <small>Approval+ Cash-</small>
            <span className="p">
              Small chance to increase Approval among all beans
            </span>
          </button>
          <button type="button" className="card button">
            <span className="h">
              👋 Canvassing
            </span>
            <small>Approval+ Labor-</small>
            <span className="p">
              Chance to increase Approval on a few random beans
            </span>
          </button>
          <button type="button" className="card button">
            <span className="h">
              🗞️ Print Campaign
            </span>
            <small>Approval+ Cash-</small>
            <span className="p">
              Chance to increase Approval on wealthy beans
            </span>
          </button>
        </div>
        <div className="subheader">
            <h3>Appearances</h3>
            <button type="button" className="callout" onClick={() => void(0)} >💬 Schedule Appearance</button>
        </div>
        <span>
          Appearances have limited reach, but have powerful effects.
        </span>
        <div className="card-parent">
          <button type="button" className="card button">
            <span className="h">
            🤔 Debating
            </span>
            <small>
              Labor-
            </small>
            <span className="p">
              Chance to gain or lose Influence
            </span>
          </button>
          <button type="button" className="card button">
            <span className="h">
            📸 Photo Op
            </span>
            <small>
              Labor-
            </small>
            <span className="p">
              Increases Approval within one Social Group
            </span>
          </button>
          <button type="button" className="card button">
            <span className="h">
              🎤 Speechmaking
            </span>
            <small>
              Labor-
            </small>
            <span className="p">
              Increases chance of Donations in a single City
            </span>
          </button>
          <button type="button" className="card button">
            <span className="h">
            🙋 Town Hall
            </span>
            <small>
              Labor-
            </small>
            <span className="p">
              Suppresses negative Approval in a single city                     
            </span>
          </button>
        </div>
        {/* <CharityPanel world={this.state.world} onFoundCharity={this.foundCharity}></CharityPanel>
        <div>
          <b>Campaign Finances</b> <br/>
          <b>Expenses</b> ${seasonalCost} <b>Surplus</b> ${this.state.world.party.seasonalIncome - seasonalCost}
        </div> */}
      </div>
    }
}