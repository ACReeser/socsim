import { Tile, City } from "./World";
import { Bean } from "./Bean";
import { AnimatedBean } from "./AnimatedBean";
import React from "react";

interface WorldTilePs {
    tile: Tile;
    city: City;
    onClick: () => void;
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
          <AnimatedBean bean={b} key={b.key}></AnimatedBean>
        )
      })
      const houses = this.props.city.houses.map((h: any) => {
        const style = {
            left: h.left+'%',
            top: h.top+'%'
        }
        return (
          <span style={style} className="house">🏡</span>
        )
      })
      return (
        <div className="tile" onClick={() => this.props.onClick()}>
          {houses}
          {beans}
          <span className="tile-label">{this.props.tile.name}</span>
          <img src={this.props.tile.url} alt={this.props.tile.type} />
        </div>
      )
    }
  }