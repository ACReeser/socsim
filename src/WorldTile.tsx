import { Tile, City } from "./World";
import { Bean } from "./Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, Geography, hex_to_pixel, MatterTypes, PolarPoint, polarToPoint, transformMatter, transformPoint } from "./simulation/Geography";
import { PetriBuilding } from "./petri-ui/Building";
import { PI2 } from "./WorldGen";

interface WorldTilePs {
    tile: Tile;
    city: City;
    costOfLiving: number;
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
      const mtnRadius = 530;
      const worldR = 550;
      for (let i = 0; i < 360 / 5; i++) {
        const az = i*5* Math.PI / 180;
        const pt = polarToPoint({r: mtnRadius, az: az});
        pt.x += worldR; pt.y += worldR;
        this.mtn_transforms.push(transformPoint(pt));
      }
    }
    mtn_transforms: {transform: string}[] = [];
    renderBuildings(type: BuildingTypes){
      return this.props.geo.what[type].map((b: IBuilding, i) => {
        return (
          <PetriBuilding geo={this.props.geo} building={b} key={type+i} ></PetriBuilding>
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
        const xy = hex_to_pixel(this.props.geo.hex_size, this.props.geo.petriOrigin, hex);
        return <div className="hex" key={i} style={transformPoint(xy)}>

        </div>
      });
      const mtns = this.mtn_transforms.map((x, i) => {
        return <span key={i} style={x} className="mtn">⛰️</span>
      });
      return (
        <div className="tile" onClick={() => this.props.onClick()}>
          {regions}
          {mtns}
          {deaths}
          {buildings}
          {beans}
          <span className="tile-label">{this.props.tile.name}</span>
          <svg style={{width: '100%', height: '100%'}} className="petri-lid">
            <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 0.2)" />
           </svg>
        </div>
      )
    }
  }