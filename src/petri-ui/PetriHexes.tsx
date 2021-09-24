import React, { useEffect, useState } from "react";
import { ICity } from "../simulation/City";
import { CityBook, HexPoint, hex_to_pixel, IBuilding, Point, transformPoint } from "../simulation/Geography";
import { doSelectBuilding, doSelectHex } from "../state/features/selected.reducer";
import { magnetChange, selectBuildingsByCity, selectCity, selectCityBuildingByHex } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { PetriBuilding, UIBuilding } from "./Building";
import { hex_style } from "./WorldTile";

/**
 * redux building selector
 * @param props 
 * @returns 
 */
export const HexPetriBuilding2: React.FC<{
    cityKey: number,
    hex: HexPoint
}> = (props) => {
    const building = useAppSelector(state => selectCityBuildingByHex(state.world, props.cityKey, `${props.hex.q},${props.hex.r}`));
    const city = useAppSelector(state => selectCity(state.world, props.cityKey));
    if (building)
        return <PetriBuilding city={city} building={building}>{props.children}</PetriBuilding>
    else if (props.children) return <span>{props.children}</span>;
    return null
}

export const PetriHex: React.FC<{
    cityKey: number,
    buildingKey: number|undefined,
    hex: HexPoint,
    hexString: string,
    xy: Point,
    i: number
}> = (props) => {
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => state.selected.selectedHexKey === props.hexString);
    const extraClasses = selected ? 'hex-selected' : ''; 
    return <div className={"hex "+extraClasses}
        key={props.i}
        style={{ ...hex_style, ...transformPoint(props.xy) }}
        onMouseEnter={(e) => { dispatch(magnetChange({cityKey: props.cityKey, px: props.xy})) }}
        onClick={(e) => {
            if (props.buildingKey != null)
                dispatch(doSelectBuilding({cityKey: props.cityKey, buildingKey: props.buildingKey, hex: props.hex}));
            else 
                dispatch(doSelectHex({cityKey: props.cityKey, hex: props.hex})); 
            e.stopPropagation(); 
            return false; }}>
            <svg width="116%" height="116%" viewBox="0 0 104 120" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',left:'-8%',top:'-6.5%',opacity:0.5}}>
                <g transform="matrix(1,0,0,1,-233.288,0)">
                    <g id="rural-circle-120" transform="matrix(0.990588,0,0,1.33139,453.063,64.7779)">
                        {/* <clipPath id="_clip1">
                            <rect x="-221.863" y="-48.655" width="104.907" height="90.132"/>
                        </clipPath> */}
                        <g transform="matrix(1.0095,0,0,0.751097,-457.368,-48.6545)">
                            <path d="M285.25,0L285.251,43.341M300.181,69.173L337.211,89.968L300.181,69.173ZM270.408,69.173L233.288,90.21M285.248,43.317C294.78,43.317 302.519,51.056 302.519,60.588C302.519,70.12 294.78,77.859 285.248,77.859C275.716,77.859 267.977,70.12 267.977,60.588C267.977,51.056 275.716,43.317 285.248,43.317Z" style={{fill:'transparent',stroke:'black','strokeWidth':'0.2px'}}/>
                        </g>
                        {/* <g clip-path="url(#_clip1)">
                            <g transform="matrix(1.0095,0,0,0.751097,-213.119,-41.1436)">
                                <path d="M43.301,35.565L43.301,33.341M55.809,57.264L57.735,58.341M43.3,-10L43.301,33.341M28.868,58.421C28.868,58.421 21.651,62.471 14.434,66.521C7.217,70.572 -8.662,80.21 -8.662,80.21L28.868,58.421ZM57.735,58.341C57.735,58.341 64.952,62.471 72.169,66.521C79.386,70.572 95.262,79.968 95.262,79.968L57.735,58.341ZM30.926,57.132L28.868,58.421M43.3,35.565C51.267,35.565 57.735,42.033 57.735,50C57.735,57.967 51.267,64.435 43.3,64.435C35.333,64.435 28.865,57.967 28.865,50C28.865,42.033 35.333,35.565 43.3,35.565Z" style={{fill:'transparent',stroke:'black','strokeWidth':'0.4px'}}/>
                            </g>
                        </g> */}
                        <g className="lot rural_3" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M43.3,112.51L43.301,142.954L43.3,142.954C35.334,142.954 28.868,149.421 28.868,157.387C28.868,160.061 29.596,162.566 30.866,164.714L6.474,178.584C2.37,171.965 0,164.162 0,155.81C0,131.912 19.402,112.51 43.3,112.51L43.3,112.51Z" />
                        </g>
                        <g className="lot rural_2" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M55.735,164.713L80.126,178.583C72.489,190.9 58.846,199.11 43.3,199.11C27.754,199.11 14.111,190.9 6.474,178.584L30.866,164.714C33.378,168.965 38.009,171.819 43.3,171.819C48.592,171.819 53.223,168.964 55.735,164.713ZM0,155.81C0,155.81 0,155.81 0,155.81Z" />
                        </g>
                        <g className="lot rural_1" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M43.3,112.51C67.198,112.51 86.6,131.912 86.6,155.81C86.6,164.162 84.23,171.965 80.126,178.583L55.735,164.713C57.004,162.564 57.732,160.06 57.732,157.387C57.732,149.421 51.266,142.954 43.301,142.954L43.3,112.51Z" />
                        </g>
                        <g className="lot urban_9" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M5.135,135.352C12.441,121.76 26.798,112.51 43.3,112.51L43.3,112.51L43.301,142.954L43.3,142.954C37.962,142.954 33.298,145.858 30.801,150.17L5.135,135.352Z" />
                        </g>
                        <g className="lot urban_8" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M5.158,135.317L30.861,150.068C29.594,152.215 28.868,154.717 28.868,157.387C28.868,160.061 29.596,162.566 30.866,164.714L6.474,178.584C2.37,171.965 0,164.162 0,155.81C0,148.284 1.774,141.487 5.158,135.317Z" />
                        </g>
                        <g className="lot urban_7" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M43.3,171.819L43.3,199.11C27.754,199.11 14.111,190.9 6.474,178.584L30.866,164.714C33.378,168.965 38.009,171.819 43.3,171.819ZM0,155.81C0,155.81 0,155.81 0,155.81Z" />
                        </g>
                        <g className="lot urban_6" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M43.3,171.819C48.592,171.819 53.223,168.964 55.735,164.713L80.126,178.583C72.489,190.9 58.846,199.11 43.3,199.11L43.3,171.819Z" />
                        </g>
                        <g className="lot urban_5" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M81.453,135.317C84.837,141.487 86.6,148.284 86.6,155.81C86.6,164.162 84.23,171.965 80.126,178.583L55.735,164.713C57.004,162.564 57.732,160.06 57.732,157.387C57.732,154.717 57.006,152.215 55.739,150.068L81.453,135.317Z" />
                        </g>
                        <g className="lot urban_4" transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)">
                            <path d="M55.725,150.044C53.211,145.801 48.585,142.954 43.301,142.954L43.3,112.51C59.792,112.51 74.143,121.75 81.453,135.331L55.725,150.044Z" />
                        </g>
                        {/* <g id="urban_9" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M5.135,135.352C12.441,121.76 26.798,112.51 43.3,112.51L43.3,112.51L43.301,142.954L43.3,142.954C37.962,142.954 33.298,145.858 30.801,150.17L5.135,135.352Z"/>
                        </g>
                        <g id="urban_8" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M5.158,135.317L30.861,150.068C29.594,152.215 28.868,154.717 28.868,157.387C28.868,160.061 29.596,162.566 30.866,164.714L6.474,178.584C2.37,171.965 0,164.162 0,155.81C0,148.284 1.774,141.487 5.158,135.317Z"/>
                        </g>
                        <g id="urban_7" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M43.3,171.819L43.3,199.11C27.754,199.11 14.111,190.9 6.474,178.584L30.866,164.714C33.378,168.965 38.009,171.819 43.3,171.819ZM0,155.81C0,155.81 0,155.81 0,155.81Z"/>
                        </g>
                        <g id="urban_6" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M43.3,171.819C48.592,171.819 53.223,168.964 55.735,164.713L80.126,178.583C72.489,190.9 58.846,199.11 43.3,199.11L43.3,171.819Z"/>
                        </g>
                        <g id="urban_5" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M81.453,135.317C84.837,141.487 86.6,148.284 86.6,155.81C86.6,164.162 84.23,171.965 80.126,178.583L55.735,164.713C57.004,162.564 57.732,160.06 57.732,157.387C57.732,154.717 57.006,152.215 55.739,150.068L81.453,135.317Z"/>
                        </g>
                        <g id="urban_4" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M55.725,150.044C53.211,145.801 48.585,142.954 43.301,142.954L43.3,112.51C59.792,112.51 74.143,121.75 81.453,135.331L55.725,150.044Z"/>
                        </g>
                        <g id="rural_3" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M43.3,112.51L43.301,142.954L43.3,142.954C35.334,142.954 28.868,149.421 28.868,157.387C28.868,160.061 29.596,162.566 30.866,164.714L6.474,178.584C2.37,171.965 0,164.162 0,155.81C0,131.912 19.402,112.51 43.3,112.51L43.3,112.51Z"/>
                        </g>
                        <g id="rural_2" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M55.735,164.713L80.126,178.583C72.489,190.9 58.846,199.11 43.3,199.11C27.754,199.11 14.111,190.9 6.474,178.584L30.866,164.714C33.378,168.965 38.009,171.819 43.3,171.819C48.592,171.819 53.223,168.964 55.735,164.713ZM0,155.81C0,155.81 0,155.81 0,155.81Z"/>
                        </g>
                        <g id="rural_1" transform="matrix(1.0095,0,0,0.751097,-213.105,-121.749)">
                            <path d="M43.3,112.51C67.198,112.51 86.6,131.912 86.6,155.81C86.6,164.162 84.23,171.965 80.126,178.583L55.735,164.713C57.004,162.564 57.732,160.06 57.732,157.387C57.732,149.421 51.266,142.954 43.301,142.954L43.3,112.51Z"/>
                        </g> */}
                    </g>
                </g>
            </svg>
            {/* <svg width="100%" height="100%" viewBox="0 0 87 100" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',left:0,top:0,opacity:0.5}}>
                <g id="rural" transform="matrix(0.82549,0,0,1.10949,183.146,53.9816)">
                    <clipPath id="_clip1">
                        <rect x="-221.863" y="-48.655" width="104.907" height="90.132"/>
                    </clipPath>
                    <g clip-path="url(#_clip1)">
                        <g transform="matrix(1.2114,0,0,0.901317,-221.863,-48.6545)">
                            <path d="M43.301,35.565L43.301,33.341M55.809,57.264L57.735,58.341M43.301,0L43.301,33.341M28.868,58.421L0,74.622L28.868,58.421ZM57.735,58.341C57.735,58.341 64.952,62.471 72.169,66.521C79.386,70.572 86.603,74.622 86.603,74.622L57.735,58.341ZM30.926,57.132L28.868,58.421M43.3,35.565C51.267,35.565 57.735,42.033 57.735,50C57.735,57.967 51.267,64.435 43.3,64.435C35.333,64.435 28.865,57.967 28.865,50C28.865,42.033 35.333,35.565 43.3,35.565Z" style={{fill:'transparent',stroke:'black','strokeWidth':'0.4px'}}/>
                        </g>
                    </g>
                </g>
            </svg> */}
            {props.children}
    </div>

}

