
import React from "react";
import { TraitJob } from "../World";
import { NeedReadout } from "../widgets/NeedReadout";
import { GetCostOfLiving, IListing } from "../simulation/Economy";
import { useAppSelector } from "../state/hooks";
import { selectBeansByCity } from "../state/features/world.reducer";

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

export const EconomyReport: React.FC<{}> = () => {
    const beans = useAppSelector(s => selectBeansByCity(s.world, 0));
    const economy = useAppSelector(s => s.world.economy);
    const food_median = median(beans.map(x => x.discrete_food));
    const health_median = median(beans.map(x => x.discrete_health)).toFixed(1);
    const shelter_median = median(beans.map(x => x.discrete_stamina)).toFixed(1);
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
    function reducer(obj:  {supply: number, price: number, avg: number, count: number}, l: IListing){
      obj.supply += l.quantity;
      obj.price += l.price;
      obj.count++;
      obj.avg = obj.price / obj.count;
      return obj;
    }
    const food = economy.market.listings['food'].reduce(reducer, {supply: 0, price: 0, avg: 0, count: 0});
    const meds = economy.market.listings['medicine'].reduce(reducer, {supply: 0, price: 0, avg: 0, count: 0});
    const houses = economy.market.listings['shelter'].reduce(reducer, {supply: 0, price: 0, avg: 0, count: 0});
    return (
      <div>
        <div className="pad-4p">
          <h2>State of the Utopia</h2>
        </div>
        {/* <div className="pad-4p">
          <h3>Subject's Health</h3>
        </div> */}
        <div className="col-2">
          <div>
            <strong>🍞 Food Security</strong>
            <NeedReadout beans={beans} need={(b) => b.food} dire="hungry" abundant="stuffed" className="big"></NeedReadout>
            <table className="width-100p">
              <tbody>
                <tr>
                  <td>Median {food_median.toFixed(1)} 🍞</td>
                  <td className="text-center">
                    Supply: {food.supply} 🍞 @ ${food.avg.toFixed(2)}
                  </td>
                  <td className="text-right">
                    Deficit: {economy.unfulfilledMonthlyDemand.food} 🍞
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>🩺 Healthcare</strong>
            <NeedReadout beans={beans} need={(b) => b.health} dire="sick" abundant="fresh" className="big"></NeedReadout>
            <table className="width-100p">
              <tbody>
                <tr>
                  <td>Median {health_median} 🩺</td>
                  <td className="text-center">
                    Supply: {meds.supply} 🩺 @ ${meds.avg.toFixed(2)}
                  </td>
                  <td className="text-right">
                    Deficit: {economy.unfulfilledMonthlyDemand.medicine} 🩺
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-2">
          <div>
            <strong>🏡 Housing</strong> <br/>
            <NeedReadout beans={beans} need={(b) => b.stamina} dire="homeless" abundant="rested" className="big"></NeedReadout>
            <table className="width-100p">
              <tbody>
                <tr>
                  <td>Median {shelter_median} 🏡</td>
                  <td className="text-center">
                    Supply: {houses.supply} 🏡 @ ${houses.avg.toFixed(2)}
                  </td>
                  <td className="text-right">
                    Deficit: {economy.unfulfilledMonthlyDemand.shelter} 🏡
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="pad-4p">
          <h3>Economic Health</h3>
        </div> */}
        <div className="col-2">
          <div>
            <strong>💰 Wealth</strong> <br/>
            {wealth_dire} penniless citizens &nbsp; &nbsp; Cost of Living: ${GetCostOfLiving(economy).toFixed(2)} <br/>
            <table className="width-100p">
              <tbody>
                <tr>
                  <td>Total ${wealth_total.toFixed(2)}</td>
                  <td className="text-center">
                    Median: ${wealth_median.toFixed(2)} 
                  </td>
                  <td className="text-right">
                    Avg: ${wealth_avg.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            Top {wealthy_percentage.toFixed(1)}% of subjects own {wealthy_ownership.toFixed(1)}% of the wealth
          </div>
          <span>
            <strong>Unemployment</strong> {unemployed}% ({jobs.jobless})<br/>
            <ul className="boxes">
              <li>{jobs.farmer || 0} farmers</li>
              <li>{jobs.builder || 0} builders</li>
              <li>{jobs.doc || 0} doctors</li>
              <li>{jobs.entertainer || 0} entertainers</li>
            </ul>
          </span>
        </div>
      </div>
    )
  }