import { AnyAction } from "redux";
import { EventBufferLength, IEvent } from "../events/Events";
import { MoverStoreInstance } from "../MoverStoreSingleton";
import { SignalStoreInstance } from "../SignalStore";
import { EntityAddToSlice } from "../state/entity.state";
import { IWorldState } from "../state/features/world";
import { changeState, pickUpPickup, remove_ufo, selectBeansByCity } from "../state/features/world.reducer";
import { MaxHedonHistory, PickupPhysics, WorldInflate } from "../World";
import { GenerateBean } from "../WorldGen";
import { WorldSfxInstance } from "../WorldSound";
import { BeanActions, IBean } from "./Agent";
import { AgentDurationStoreInstance } from "./AgentDurationInstance";
import { BeanAge, BeanMaybeBaby, BeanCalculateBeliefs, BeanEmote } from "./Bean";
import { BeanTryFindJob } from "./BeanAndCity";
import { GetHedonReport } from "./Beliefs";
import { BeanLoseJob, CalculateCityComputed } from "./City";
import { GetCostOfLiving } from "./Economy";
import { accelerate_towards, accelerator_coast, OriginAccelerator } from "./Geography";
import { IsLaw, MaybeRebate, PollTaxWeeklyAmount } from "./Government";
import { GetMarketTraits } from "./MarketTraits";
import { GenerateEmoteFromBean } from "./Pickup";
import { CheckGoals, CheckReportCard, HasResearched, TechData } from "./Player";
import { TicksPerDay } from "./Time";

const OwnerProfitPercentage = 0.15;

