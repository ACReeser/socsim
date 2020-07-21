import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="canvas">
    <div className="world">
      <img src="http://lorempixel.com/400/400" />
      <img src="http://lorempixel.com/400/400" />
      <img src="http://lorempixel.com/400/400" />
      <img src="http://lorempixel.com/400/400" />
      <img src="http://lorempixel.com/400/400" />
      <img src="http://lorempixel.com/400/400" />
      <img src="http://lorempixel.com/400/400" />
    </div>
      <div className="overlay"> 
        <div className="left">
          <div className="top">
            Year 1, 
            Spring
          </div>
          <div className="bottom">
            <span>
              <b>Material Capital</b> 55
            </span>
            <span>
              <b>Political Capital</b> 25
            </span>
          </div>
        </div>
        <div className="right">
          <div><b>Socopolis</b></div>
          <div>
            <b>Sentiment</b>&nbsp;
            <span>Unhappy (40%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
