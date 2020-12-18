import React from "react";

export class RobotArm extends React.Component<{
    tool: string,
    classN: string
}, {

}> {
    render(){
        const style = {};
        return <svg width="100" height="300" xmlns="http://www.w3.org/2000/svg" style={style} className={this.props.classN+" robot-arm"}>
        <g>
         <title>robotarm</title>
         <rect fill="transparent" id="canvas_background" height="302" width="102" y="-1" x="-1"/>
         <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
          <rect fill="url(#gridpattern)" strokeWidth="0" y="0" x="0" height="100%" width="100%"/>
         </g>
        </g>
        <g>
         <title>Layer 1</title>
         <rect id="svg_2" height="200" width="48" y="91.63545" x="25" strokeWidth="1.5" stroke="#000" fill="#BBBBBB"/>
         <ellipse ry="48" rx="48" id="svg_1" cy="50" cx="50" strokeWidth="1.5" stroke="#000" fill="#999999"/>
         <ellipse ry="20" rx="20" id="svg_3" cy="50" cx="50" strokeWidth="1.5" stroke="#000" fill="#444444"/>
         <ellipse ry="48" rx="48" id="svg_4" cy="250" cx="50" strokeWidth="1.5" stroke="#000" fill="#999999"/>
        <ellipse ry="20" rx="20" id="svg_5" cy="250" cx="50" strokeWidth="1.5" stroke="#000" fill="#444444">{this.props.tool}</ellipse>
            
        </g><text y="250" x="-20" fontSize="4em">{this.props.tool}</text>
       </svg>
    }
}