export const PetriHexes2: React.FC<{
    cityKey: number
}> = (props) => {
    const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
    const hexes = useAppSelector(state => state.world.cities.byID[props.cityKey]?.hexes);
    return <>{hexes.map((hex, i) => {
        const xy = hex_to_pixel(city.hex_size, city.petriOrigin, hex);
        const hexStr = hex.q+','+hex.r;
        const buildingKey: number|undefined = city.buildingMap[hexStr];
        return <PetriHex i={i} hex={hex} xy={xy} hexString={hexStr} cityKey={props.cityKey} buildingKey={buildingKey} key={hexStr}>
            <HexPetriBuilding2 cityKey={props.cityKey} hex={hex}><span className="tile-label"></span></HexPetriBuilding2>
        </PetriHex>
    })}</>
}
export const SocialBuildings: React.FC<{
    city: ICity,
    onClickBuilding: (b: IBuilding) => void;
}> = (props) => {
    const buildings = useAppSelector(state => selectBuildingsByCity(state.world, props.city.key));
    return <>
        {
            buildings.map((x) => <div key={x.key} className="building-node" onClick={() => props.onClickBuilding(x)}>
                <UIBuilding cityName={props.city.name} building={x} style={{}} getStyle={() => {return{}}}></UIBuilding>
            </div> )
        }
    </>
}