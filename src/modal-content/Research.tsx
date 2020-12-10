import React from "react";
import './research.css';

export class ResearchPanel extends React.Component<{

}, {
}>{
    render(){
        return <div>
            <div className="col-2">
              <div>
                <h2>Research Lab</h2>

              </div>
            <div className="vertical">
              <div className="text-center">
                Currently probing 0 beings
              </div>
              <div>
                <span className="victim bean triangle shake">
                  😨
                </span>
              </div>
              <div>

              </div>
            </div>
          </div>
          <div>

          </div>
        </div>
    }
}