import { ITile } from "../World";
import { Bean } from "../simulation/Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";
import { IBuilding, BuildingIcon, BuildingTypes, hex_to_pixel, MatterTypes, PolarPoint, polarToPoint, transformPoint, HexPoint, Point, HexSizeR } from "../simulation/Geography";
import { PetriBuilding } from "./Building";
import { PI2 } from "../WorldGen";
import { City, Pickup, UFO } from "../simulation/City";
import { AnimatedUFO } from "./AnimatedUFO";
import { IEvent } from "../events/Events";
import { AnimatedSpotlight } from "./AnimatedSpotlight";
import { PetriBeanList, PickupList } from "./Mover";
import { HexPetriBuilding, PetriHexes } from "./Buildings";
import { Magnet } from "./Magnet";

export const hex_style = {
  width: HexSizeR + 'px', 
  height: HexSizeR + 'px', 
  top: (-HexSizeR/2)+'px',
  left: (-HexSizeR/2)+'px'
}

interface WorldTilePs {
  tile: ITile;
  city: City;
  activeBeanID: number | null;
  costOfLiving: number;
  spotlightEvent: IEvent | undefined;
  onClick: () => void;
  onBeanClick: (b: Bean) => void;
  onHexClick: (hex: HexPoint) => void;
}
export class WorldTile extends React.Component<WorldTilePs> {
  constructor(props: WorldTilePs) {
    super(props);
    this.state = {
    }
    const mtnRadius = props.city.petriRadius - 20;
    for (let i = 0; i < 360 / 5; i++) {
      const az = i * 5 * Math.PI / 180;
      const pt = polarToPoint({ r: mtnRadius, az: az });
      pt.x += props.city.petriRadius; pt.y += props.city.petriRadius;
      this.mtn_transforms.push(transformPoint(pt));
    }
  }
  mtn_transforms: { transform: string }[] = [];
  renderSpotlight(): JSX.Element | null {
    if (this.props.spotlightEvent) {
      const bean = this.props.city.historicalBeans.get.find((x) => x.key === this.props.spotlightEvent?.beanKey);
      if (this.props.spotlightEvent.point && bean) {
        return <AnimatedSpotlight event={this.props.spotlightEvent} bean={bean}></AnimatedSpotlight>
      }
    }
    return null;
  }
  renderHexes(){
    return this.props.city.hexes.map((hex, i) => {
      const xy = hex_to_pixel(this.props.city.hex_size, this.props.city.petriOrigin, hex);
      return <div className="hex" key={i} style={{...hex_style, ...transformPoint(xy)}} 
        onMouseEnter={(e) => { this.props.city.lpickupMagnetPoint.set(xy); }}
        onClick={(e) => { this.props.onHexClick(hex); e.stopPropagation(); return false; }}>
          <HexPetriBuilding city={this.props.city} hex={hex}></HexPetriBuilding>
      </div>
    });
  }
  render() {
    const deaths = this.props.city.historicalBeans.get.filter((x) => !x.alive).map((b: Bean, i) => {
      return (
        <span key={i} className="dead" style={{ left: (i * 10) + 'px' }}>⚰️</span>
      )
    });
    const ufos = this.props.city.ufos.map((u: UFO, i: number) => {
      return <AnimatedUFO ufo={u} key={u.key} city={this.props.city}></AnimatedUFO>
    });
    const mtns = this.mtn_transforms.map((x, i) => {
      return <span key={i} style={x} className="mtn">⛰️</span>
    });
    const style = {
      height: (this.props.city.petriRadius * 2) + 'px',
      width: (this.props.city.petriRadius * 2) + 'px',
    }
    return (
      <div className="tile" onClick={() => this.props.onClick()} onMouseLeave={() => {this.props.city.lpickupMagnetPoint.set(undefined);}} style={style}>
        <svg style={{ width: '100%', height: '100%' }} className="petri-base">
          <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 1)" />
        </svg>
        <PetriHexes city={this.props.city} hexes={this.props.city.hexes} onHexClick={this.props.onHexClick}></PetriHexes>
        {mtns}
        {/* {deaths} */}
        <PickupList pickups={this.props.city.pickups}></PickupList>
        <PetriBeanList cityKey={this.props.city.key}></PetriBeanList>
        {ufos}
        <Magnet pickupMagnetPoint={this.props.city.lpickupMagnetPoint}></Magnet>
        <svg style={{ width: '100%', height: '100%' }} className="petri-lid">
          <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 0.2)" />
        </svg>
        {this.renderSpotlight()}
      </div>
    )
  }
}