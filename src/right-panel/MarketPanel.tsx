import React from "react";
import { Player } from "../simulation/Player";
import { CostSmall } from "../widgets/CostSmall";

 export class MarketPanel extends React.Component<{
     player: Player,
     buyEnergy: (amount: number) => void,
     buyBots: (amount: number) => void,
     scrubHedons: () => void,
 }>{
     render(){
        return <div>
            <div className="text-center">
                <strong>🌌 Galactic 😨 Emotion 💰 Market</strong>
            </div>
            <p>
                <small>
                    The premier exchange for ⚡️, 🤖,  and 👍!
                </small>
            </p>
            <div className="card-parent">
                <button className="card button" onClick={() => this.props.buyEnergy(1)}
                    disabled={!this.props.player.canAfford(this.props.player.difficulty.cost.market.resource.energy)}>
                    +1 ⚡️ Energy
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.energy} qty={1} ></CostSmall>
                </button>
                <button className="card button" onClick={() => this.props.buyEnergy(5)}
                    disabled={!this.props.player.canAfford(this.props.player.difficulty.cost.market.resource.energy, 5)}>
                    +5 ⚡️ Energy
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.energy} qty={5} ></CostSmall>
                </button>
            </div>
            <div className="card-parent">
                <button className="card button" onClick={() => this.props.buyBots(1)}
                    disabled={!this.props.player.canAfford(this.props.player.difficulty.cost.market.resource.bots)}>
                    +1 🤖 Bot
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots} qty={1} ></CostSmall>
                </button>
                <button className="card button" onClick={() => this.props.buyBots(5)}
                    disabled={!this.props.player.canAfford(this.props.player.difficulty.cost.market.resource.bots, 5)}>
                    +5 🤖 Bots
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots} qty={5} ></CostSmall>
                </button>
            </div>
            <div className="card-parent">
                <button className="card button" onClick={() => this.props.scrubHedons()}
                    disabled={this.props.player.hedons.amount >= 0 || !this.props.player.canAfford(this.props.player.difficulty.cost.market.scrubHedons)}>
                    Remove 💢 Negative Hedons
                    <CostSmall cost={this.props.player.difficulty.cost.market.scrubHedons} qty={1} ></CostSmall>
                </button>
                {/* <button className="card button" onClick={() => this.props.buyBots(5)}
                    disabled={!this.props.player.canAfford(this.props.player.difficulty.cost.market.resource.bots, 5)}>
                    +5 🤖 Bots
                    <CostSmall cost={this.props.player.difficulty.cost.market.resource.bots} qty={5} ></CostSmall>
                </button> */}
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