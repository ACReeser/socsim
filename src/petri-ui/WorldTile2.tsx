import { Tile } from "../World";
import { Bean } from "../simulation/Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";
import { useSelector } from 'react-redux'

import { IBuilding, BuildingIcon, BuildingTypes, hex_to_pixel, MatterTypes, PolarPoint, polarToPoint, transformPoint, HexPoint, Point, HexSizeR } from "../simulation/Geography";
import { PetriBuilding } from "./Building";
import { PI2 } from "../WorldGen";
import { City, Pickup, UFO } from "../simulation/City";
import { AnimatedUFO } from "./AnimatedUFO";
import { IEvent } from "../events/Events";
import { AnimatedSpotlight } from "./AnimatedSpotlight";
import { BeanList, PickupList } from "./Mover";
import { HexPetriBuilding, PetriBuildings, PetriHexes } from "./Buildings";
import { Magnet } from "./Magnet";
import { useAppSelector } from "../state/hooks";


interface WorldTilePs {
  // tileKey: number;
  cityKey :number;
  activeBeanID: number | null;
  costOfLiving: number;
  spotlightEvent: IEvent | undefined;
  onClick: () => void;
  onBeanClick: (b: Bean) => void;
  onHexClick: (hex: HexPoint) => void;
}
export const WorldTile2: React.FC<WorldTilePs> = (props) => {

  // const tile = useAppSelector(state => state.world.tiles.byID[props.tileKey]);
  const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);

  const mtn_transforms: { transform: string }[] = [];

  const mtnRadius = city.petriRadius - 20;
  for (let i = 0; i < 360 / 5; i++) {
    const az = i * 5 * Math.PI / 180;
    const pt = polarToPoint({ r: mtnRadius, az: az });
    pt.x += city.petriRadius; pt.y += city.petriRadius;
    mtn_transforms.push(transformPoint(pt));
  }
  const deaths = city.historicalBeans.get.filter((x) => !x.alive).map((b: Bean, i) => {
    return (
      <span key={i} className="dead" style={{ left: (i * 10) + 'px' }}>⚰️</span>
    )
  });
  const ufos = city.ufos.map((u: UFO, i: number) => {
    return <AnimatedUFO ufo={u} key={u.key} city={city}></AnimatedUFO>
  });
  const mtns = mtn_transforms.map((x, i) => {
    return <span key={i} style={x} className="mtn">⛰️</span>
  });
  const style = {
    height: (city.petriRadius * 2) + 'px',
    width: (city.petriRadius * 2) + 'px',
  }
  const renderSpotlight = () => {
    if (props.spotlightEvent) {
      const bean = city.historicalBeans.get.find((x) => x.key === props.spotlightEvent?.beanKey);
      if (props.spotlightEvent.point && bean) {
        return <AnimatedSpotlight event={props.spotlightEvent} bean={bean}></AnimatedSpotlight>
      }
    }
    return null;
  }
  return (
    <div className="tile" onClick={() => props.onClick()} onMouseLeave={() => { city.pickupMagnetPoint.set(undefined); }} style={style}>
      <svg style={{ width: '100%', height: '100%' }} className="petri-base">
        <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 1)" />
      </svg>
      <PetriHexes city={city} hexes={city.hexes} onHexClick={props.onHexClick}></PetriHexes>
      {mtns}
      <PickupList pickups={city.pickups}></PickupList>
      <BeanList beans={city.beans} activeBeanID={props.activeBeanID} onBeanClick={(b: Bean) => props.onBeanClick(b)}></BeanList>
      {ufos}
      <Magnet pickupMagnetPoint={city.pickupMagnetPoint}></Magnet>
      <svg style={{ width: '100%', height: '100%' }} className="petri-lid">
        <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 0.2)" />
      </svg>
      { renderSpotlight()}
    </div>
  )
}