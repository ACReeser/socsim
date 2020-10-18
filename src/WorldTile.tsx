import { Tile, City } from "./World";
import { Bean } from "./Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";
import { Building, BuildingIcon, BuildingTypes, Geography, hex_to_pixel, MatterTypes, PolarPoint, transformMatter, transformPoint } from "./simulation/Geography";
import { PetriBuilding } from "./petri-ui/Building";

interface WorldTilePs {
    tile: Tile;
    city: City;
    costOfLiving: number;
    regions: PolarPoint[];
    geo: Geography;
    onClick: () => void;
    onBeanClick: (b: Bean) => void;
  }
export class WorldTile extends React.Component<WorldTilePs> {
    constructor(props: WorldTilePs) {
      super(props);
      this.state = {
        tile: null,
        city: null,
        activeTileID: null,
      }
    }
    renderBuildings(type: BuildingTypes){
      return this.props.geo.what[type].map((b: Building, i) => {
        return (
          <PetriBuilding geo={this.props.geo} building={b} ></PetriBuilding>
        )
      });
    }
    render() {
      const beans = this.props.city.beans.map((b: Bean) => {
        return (
          <AnimatedBean bean={b} key={b.key} costOfLiving={this.props.costOfLiving} onClick={() => this.props.onBeanClick(b)}></AnimatedBean>
        )
      })
      const deaths = this.props.city.historicalBeans.filter((x) => !x.alive).map((b: Bean, i) => {
        return (
          <span key={i} className="dead" style={{left: (i*10)+'px'}}>⚰️</span>
        )
      })
      const buildings = this.renderBuildings('farm').concat(this.renderBuildings('house'));
      const regions = this.props.geo.hexes.map((hex, i) => {
        const xy = hex_to_pixel({x: 60, y: 60}, {x: 450, y: 450}, hex);
        console.log(xy);
        return <div className="hex" key={i} style={transformPoint(xy)}>

        </div>
      });
      return (
        <div className="tile" onClick={() => this.props.onClick()}>
          {regions}
          {deaths}
          {buildings}
          {beans}
          <span className="tile-label">{this.props.tile.name}</span>
          <svg style={{width: '100%', height: '100%'}} className="petri-lid">
            <circle cx="450" cy="450" r="450" stroke="grey" stroke-width="2" fill="rgba(255, 255, 255, 0.2)" />
           </svg>
        </div>
      )
    }
  }