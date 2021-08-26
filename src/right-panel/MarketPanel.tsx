import React, { useEffect, useState } from "react";
import { SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { PlayerCanAfford } from "../simulation/Player";
import { buyBots, buyEnergy, buyTrait, scrubHedons } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { CostSmall } from "../widgets/CostSmall";
import { EmoteIcon } from "../World";

 export const MarketPanel: React.FC<{
 }> = () => {
     const player = useAppSelector(s => s.world.alien);
     const dispatch = useAppDispatch();
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
            <button className="card button" onClick={() => dispatch(buyEnergy({amount: 1}))}
                disabled={!PlayerCanAfford(player, player.difficulty.cost.market.resource.energy)}>
                +1 ⚡️ Energy
                <CostSmall cost={player.difficulty.cost.market.resource.energy} qty={1} ></CostSmall>
            </button>
            <button className="card button" onClick={() => dispatch(buyEnergy({amount: 5}))}
                disabled={!PlayerCanAfford(player, player.difficulty.cost.market.resource.energy, 5)}>
                +5 ⚡️ Energy
                <CostSmall cost={player.difficulty.cost.market.resource.energy} qty={5} ></CostSmall>
            </button>
        </div>
        <div className="card-parent">
            <button className="card button" onClick={() => dispatch(buyBots({amount: 1}))}
                disabled={!PlayerCanAfford(player, player.difficulty.cost.market.resource.bots)}>
                +1 🤖 Bot
                <CostSmall cost={player.difficulty.cost.market.resource.bots} qty={1} ></CostSmall>
            </button>
            <button className="card button" onClick={() => dispatch(buyBots({amount: 5}))}
                disabled={!PlayerCanAfford(player, player.difficulty.cost.market.resource.bots, 5)}>
                +5 🤖 Bots
                <CostSmall cost={player.difficulty.cost.market.resource.bots} qty={5} ></CostSmall>
            </button>
        </div>
        <div className="card-parent">
            <button className="card button" onClick={() => dispatch(scrubHedons())}
                disabled={player.hedons.amount >= 0 || !PlayerCanAfford(player, player.difficulty.cost.market.scrubHedons)}>
                Remove 💢 Negative Hedons
                <CostSmall cost={player.difficulty.cost.market.scrubHedons} qty={1} ></CostSmall>
            </button>
            {/* <button className="card button" onClick={() => buyBots(5)}
                disabled={!PlayerCanAfford(player.difficulty.cost.market.resource.bots, 5)}>
                +5 🤖 Bots
                <CostSmall cost={player.difficulty.cost.market.resource.bots} qty={5} ></CostSmall>
            </button> */}
        </div>
        <div>
            
            <small>
                <i>Current 🧠 Traits for sale:</i>
            </small>
        </div>
        <div className="short-scroll">
            {
                <MarketTraits hedons={player.hedons.amount}></MarketTraits>
            }
        </div>
    </div>
 }

 
export const MarketTraits: React.FC<{
    hedons: number,
}> = (props) => {
    const list = useAppSelector(s => s.world.marketTraitsForSale);
    const dispatch = useAppDispatch();
    return <>
    {
    list.map((l, i) => {
        const t = SecondaryBeliefData[l.trait];
        const className = 'belief-name '+t.rarity;
        return <div className="card-parent" key={i}>
            <button className="card button" onClick={() => dispatch(buyTrait({l: l}))} disabled={props.hedons < (l.cost.hedons || 0)}>
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