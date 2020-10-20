import React from "react";
import { World } from "../World";

export class GovernmentPanel extends React.Component<{
    world: World
}> {
    render(){
        return <div><div className="col-2">
        <h2>Government</h2>
        <div>

        </div>
      </div>
      <div className="pad-4p">
        <h3>Policy</h3>
        <div className="horizontal">
          <div className="vertical">
            <strong>Welfare</strong>
            <div>Nutrition: {this.props.world.law.policyTree.wel_food.name}</div>
            <div>Housing: {this.props.world.law.policyTree.wel_house.name}</div>
            <div>Healthcare: {this.props.world.law.policyTree.wel_health.name}</div>
          </div>
          <div className="vertical">
            <strong>Taxation</strong>
            <div>{this.props.world.law.policyTree.tax_basic.name}</div>
            <div>{this.props.world.law.policyTree.tax_second.name}</div>
          </div>
          <div className="vertical">
            <strong>Economics</strong>
            <div>External: {this.props.world.law.policyTree.econ_ex.name}</div>
            <div>Labor: {this.props.world.law.policyTree.econ_labor.name}</div>
            <div>Subsidies: {this.props.world.law.policyTree.econ_sub.name}</div>
          </div>
          <div className="vertical">
            <strong>Culture</strong>
            <div>Religion: {this.props.world.law.policyTree.cul_rel.name}</div>
            {this.props.world.law.policyTree.cul_rel.key == '20' ? <div>Theocracy: {this.props.world.law.policyTree.cul_theo.name}</div>: null}
            <div>Education: {this.props.world.law.policyTree.cul_ed.name}</div>
          </div>
          <div className="vertical">
            <strong>Law</strong>
            <div>Voting: {this.props.world.law.policyTree.law_vote.name}</div>
            <div>Corruption: {this.props.world.law.policyTree.law_bribe.name}</div>
            <div>Immigration: {this.props.world.law.policyTree.law_imm.name}</div>
          </div>
        </div>
      </div>

        </div>
    }
}