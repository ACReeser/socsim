import { IWorldState, selectBeansByCity } from "../state/features/world";
import { Inflate, MaxHedonHistory } from "../World";
import { IBean } from "./Agent";
import { GetHedonReport } from "./Beliefs";
import { CalculateCityComputed } from "./City";
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

    world.beans.allIDs.forEach((bKey: number, i: number) => {
        const b = world.beans.byID[bKey];
        b.age(world.economy, world.alien.difficulty);
        const e = b.maybeBaby(world.economy);
        if (e) {
            world.publishEvent(e);
            world.sfx.play('squeak');
        }
        if (b.job === 'jobless')
            b.tryFindRandomJob(world.law);
        
        b.happiness = GetHedonReport(b.hedonHistory);
    });
    world.cities.allIDs.forEach(cityID => {
        const c = world.cities.byID[cityID];
        CalculateCityComputed(c, world.economy);
        c.beans.get.forEach(b => b.calculateBeliefs(this.economy, c, this.law, this.party));
    });
    CheckGoals(world, world.alien);
    CheckReportCard(world, world.alien);
}
export function simulate_every_year(world: IWorldState){
    Inflate(world);
}
export function simulate_every_month(world: IWorldState){

    //resetMonthlyDemand
    world.economy.unfulfilledMonthlyDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    world.economy.monthlyDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    world.economy.monthlySupply = { food: 0, shelter: 0, medicine: 0, fun: 0, };
}
export function simulate_every_week(world: IWorldState){
    world.marketTraitsForSale = GetMarketTraits();
    world.publishEvent({message: 'New traits in the Emotion Market!', icon: '🛍️', trigger: 'marketrefresh'});
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
export function simulate_beans(world: IWorldState, deltaMS: number){
    world.beans.allIDs.forEach((b) => {
        Act(b, deltaMS, world.alien.difficulty, this);
    });
}
export function simulate_pickups(world: IWorldState, deltaMS: number){
    const city = world.cities[0];
    const pickups = city.pickups.get;
    //go backwards because we'll modify the array as we go
    for(let i = pickups.length - 1; i >= 0; i--) {
        const pickup = pickups[i];
        let collide = false;
        const magnet = city.pickupMagnetPoint.get;
        if (magnet){
            collide = accelerate_towards(
                pickup, 
                magnet, 
                PickupPhysics.AccelerateS * deltaMS/1000, 
                PickupPhysics.MaxSpeed, 
                PickupPhysics.CollisionDistance,
                PickupPhysics.Brake);
        } else {
            accelerator_coast(pickup, PickupPhysics.Brake);
        }
        if (collide){
            const amt = EmotionWorth[pickup.type];
            world.alien.hedons.amount += amt;
            world.alien.hedons.change.publish({change: amt});
            city.pickups.remove(pickup);
            world.sfx.play(pickup.type);
        } else {
            pickup.onMove.publish(pickup.point);
        }
    }
}