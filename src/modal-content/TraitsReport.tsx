import { Bean } from "../simulation/Bean";
import React from "react";
import { World, TraitJob } from "../World";

export class TraitsReport extends React.Component<{
  world: World
}, {
  
}> {
    constructor(props: {world: World}) {
      super(props);
      this.state = {
      }
    }
    render() {
      return (
        <div>
          <div className="pad-4p">
            <h2>Subject 🧠 Traits</h2>
          </div>
          <div className="col-2">
            <div>
              <strong>Trait Inventory</strong> <br/>
            </div>
            <div>
              <strong>Discovered Traits</strong> <br/>
            </div>
          </div>
        </div>
      )
    }
  }