import { AnyAction, bindActionCreators } from "redux";
import { IEvent } from "../events/Events";
import { IWorldState } from "../state/features/world";
import { changeState, remove_ufo, selectBeansByCity } from "../state/features/world.reducer";
import { WorldInflate, MaxHedonHistory, TraitJob } from "../World";
import { GenerateBean, GetRandom } from "../WorldGen";
import { BeanActions, IBean } from "./Agent";
import { AgentDurationStoreInstance } from "./AgentDurationInstance";
import { BeanAge, BeanMaybeBaby, CalculateBeliefs as CalculateBeanBeliefs } from "./Bean";
import { CityBeanTrySetJob } from "./BeanAndCity";
import { GetHedonReport } from "./Beliefs";
import { CalculateCityComputed, ICity } from "./City";
import { GetCostOfLiving } from "./Economy";
import { IsLaw, MaybeRebate, PollTaxWeeklyAmount } from "./Government";
import { GetMarketTraits } from "./MarketTraits";
import { CheckGoals, CheckReportCard, HasResearched, TechData } from "./Player";
import { Hour } from "./Time";

export function simulate_world(world: IWorldState){
    world.date.hour++
    if (world.date.hour > Hour.Evening){
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
    if (HasResearched(world.alien, 'fast_resources')){
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
            world.alien.techProgress[tech].researchPoints += world.alien.abductedBeans.length;
        if (current >= max){
            if (world.alien.currentlyResearchingTech === 'neural_duplicator')
                world.alien.beliefInventory.forEach((x) => x.charges += 1);
            world.alien.currentlyResearchingTech = undefined;

        }
    }

    const CoL = GetCostOfLiving(world.economy);
    world.beans.allIDs.forEach((bKey: number, i: number) => {
        const b = world.beans.byID[bKey];
        BeanAge(b, world.alien.difficulty);
        const e = BeanMaybeBaby(b, CoL);
        if (e) {
            WorldAddEvent(world, e);
            // TODO REDUX
            //world.sfx.play('squeak');
        }
        if (b.job === 'jobless'){
            const job: TraitJob = GetRandom(['builder', 'doc', 'farmer', 'entertainer']);
            const gotJob = CityBeanTrySetJob(world.cities.byID[b.cityKey], b, job)
            if (!gotJob){
                WorldAddEvent(world, {icon: '🏚️', trigger: 'nojobslots', message: `A subject cannot find a job; build or upgrade more buildings.`, key: 0});
            }
        }
        
        b.happiness = GetHedonReport(b.hedonHistory);
    });
    world.cities.allIDs.forEach(cityID => {
        const c = world.cities.byID[cityID];
        CalculateCityComputed(c, world.economy);
        selectBeansByCity(world, cityID).forEach((b: IBean) => CalculateBeanBeliefs(b, world.economy, c, world.law));
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
    world.marketTraitsForSale = GetMarketTraits();
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
        world.law.treasury = (world.law.treasury + collected);
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
export function WorldAddEvent(world: IWorldState, e: IEvent){
    e.key = world.events.nextID++;
    world.events.byID[e.key] = e;
    world.events.allIDs.push(e.key);
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
        const ADS = AgentDurationStoreInstance.Get('bean', bean.key); 
        ADS.elapsed += deltaMS;
        const actResult = BeanActions[bean.action].act(bean, world, ADS.elapsed, deltaMS);
        if (actResult.action){
            actions.push(actResult.action);
        }
        if (actResult.newState && actResult.newData){
            const exitAction = BeanActions[bean.action].exit(bean);
            if (exitAction)
                actions.push(exitAction);
            actions.push(changeState({beanKey: beanKey, newState: actResult.newState, newData: actResult.newData}));
            const enterAction = BeanActions[actResult.newState].enter(bean);
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
        // if (magnet){
        //     collide = accelerate_towards(
        //         pickup, 
        //         magnet, 
        //         PickupPhysics.AccelerateS * deltaMS/1000, 
        //         PickupPhysics.MaxSpeed, 
        //         PickupPhysics.CollisionDistance,
        //         PickupPhysics.Brake);
        // } else {
        //     accelerator_coast(pickup, PickupPhysics.Brake);
        // }
        // if (collide){
        //     const amt = EmotionWorth[pickup.type];
        //     world.alien.hedons.amount += amt;
        //     world.alien.hedons.change.publish({change: amt});
        //     city.pickups.remove(pickup);
        //     world.sfx.play(pickup.type);
        // } else {
        //     pickup.onMove.publish(pickup.point);
        // }
    }
    return actions;
}