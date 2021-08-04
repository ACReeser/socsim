import React from "react";
import { Bean } from "../simulation/Bean";
import { HexPoint, polarToPoint, transformPoint } from "../simulation/Geography";
import { magnetChange } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { AnimatedUFO2 } from "./AnimatedUFO2";
import { PetriHexes2 } from "./Buildings";
import { Magnet2 } from "./Magnet";



interface WorldTilePs {
  // tileKey: number;
  cityKey: number;
  onClick: () => void;
}
export const WorldTile2: React.FC<WorldTilePs> = (props) => {

  // const tile = useAppSelector(state => state.world.tiles.byID[props.tileKey]);
  const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
  const spotlight = useAppSelector(state => state.world.spotlightEvent);
  const spotlightBean = useAppSelector(state => {
    if (state.world.spotlightEvent && state.world.spotlightEvent.beanKey)
      return state.world.beans.byID[state.world.spotlightEvent.beanKey];
    return undefined;
  });

  const dispatch = useAppDispatch()
  const mtn_transforms: { transform: string }[] = [];

  const mtnRadius = city.petriRadius - 20;
  for (let i = 0; i < 360 / 5; i++) {
    const az = i * 5 * Math.PI / 180;
    const pt = polarToPoint({ r: mtnRadius, az: az });
    pt.x += city.petriRadius; pt.y += city.petriRadius;
    mtn_transforms.push(transformPoint(pt));
  }
  const deaths = city.deadBeanKeys.map((bk: number, i) => {
    return (
      <span key={i} className="dead" style={{ left: (i * 10) + 'px' }}>⚰️</span>
    )
  });
  const ufos = city.ufoKeys.map((uK: number, i: number) => {
    return <AnimatedUFO2 ufoKey={uK} key={uK} cityKey={city.key}></AnimatedUFO2>
  });
  const style = {
    height: (city.petriRadius * 2) + 'px',
    width: (city.petriRadius * 2) + 'px',
  }
  return (
    <div className="tile" onClick={() => props.onClick()} onMouseLeave={() => { dispatch(magnetChange({ cityKey: city.key })) }} style={style}>
      <svg style={{ width: '100%', height: '100%' }} className="petri-base">
        <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 1)" />
      </svg>
      <PetriHexes2 cityKey={city.key}></PetriHexes2>
      {mtn_transforms.map((x, i) => {
        return <span key={i} style={x} className="mtn">⛰️</span>
      })}
      {/* <PickupList2 cityKey={props.cityKey}></PickupList2>
      <BeanList beans={city.beans} activeBeanID={props.activeBeanID} onBeanClick={(b: Bean) => props.onBeanClick(b)}></BeanList> */}
      {ufos}
      <Magnet2 cityKey={props.cityKey}></Magnet2>
      <svg style={{ width: '100%', height: '100%' }} className="petri-lid">
        <circle cx="50%" cy="50%" r="50%" stroke="grey" fill="rgba(255, 255, 255, 0.2)" />
      </svg>
      {/* {
        (spotlight && spotlightBean && spotlight.point) ? <AnimatedSpotlight event={spotlight} bean={bean}></AnimatedSpotlight>: null
      } */}
    </div>
  )
}