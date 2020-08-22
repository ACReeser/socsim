import React, { SyntheticEvent, ChangeEvent } from "react";
import { World, TraitGood } from "./World";
import './panels.css';

export interface charityPS{
    world: World,
    onFoundCharity: (good: TraitGood, budget: number) => void
}
export interface charityS{
    show: boolean,
    selectedCharityGood: TraitGood|null,
    selectedCharityBudget: number
}

export class Charity extends React.Component<charityPS, charityS> {
    constructor(props: charityPS) {
        super(props);
        this.state = {
            show: false,
            selectedCharityGood: null,
            selectedCharityBudget: 1
        }
    }
    onChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
      this.setState({selectedCharityGood: event.target.value as TraitGood});
    }
    onChangeBudgetValue = (event: ChangeEvent<HTMLInputElement>) => {
      this.setState({selectedCharityBudget: +event.target.value});
    }
    onFoundCharity = () => {
        if (this.state.selectedCharityGood){
            this.props.onFoundCharity(this.state.selectedCharityGood, this.state.selectedCharityBudget);
        }
        this.setState({selectedCharityGood: null});
    }
    panel(){
        if (this.state.show){
            return (
                <div className="panel-add">
                    <div onChange={this.onChangeValue}>
                        <label>
                            <input type="radio" name="type" value="food" /> Food Bank
                        </label>
                        <label>
                            <input type="radio" name="type" value="shelter" /> Homeless Shelter
                        </label>
                        <label>
                            <input type="radio" name="type" value="medicine" /> Free Clinic
                        </label>
                    </div>
                    <div>
                        <label>
                            Seasonal Budget: 
                            <input type="number" style={{width:50+'px'}} onChange={this.onChangeBudgetValue} value="1" min="1" max="50" />
                        </label>
                        <button type="button" className="callout" onClick={this.onFoundCharity}>
                            Found Charity
                        </button>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }
    render() {
        return (
            <div>
                <div className="subheader">
                    <h3>Charity</h3>
                    <button type="button" className="callout" onClick={() => this.setState({show: true})} >💗 Found New Charity</button>
                </div>
                <span>Charities help needy beans while also improving their party loyalty</span>
              {this.panel()}
            </div>
        )
    }
}