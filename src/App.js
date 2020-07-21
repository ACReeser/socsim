import React from 'react';
import logo from './logo.svg';
import './App.css';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
  }
  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <div className="modal">
        {this.props.children}
        <button type="button" className="done" onClick={() => this.props.onClick()} >Done</button>
      </div>
    )
  }
}
class WorldTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tile: null,
      activeTileID: null,
    }
  }
  render() {
    return (
      <div className="tile">
        <span>{this.props.tile.name}</span>
        <img src={this.props.tile.url} alt={this.props.tile.type} />
      </div>
    )
  }
}
const keyToName = {state: 'Statist', ego: 'Egoist', trad: 'Traditionalist', prog: 'Progressive'};
const magToText = {'-3':'---', '-2':'--', '-1':'-', '1':'+', '2':'++', '3':'+++' };
function compass(p){
  return (
    <span className="badge">
      { keyToName[p.key] }
      { magToText[p.mag] }
    </span>
  )
}
function policy(p){
  return (
    <div className="policy">
      <b>{p.key}</b>
      <p>
        {p.fx.map((x) => compass(x))}
      </p>
    </div>
  )
}

class App extends React.Component{
  constructor(props) {
    super(props);
    let url = 'http://lorempixel.com/400/400/';
    this.state = {
      tiles: [
        {url: url+'/nature/8', key: 0, type:'forest'},
        {url: url+'/city/8', key: 1, type:'city'},
        {url: url+'/city/10', key: 2, type:'city'},
        {url: url+'/city/4', key: 3, type:'city'},
        {url: url+'/city/5', key: 4, type:'city'},
        {url: url+'/city/6', key: 5, type:'city'},
        {url: url+'/nature/3', key: 6, type:'coast'}],
      activeTileID: null,
      showPolicies: false,
      policies: [
        {key: "Food Welfare", fx:[{key: 'state', mag: 1}, {key: 'prog', mag:1}]},
        {key: "Church Schooling", fx:[{key: 'state', mag:1}, {key:'trad', mag:1}]},
        {key: "Free Trade", fx:[{key: 'ego', mag:1}, {key:'prog', mag:1}], axis: 'trade'},
        {key: "Tariffs", fx:[{key: 'ego', mag:1}, {key:'trad', mag:1}], axis: 'trade'},
        {key: "Secularism", fx:[{key: 'ego', mag:1}, {key:'prog', mag:2}, {key:'trad', mag:-1}], axis: 'faith'},
        {key: "State Religion", fx:[{key: 'state', mag:1}, {key:'trad', mag:2}, {key:'prog', mag:-1}], axis: 'faith'},
        {key: "Univ. Suffrage", fx:[{key:'prog', mag:2}], axis: 'vote'},
        {key: "Male Suffrage", fx:[{key:'trad', mag:2}], axis: 'vote'},
      ]
    };
  }
  render() {
    const tiles = this.state.tiles.map((t) => {
      return (
        <WorldTile tile={t}></WorldTile>
      )
    })
    return (
    <div className="canvas">
      <div className="world">
        {tiles}
      </div>
      <div className="overlay">
        <Modal show={this.state.showPolicies} onClick={() => this.setState({showPolicies: false})}>
          <b>Active Policies</b>
          <div className="policies">
            {this.state.policies.map((p) => policy(p))}
          </div>
        </Modal>
        <div className="left">
          <div className="top">
            <span>
              Year 1, 
              Spring
            </span>
            <span className="pull-r" style={{marginRight: 2+'em'}}>
              election in 7 seasons
              &nbsp;
              <button type="button">Finalize Agenda</button>
            </span>
          </div>
          <div className="bottom">
            <span>
              <b>Material Capital</b> 55
            </span>
            <span>
              <b>Political Capital</b> 25
            </span>
            <button type="button" onClick={() => this.setState({showPolicies:true})}>Policies</button>
          </div>
        </div>
        <div className="right">
          <div><b>Socopolis</b></div>
          <div className="header"><b>Demographics</b></div>
          <div>
            <b>Population</b>&nbsp;
            <span>100</span>
          </div>
          <div>
            <b>Ethnicity</b>&nbsp;
            <span>Extreme Circle (80%)</span>
          </div>
          <div className="header"><b>Electorate</b></div>
          <div>
            <b>Sentiment</b>&nbsp;
            <span>Unhappy (40%)</span>
          </div>
          <div>
            <b>Community</b>&nbsp;
            <span>Major Statist (70%)</span>
            {/* <span>Maj. Egoist (70%)</span> */}
          </div>
          <div>
            <b>Ideals</b>&nbsp;
            <span>Major Progressive (70%)</span>
            {/* <span>Maj. Traditional (70%)</span> */}
          </div>
          <div className="header"><b>Party</b></div>
          <div>
            <b>Approval</b>&nbsp;
            <span>Approve (60%)</span>
          </div>
          <div>
            <b>Representatives</b>&nbsp;
            <span>3/4</span>
          </div>
        </div>
      </div>
    </div>
  )}
}

export default App;