export function simulate_world(world: IWorldState){
    world.date.hour++
    if (world.date.hour % 2 === 0){
        simulate_every_other_tick(world);
    }
    if (world.date.hour >= TicksPerDay){
        world.date.hour = 0;
        world.date.day++;
        simulate_every_day(world);
        if (world.date.day % 7 === 0){
            simulate_every_week(world);
        }
    }
    if (world.date.day > 30){
        world.date.day = 1;
        simulate_every_month(world)
        world.date.season++;
    }
    if (world.date.season > 3){
        world.date.year++;
        simulate_every_year(world);
        world.date.season = 0;
    }

    world.alien.bots.amount += world.alien.bots.income;
    world.alien.energy.amount += world.alien.energy.income;
    if (HasResearched(world.alien.techProgress, 'fast_resources')){
        world.alien.bots.amount += world.alien.bots.income*0.5;
        world.alien.energy.amount += world.alien.energy.income*0.5;
    }
    if (world.alien.currentlyResearchingTech){
        const tech = world.alien.currentlyResearchingTech;
        if(world.alien.techProgress[tech] == null){
            world.alien.techProgress[tech] = {
                researchPoints: 0
            }
        }
        const max = TechData[tech].techPoints;
        const current = world.alien.techProgress[tech].researchPoints;
        if (current < max)
            world.alien.techProgress[tech].researchPoints += world.alien.abductedBeanKeys.length *  1/TicksPerDay;
        if (current >= max){
            if (world.alien.currentlyResearchingTech === 'neural_duplicator')
                world.alien.beliefInventory.forEach((x) => x.charges += 1);
            world.alien.currentlyResearchingTech = undefined;

        }
    }

    const CoL = GetCostOfLiving(world.economy);
    world.beans.allIDs.forEach((bKey: number, i: number) => {
        const b = world.beans.byID[bKey];
        if (b.lifecycle != 'alive')
            return;
        
        const ageResult = BeanAge(b, world.seed, world.alien.difficulty);
        if (ageResult?.emotes){
            ageResult.emotes.map(x => EntityAddToSlice(world.pickups, x));
        }
        if (ageResult?.death){
            EntityAddToSlice(world.events, ageResult.death);
            BeanLoseJob(b, world);
            WorldSfxInstance.play('death');
        }
        // todo: on bean death
        const e = BeanMaybeBaby(b, world.seed, CoL);
        if (e) {
            const newBean = GenerateBean(world, world.cities.byID[b.cityKey], b);
            if (b.lastPoint){
                newBean.lastPoint = b.lastPoint;
                MoverStoreInstance.Get('bean', newBean.key).publish({point: {x: b.lastPoint.x, y: b.lastPoint.y}, velocity: {x: 0, y: 0}});
            }
            world.beans.byID[newBean.key] = newBean;
            world.beans.allIDs.push(newBean.key);
            world.cities.byID[b.cityKey].beanKeys.push(newBean.key);
            WorldAddEvent(world, e);
            WorldSfxInstance.play('squeak');
        }
        if (b.job === 'jobless'){
            const gotJob = BeanTryFindJob(world, b);
            if (!gotJob){
                WorldAddEvent(world, {icon: '🏚️', trigger: 'nojobslots', message: `A subject cannot find a job; build or upgrade more buildings.`, key: 0});
            }
        }
        
        b.happiness = GetHedonReport(b.hedonHistory);
    });
    world.cities.allIDs.forEach(cityID => {
        const c = world.cities.byID[cityID];
        CalculateCityComputed(c, world.economy);
    });
    world.beans.allIDs.forEach((k: number) => {
        const b = world.beans.byID[k];
        if (!b || b.lifecycle != 'alive')
            return;
        BeanCalculateBeliefs(b, world.economy, world.alien.difficulty, world.law);
    });
    CheckGoals(world, world.alien);
    CheckReportCard(world, world.alien);
    return world;
}
export function simulate_every_year(world: IWorldState){
    WorldInflate(world);
}
export function simulate_every_month(world: IWorldState){
    //resetMonthlyDemand
    world.economy.unfulfilledMonthlyDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    world.economy.monthlyDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    world.economy.monthlySupply = { food: 0, shelter: 0, medicine: 0, fun: 0, };
}
export function simulate_every_week(world: IWorldState){
    world.marketTraitsForSale = GetMarketTraits(world.seed);
    WorldAddEvent(world, {key: 0, message: 'New traits in the Emotion Market!', icon: '🛍️', trigger: 'marketrefresh'});
    if (IsLaw(world.law, 'poll_tax')){
        let collected = 0;
        world.cities.allIDs.forEach((cityID: number) => {
            selectBeansByCity(world, cityID).forEach((y: IBean) => {
                if (y.cash >= PollTaxWeeklyAmount){
                    y.cash -= PollTaxWeeklyAmount;
                    collected += PollTaxWeeklyAmount;
                }
            });
        });
        world.law.cash = (world.law.cash + collected);
    }
    MaybeRebate(world.law, Object.values(world.beans.byID));
}
export function simulate_every_day(world: IWorldState){
    world.beans.allIDs.forEach((beanKey) => {
        const x = world.beans.byID[beanKey];
        if (x.hedonHistory.length >= MaxHedonHistory) {
            x.hedonHistory.pop();
        }
        x.hedonHistory.unshift({});
    });
}
export function simulate_every_other_tick(world: IWorldState){
    //pay beans
    world.enterprises.allIDs.forEach((eKey) => {
        const enterprise = world.enterprises.byID[eKey];
        const building = world.buildings.byID[eKey];
        const workers = building.jobs.map(x => world.beans.byID[x]);
        //distribute cash
        switch(enterprise.enterpriseType){
            case 'company':
                if (workers.length < 1) {
                    //noop;
                } else if (workers.length === 1){
                    workers[0].cash += enterprise.cash;
                    if (enterprise.cash > 0)
                        workers[0].ticksSinceLastSale = 0;
                    enterprise.cash = 0;
                }
                else {
                    const share = enterprise.cash / (workers.length + OwnerProfitPercentage);
                    enterprise.cash = 0;
                    let owner = workers.find(x => x.key === enterprise.ownerBeanKey);
                    if (owner == null){
                        owner = workers[0];
                        enterprise.ownerBeanKey = owner.key;
                    }
                    workers.forEach(bean => {
                        const pay = (bean === owner) ? share * (1+OwnerProfitPercentage) : share;
                        bean.cash += pay;
                        if (pay > 0)
                            bean.ticksSinceLastSale = 0;
                    });
                }
                break;
            case 'co-op':
                const share = enterprise.cash / workers.length;
                enterprise.cash = 0;
                workers.forEach(bean => {
                    bean.cash += share;
                    if (share > 0)
                        bean.ticksSinceLastSale = 0;
                });
                break;
            case 'commune':
                const commShare = enterprise.cash / workers.length;
                enterprise.cash = 0;
                workers.forEach(bean => {
                    bean.cash += commShare;
                    if (commShare > 0)
                        bean.ticksSinceLastSale = 0;
                });
                break;
        }
    })
}
export function WorldAddEvent(world: IWorldState, e: IEvent){
    e.key = world.events.nextID++;
    world.events.byID[e.key] = e;
    world.events.allIDs.push(e.key);
    SignalStoreInstance.events.publish(e);
    while (world.events.allIDs.length > EventBufferLength){
        const removedID = world.events.allIDs[0];
        if (removedID != null) {
            world.events.allIDs = world.events.allIDs.slice(1);
            world.events.byID = {
                removedID,
                ...world.events.byID
            } as any;
        }
    }
}
export function animate_ufos(world: IWorldState, deltaMS: number): Array<AnyAction>{
    const actions: AnyAction[] = [];
    world.ufos.allIDs.forEach((ufoKey) => {
        const ufo = world.ufos.byID[ufoKey];
        AgentDurationStoreInstance.Get('ufo', ufoKey).elapsed += deltaMS;

        if (AgentDurationStoreInstance.Get('ufo', ufoKey).elapsed > 4000)
        {
            actions.push(remove_ufo({ufoKey}))
        }
    });
    return actions;
}
export function animate_beans(world: IWorldState, deltaMS: number): Array<AnyAction>{
    const actions: AnyAction[] = [];
    world.beans.allIDs.forEach((beanKey) => {
        const bean = world.beans.byID[beanKey];

        if (bean.lifecycle != 'alive')
            return;
        
        const ADS = AgentDurationStoreInstance.Get('bean', bean.key); 
        ADS.elapsed += deltaMS;
        const actResult = BeanActions[bean.action].act(bean, world, ADS.elapsed, deltaMS);
        if (Array.isArray(actResult.action)){
            actions.push(...actResult.action);
        } else if (actResult.action){
            actions.push(actResult.action);
        }
        if (actResult.newActivity){
            const exitAction = BeanActions[bean.action].exit(bean, world.seed);
            if (exitAction)
                actions.push(exitAction);
            actions.push(changeState({beanKey: beanKey, newState: actResult.newActivity}));
            const enterAction = BeanActions[actResult.newActivity.act].enter(bean);
            if (enterAction)
                actions.push(enterAction);
        }
        //TODO: fix on chat
        // if (result.data.act === 'chat' && result.data.chat?.participation === 'speaker'){
        //     listener.onChat(agent as Bean, result.data.chat);
        // }
    });
    return actions;
}
export function animate_pickups(world: IWorldState, deltaMS: number): Array<AnyAction>{
    const pickupIDs = world.pickups.allIDs;
    const city = world.cities.byID[0];
    const actions: AnyAction[] = [];
    //go backwards because we'll modify the array as we go
    for(let i = pickupIDs.length - 1; i >= 0; i--) {
        const pickupID = pickupIDs[i];
        let collide = false;
        const magnet = city.pickupMagnetPoint;
        const newAccelerator = {
            ...(MoverStoreInstance.Get('pickup', pickupID).current || OriginAccelerator)
        };
        if (magnet){
            const collide = accelerate_towards(
                newAccelerator,
                magnet,
                PickupPhysics.AccelerateS * deltaMS/1000, 
                PickupPhysics.MaxSpeed, 
                PickupPhysics.CollisionDistance,
                PickupPhysics.Brake);
            if (collide){
                actions.push(pickUpPickup({cityKey: city.key, pickupKey: pickupID}));
            }
        } else {
            accelerator_coast(newAccelerator, PickupPhysics.Brake);
        }
        if (!collide)
            MoverStoreInstance.Get('pickup', pickupID).publish(newAccelerator);
    }
    return actions;
}