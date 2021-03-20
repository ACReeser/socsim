import React from "react";
import { Player } from "../simulation/Player";
import { CostSmall } from "../widgets/CostSmall";

 export class MarketPanel extends React.Component<{
     player: Player
 }>{
     render(){
        return <div>
            <div className="text-center">
                <strong>🌌 Galactic 😨 Emotion 💰 Market</strong>
            </div>
            <p>
                <small>
                    <i> Exchange 👍 for energy and matter!</i>
                </small>
            </p>
            <div className="card-parent">
                <button className="card button">
                    +1 ⚡️ Energy
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.energy} qty={1} ></CostSmall>
                </button>
                <button className="card button">
                    +5 ⚡️ Energy
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.energy} qty={5} ></CostSmall>
                </button>
            </div>
            <div className="card-parent">
                <button className="card button">
                    +1 🤖 Bot
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots} qty={1} ></CostSmall>
                </button>
                <button className="card button">
                    +5 🤖 Bots
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots} qty={5} ></CostSmall>
                </button>
            </div>
            <div>
                
                <small>
                    <i>Current 🧠 Traits for sale:</i>
                </small>
            </div>
            <div className="short-scroll">
                <div className="card-parent">
                    <button className="card button">
                        🍸 Cosmopolitanism
                        <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots}></CostSmall>
                    </button>
                </div>
                <div className="card-parent">
                    <button className="card button">
                        👽 Paranoia
                        <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots}></CostSmall>
                    </button>
                </div>
                <div className="card-parent">
                    <button className="card button">
                        🤬 Antagonism
                        <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots}></CostSmall>
                    </button>
                </div>
            </div>
        </div>
     }
 }