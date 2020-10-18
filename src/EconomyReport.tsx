import { Bean } from "./Bean";
import React from "react";
import { World, TraitJob } from "./World";
import { NeedReadout } from "./widgets/NeedReadout";
import { Listing } from "./Economy";

function median(values: Array<number>){
  if(values.length ===0) return 0;

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

export class EconomyReport extends React.Component<{world: World}, {paused: boolean}> {
    constructor(props: {world: World}) {
      super(props);
      this.state = {
        paused: false
      }
    }
    render() {
      let beans = this.props.world.beans;
      const food_median = median(beans.map(x => x.discrete_food));
      const health_median = median(beans.map(x => x.discrete_health)).toFixed(1);
      const wealth_total = beans.reduce((sum, y) => sum + y.cash, 0);
      const wealth_avg = wealth_total / (beans.length || 1);
      const wealth_median = median(beans.map(x => x.cash));
      const wealth_dire = beans.filter(x => x.cash < 1).length;
      const wealth_marker = Math.max(wealth_avg, wealth_median);
      const wealthy = beans.filter(x => x.cash > wealth_marker);
      const wealthy_percentage = (wealthy.length / (beans.length || 1)) * 100;
      const wealthy_ownership = (wealthy.reduce((s, x) => s+x.cash, 0) / wealth_total)*100;
      const jobs = beans.reduce((obj, b) => {
        obj[b.job] = (obj[b.job] || 0)+1;
        return obj;
      }, {} as {[key in TraitJob]: number});
      const unemployed = (((jobs.jobless || 0) / beans.length)*100).toFixed(1);
      function reducer(obj:  {supply: number, price: number, avg: number, count: number}, l: Listing){
        obj.supply += l.quantity;
        obj.price += l.price;
        obj.count++;
        obj.avg = obj.price / obj.count;
        return obj;
      }
      const food = this.props.world.economy.market.listings['food'].reduce(reducer, {supply: 0, price: 0, avg: 0, count: 0});
      const meds = this.props.world.economy.market.listings['medicine'].reduce(reducer, {supply: 0, price: 0, avg: 0, count: 0});
      const houses = this.props.world.economy.market.listings['shelter'].reduce(reducer, {supply: 0, price: 0, avg: 0, count: 0});
      return (
        <div>
          <div className="pad-4p">
            <h3>Subject's Health</h3>
          </div>
          <div className="col-2">
            <div>
              <strong>🍞 Food Security</strong> Median:{food_median} meals <br/>
              <NeedReadout beans={this.props.world.beans} need={(b) => b.food} dire="hungry" abundant="stuffed" className="big"></NeedReadout>
              Supply: {food.supply} meals. Avg. price ${food.avg.toFixed(2)} <br/>
              Unfulfilled Demand: {this.props.world.economy.unfulfilledSeasonalDemand.food} meals
            </div>
            <div>
              <strong>🩺 Healthcare</strong> Median:{health_median} <br/>
              <NeedReadout beans={this.props.world.beans} need={(b) => b.health} dire="sick" abundant="fresh" className="big"></NeedReadout>
              Supply: {meds.supply} treatments. Avg. price ${meds.avg.toFixed(2)}  <br/>
              Unfulfilled Demand: {this.props.world.economy.unfulfilledSeasonalDemand.medicine} treatments
            </div>
          </div>
          <div className="col-2">
            <div>
              <strong>🏡 Housing</strong> <br/>
              <NeedReadout beans={this.props.world.beans} need={(b) => b.shelter} dire="podless" abundant="homeowner" className="big"></NeedReadout>
              Supply: {houses.supply} units. Avg. price ${houses.avg.toFixed(2)}   <br/>
              Unfulfilled Demand: {this.props.world.economy.unfulfilledSeasonalDemand.shelter} units
            </div>
          </div>
          <div className="pad-4p">
            <h3>Economic Health</h3>
          </div>
          <div className="col-2">
            <div>
              <strong>💰 Wealth</strong> Household Wealth: {wealth_total.toFixed(2)}<br/>
              {wealth_dire} penniless citizens &nbsp; &nbsp; Cost of Living: ${this.props.world.economy.getCostOfLiving().toFixed(2)} <br/>
              Median: ${wealth_median.toFixed(2)} Average: ${wealth_avg.toFixed(2)} <br/>
              Top {wealthy_percentage.toFixed(1)}% of subjects own {wealthy_ownership.toFixed(1)}% of the wealth
            </div>
            <span>
              <strong>Unemployment</strong> {unemployed}% ({jobs.jobless})<br/>
              <strong>Employment</strong>
              <ul className="boxes">
                <li>{jobs.farmer} farmers</li>
                <li>{jobs.builder} builders</li>
                <li>{jobs.doc} doctors</li>
              </ul>
            </span>
          </div>
        </div>
      )
    }
  }