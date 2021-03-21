import { Bean } from "../simulation/Bean";
import React, { ReactElement } from "react";
import { World, TraitJob } from "../World";
import { IBeliefData, SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { BeliefWidget } from "./BeliefRow";
import { LiveList, LiveMap } from "../events/Events";
import { BeliefInventory } from "../simulation/Player";

interface TraitsP {
  seenBeliefs: LiveMap<string, boolean>,
  beliefInventory: LiveList<BeliefInventory>,
}
export class TraitsReport extends React.Component<TraitsP, {
  hoveredTrait?: TraitBelief
}> {
    constructor(props: TraitsP) {
      super(props);
      this.state = {
      }
    }
    render() {
      const beliefs: IBeliefData[] = [];
      this.props.seenBeliefs.get.forEach((val, key) => {
        if (SecondaryBeliefData[key as TraitBelief] != null){
          beliefs.push(SecondaryBeliefData[key as TraitBelief]);
        }
      });
      beliefs.sort((a, b) => a.noun.localeCompare(b.noun));
      return (
        <div>
          <div className="pad-4p">
            <h2>Subject 🧠 Traits</h2>
          </div>
          <div className="col-2-30-60">
            <div>
              <strong>Trait Inventory</strong> <br/>
              {
                this.props.beliefInventory.get.length < 1 ? <div>
                  No Traits! <br/>
                  😵 Brainwash your subjects  <br/>
                  or buy from the 🛍️ Market
                  </div> : <div>
                    {
                      this.props.beliefInventory.get.map((x) => <div key={x.trait}>
                        <div>
                          <strong>
                            {SecondaryBeliefData[x.trait].icon} {SecondaryBeliefData[x.trait].noun}
                          </strong>
                        </div>
                        <div>
                          This can be implanted {x.charges} more times
                        </div>
                      </div>)
                    }
                  </div>
              }
            </div>
            <div>
              <strong>Discovered Traits</strong> <br/>
              {
                beliefs.length < 1 ? <div>
                  No Traits! <br/>
                  🛰️ Scan some of your subjects.
                </div> : beliefs.map((x) => <BeliefWidget key={x.noun} data={x} cost={0}
                titleView={<strong>{x.noun}</strong>}
                bottomView={<span></span>}
              ></BeliefWidget>)
              }
            </div>
          </div>
        </div>
      )
    }
  }