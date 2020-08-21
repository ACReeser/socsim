import React from "react";
import { World } from "./World";
import './panels.css';

export interface charityPS{
    world: World
}

export class Charity extends React.Component<charityPS, {show: boolean}> {
    constructor(props: charityPS) {
        super(props);
        this.state = {
            show: false
        }
    }
    panel(){
        if (this.state.show){
            return (
                <div className="panel-add">
                    <div>
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
                            <input type="number" style={{width:50+'px'}} value="1" min="1" max="50" />
                        </label>
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
              <b>Charity</b>
              <button type="button" className="callout" onClick={() => this.setState({show: true})} >💗 Found New Charity</button>
              {this.panel()}
            </div>
        )
    }
}