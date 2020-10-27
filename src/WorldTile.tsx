import { Tile } from "./World";
import { Bean } from "./Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, hex_to_pixel, MatterTypes, PolarPoint, polarToPoint, getBuildingTransform, transformPoint, HexPoint } from "./simulation/Geography";
import { PetriBuilding } from "./petri-ui/Building";
import { PI2 } from "./WorldGen";
import { City } from "./simulation/City";

interface WorldTilePs {
    tile: Tile;
    city: City;
    costOfLiving: number;
    onClick: () => void;
    onBeanClick: (b: Bean) => void;
    onHexClick: (hex: HexPoint) => void;
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
      return this.props.city.what[type].map((b: IBuilding, i) => {
        return (
          <PetriBuilding city={this.props.city} building={b} key={type+i} ></PetriBuilding>
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
      const buildings = this.renderBuildings('farm').concat(this.renderBuildings('hospital')).concat(this.renderBuildings('house')).concat(this.renderBuildings('courthouse'));
      const regions = this.props.city.hexes.map((hex, i) => {
        const xy = hex_to_pixel(this.props.city.hex_size, this.props.city.petriOrigin, hex);
        return <div className="hex" key={i} style={transformPoint(xy)}>

        </div>
      });
      const mtns = this.mtn_transforms.map((x, i) => {
        return <span key={i} style={x} className="mtn">⛰️</span>
      });
      return (
        <div className="tile" onClick={() => this.props.onClick()}>
        <svg style={{width: '100%', height: '100%'}} className="petri-base">
          <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 1)" />
         </svg>
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