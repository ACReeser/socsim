import React, { useEffect, useState } from "react";
import { LiveList } from "../events/Events";
import { SecondaryBeliefData } from "../simulation/Beliefs";
import { MarketTraitListing } from "../simulation/MarketTraits";
import { BeliefInventory, Player } from "../simulation/Player";
import { CostSmall } from "../widgets/CostSmall";
import { EmoteIcon } from "../World";

 export class MarketPanel extends React.Component<{
     player: Player,
     market: LiveList<MarketTraitListing>,
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
                    The premier exchange for ⚡️, 🤖,  and {EmoteIcon['happiness']}!
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
                {
                    <MarketTraits live={this.props.market} buy={() => {}}></MarketTraits>
                }
            </div>
        </div>
     }
 }

 
export const MarketTraits: React.FC<{
    live: LiveList<MarketTraitListing>,
    buy: (l: MarketTraitListing) => void
}> = (props) => {
    const [list, setList] = useState(props.live.get);
    const onChange = (b: MarketTraitListing[]) => {
        setList(b);
    };
    useEffect(() => {
        props.live.onChange.subscribe(onChange);
        return () => props.live.onChange.unsubscribe(onChange)
    });
    return <>
    {
    list.map((l, i) => {
        const t = SecondaryBeliefData[l.trait];
        const className = 'belief-name '+t.rarity;
        return <div className="card-parent" key={i}>
            <button className="card button">
                <span className={className}>
                    {t.icon} {t.noun}
                </span>
                <CostSmall cost={l.cost}></CostSmall>
            </button>
        </div>
    })
    }
    </>
}