import React, { ReactElement, useState } from "react";
import { BeliefsAll, IBeliefData, SecondaryBeliefData, TraitBelief } from "../simulation/Beliefs";
import { BeliefWidget } from "./BeliefRow";
import { useAppSelector } from "../state/hooks";

export const TraitsReport: React.FC = () => {
  const beliefInventory = useAppSelector(x => x.world.alien.beliefInventory);
  const seenBeliefs = useAppSelector(x => x.world.alien.seenBeliefs);
  const [hoveredBelief, setHoveredBelief] = useState<TraitBelief>();
  const beliefs: IBeliefData[] = [];
  Object.keys(seenBeliefs).forEach((key) => {
    if (SecondaryBeliefData[key as TraitBelief] != null){
      beliefs.push(SecondaryBeliefData[key as TraitBelief]);
    }
  });
  beliefs.sort((a, b) => a.noun.localeCompare(b.noun));
  return (
    <div className="vertical">
      <div className="pad-4p">
        <h2>Subject 🧠 Traits</h2>
      </div>
      <div className="col-2-30-60">
        <div>
          <div className="scroll">
            <div className="scoll-sticky-h">
              <strong>
                <span className="trait-gem"></span>
                Trait Gems
              </strong>
            </div>
            {
              beliefInventory.length < 1 ? <div>
                No Trait Gems! <br/>
                😵 Brainwash your subjects  <br/>
                or buy from the 🛍️ Market
                </div> : beliefInventory.map((x) => <div key={x.trait}>
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
        </div>
        <div>
          <div className="modal-scroll-v">
            <div className="sticky-t-0">
              <strong>Discovered {beliefs.length} of {BeliefsAll.length} Traits</strong>
            </div>
            {
              beliefs.length < 1 ? <div>
                No Traits Scanned! <br/>
                🛰️ Scan some of your subjects.
              </div> : beliefs.map((x) => <BeliefWidget key={x.noun} data={x} cost={0}
              titleView={<strong>{x.noun}</strong>}
              bottomView={<span></span>}
            ></BeliefWidget>)
            }
          </div>
        </div>
      </div>
    </div>
  )
}