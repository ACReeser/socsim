import { Tile } from "../World";
import { Bean } from "../simulation/Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, hex_to_pixel, MatterTypes, PolarPoint, polarToPoint, getBuildingTransform, transformPoint, HexPoint } from "../simulation/Geography";
import { PetriBuilding } from "./Building";
import { PI2 } from "../WorldGen";
import { City, UFO } from "../simulation/City";
import { AnimatedUFO } from "./AnimatedUFO";
import { IEvent } from "../events/Events";
import { Particles } from "../widgets/particles";
import { AnimatedSpotlight } from "./AnimatedSpotlight";

const supportedBuildings: BuildingTypes[] = ['farm', 'hospital', 'house', 'theater', 'courthouse'];
interface WorldTilePs {
    tile: Tile;
    city: City;
    costOfLiving: number;
    spotlightEvent: IEvent|undefined;
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
      return this.props.city.byType[type].all.map((b: IBuilding, i) => {
        return (
          <PetriBuilding city={this.props.city} building={b} key={type+i} ></PetriBuilding>
        )
      });
    }
    renderSpotlight(): JSX.Element|null{
      if (this.props.spotlightEvent)
      {
        const bean = this.props.city.historicalBeans.find((x) => x.key === this.props.spotlightEvent?.beanKey);
        if (this.props.spotlightEvent.point && bean){
          return <AnimatedSpotlight event={this.props.spotlightEvent} bean={bean}></AnimatedSpotlight>
        }
      }
      return null;
    }
    render() {
      const beans = this.props.city.beans.map((b: Bean) => {
        return (
          <AnimatedBean bean={b} key={b.key} onClick={() => this.props.onBeanClick(b)}></AnimatedBean>
        )
      });
      const deaths = this.props.city.historicalBeans.filter((x) => !x.alive).map((b: Bean, i) => {
        return (
          <span key={i} className="dead" style={{left: (i*10)+'px'}}>⚰️</span>
        )
      });
      const ufos = this.props.city.ufos.map((u: UFO, i: number) => {
        return <AnimatedUFO ufo={u} key={i} city={this.props.city}></AnimatedUFO>
      });
      const buildings = supportedBuildings.reduce((list, type) => {
        return list.concat(this.renderBuildings(type));
      }, [] as JSX.Element[]);
      const regions = this.props.city.hexes.map((hex, i) => {
        const xy = hex_to_pixel(this.props.city.hex_size, this.props.city.petriOrigin, hex);
        return <div className="hex" key={i} style={transformPoint(xy)} onClick={(e) => {this.props.onHexClick(hex); e.stopPropagation(); return false;}}>

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
          {ufos}
          {/* <span className="tile-label">{this.props.tile.name}</span> */}
          <svg style={{width: '100%', height: '100%'}} className="petri-lid">
            <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 0.2)" />
           </svg>
           {this.renderSpotlight()}
        </div>
      )
    }
  }