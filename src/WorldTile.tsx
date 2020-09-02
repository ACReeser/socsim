import { Tile, City } from "./World";
import { Bean } from "./Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";

interface WorldTilePs {
    tile: Tile;
    city: City;
    costOfLiving: number;
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
      const houses = this.props.city.houses.map((h: any, i) => {
        const style = {
            left: h.left+'%',
            top: h.top+'%'
        }
        return (
          <span key={i} style={style} className="house">🏡</span>
        )
      })
      return (
        <div className="tile" onClick={() => this.props.onClick()}>
          {deaths}
          {houses}
          {beans}
          <span className="tile-label">{this.props.tile.name}</span>
          <img src={this.props.tile.url} alt={this.props.tile.type} />
        </div>
      )
    }
  }