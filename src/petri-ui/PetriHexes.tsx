import React, { useRef } from "react";
import { DistrictTypeIcon } from "../right-panel/HexPanel";
import { ICity } from "../simulation/City";
import { IBuilding, transformPoint } from "../simulation/Geography";
import { doSelectDistrict, doSelectLot } from "../state/features/selected.reducer";
import { magnetChange, selectBuildingsByCity } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { PetriBuilding, UIBuilding } from "./Building";
import { hex_style } from "./WorldTile";

export const PetriLot: React.FC<{
    cityKey: number,
    districtKey: number,
    lotKey: number,
    lotDrawn: string,
    className: string
}> = (props) => {
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => state.selected.selectedLotKey === props.lotKey);

    return <g className={"lot "+ props.className + (selected ? " selected": "")} transform="matrix(1.21104,0,0,0.901051,-221.832,-145.114)" onClick={(e) => {dispatch(doSelectLot({cityKey: props.cityKey, district: props.districtKey, lot: props.lotKey})); e.preventDefault();return false;}}>
        <path d={props.lotDrawn} />
    </g>
}

export const PetriHex: React.FC<{
    cityKey: number,
    districtKey: number
}> = (props) => {
    const dispatch = useAppDispatch();
    const district = useAppSelector(state => state.world.districts.byID[props.districtKey]);
    const selected = useAppSelector(state => state.selected.selectedDistrictKey === props.districtKey);
    const extraClasses = selected ? 'hex-selected' : ''; 
    return <div className={"hex "+extraClasses}
        key={props.districtKey}
        style={{ ...hex_style, ...transformPoint(district.point) }}
        onMouseEnter={(e) => { dispatch(magnetChange({cityKey: props.cityKey, px: district.point})) }}
        onClick={(e) => {
            if (!e.isDefaultPrevented()){
                dispatch(doSelectDistrict({cityKey: props.cityKey, district: props.districtKey})); 
                e.stopPropagation(); 
                return false;
            }
        }
        }>
        <svg width="100%" height="100%" viewBox="0 0 104 120" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',left:'0%',top:'0%',opacity:0.5}} className="svg-hex">
            <g transform="matrix(1,0,0,1,-233.288,0)">
            {
            (district.kind === 'fallow') ? <g id="rural-circle-120" transform="matrix(0.990588,0,0,1.33139,453.063,64.7779)">
                    <g id="circle" transform="matrix(1.0095,0,0,0.751097,-457.368,-48.6545)">
                        <circle className="district-circle"  cx="285.248" cy="60.588" r="17.271"/>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="265.931px" y="77.859px" style={{fontSize:'46.631px'}}>🌳</text>
                    </g>
                </g>: (district.kind === 'rural') ? <g id="rural-circle-120" transform="matrix(0.990588,0,0,1.33139,453.063,64.7779)">
                    <g transform="matrix(1.0095,0,0,0.751097,-457.368,-48.6545)">
                        <path className="district-circle" d="M285.25,0L285.251,43.341M300.181,69.173L337.211,89.968L300.181,69.173ZM270.408,69.173L233.288,90.21M285.248,43.317C294.78,43.317 302.519,51.056 302.519,60.588C302.519,70.12 294.78,77.859 285.248,77.859C275.716,77.859 267.977,70.12 267.977,60.588C267.977,51.056 275.716,43.317 285.248,43.317Z" />
                    </g>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="rural_3" lotKey={district.lots[2]} lotDrawn="M43.3,112.51L43.301,142.954L43.3,142.954C35.334,142.954 28.868,149.421 28.868,157.387C28.868,160.061 29.596,162.566 30.866,164.714L6.474,178.584C2.37,171.965 0,164.162 0,155.81C0,131.912 19.402,112.51 43.3,112.51L43.3,112.51Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="rural_2" lotKey={district.lots[1]} lotDrawn="M55.735,164.713L80.126,178.583C72.489,190.9 58.846,199.11 43.3,199.11C27.754,199.11 14.111,190.9 6.474,178.584L30.866,164.714C33.378,168.965 38.009,171.819 43.3,171.819C48.592,171.819 53.223,168.964 55.735,164.713ZM0,155.81C0,155.81 0,155.81 0,155.81Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="rural_1" lotKey={district.lots[0]} lotDrawn="M43.3,112.51C67.198,112.51 86.6,131.912 86.6,155.81C86.6,164.162 84.23,171.965 80.126,178.583L55.735,164.713C57.004,162.564 57.732,160.06 57.732,157.387C57.732,149.421 51.266,142.954 43.301,142.954L43.3,112.51Z"></PetriLot>
                    <g transform="matrix(0.402264,0,0,0.299296,-271.444,-46.211)">
                        <PetriBuilding lotKey={district.lots[0]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-271.444,1.20645)">
                        <PetriBuilding lotKey={district.lots[1]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-323.46,-21.9919)">
                        <PetriBuilding lotKey={district.lots[2]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="265.931px" y="77.859px" style={{fontSize:'36.631px'}}>
                            📪
                        </text>
                    </g>
                </g> : (district.kind === 'urban') ? <g id="rural-circle-120" transform="matrix(0.990588,0,0,1.33139,453.063,64.7779)">
                    <g transform="matrix(0.402264,0,0,0.299296,-271.444,-46.211)">
                        <PetriBuilding lotKey={district.lots[0]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-253.016,-21.9919)">
                        <PetriBuilding lotKey={district.lots[1]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-271.444,1.20645)">
                        <PetriBuilding lotKey={district.lots[2]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-306.821,1.20645)">
                        <PetriBuilding lotKey={district.lots[3]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-323.46,-21.9919)">
                        <PetriBuilding lotKey={district.lots[4]}></PetriBuilding>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-306.821,-46.211)">
                        <PetriBuilding lotKey={district.lots[5]}></PetriBuilding>
                    </g>
                    <g transform="matrix(1.0095,0,0,0.751097,-457.368,-48.6545)">
                        <path className="district-circle" d="M285.25,0L285.251,43.341M300.181,69.173L337.211,89.968L300.181,69.173ZM270.408,69.173L233.288,90.21M285.248,43.317C294.78,43.317 302.519,51.056 302.519,60.588C302.519,70.12 294.78,77.859 285.248,77.859C275.716,77.859 267.977,70.12 267.977,60.588C267.977,51.056 275.716,43.317 285.248,43.317Z"/>
                    </g>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="urban_9" lotKey={district.lots[5]} lotDrawn="M5.135,135.352C12.441,121.76 26.798,112.51 43.3,112.51L43.3,112.51L43.301,142.954L43.3,142.954C37.962,142.954 33.298,145.858 30.801,150.17L5.135,135.352Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="urban_8" lotKey={district.lots[4]} lotDrawn="M5.158,135.317L30.861,150.068C29.594,152.215 28.868,154.717 28.868,157.387C28.868,160.061 29.596,162.566 30.866,164.714L6.474,178.584C2.37,171.965 0,164.162 0,155.81C0,148.284 1.774,141.487 5.158,135.317Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="urban_7" lotKey={district.lots[3]} lotDrawn="M43.3,171.819L43.3,199.11C27.754,199.11 14.111,190.9 6.474,178.584L30.866,164.714C33.378,168.965 38.009,171.819 43.3,171.819ZM0,155.81C0,155.81 0,155.81 0,155.81Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="urban_6" lotKey={district.lots[2]} lotDrawn="M43.3,171.819C48.592,171.819 53.223,168.964 55.735,164.713L80.126,178.583C72.489,190.9 58.846,199.11 43.3,199.11L43.3,171.819Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="urban_5" lotKey={district.lots[1]} lotDrawn="M81.453,135.317C84.837,141.487 86.6,148.284 86.6,155.81C86.6,164.162 84.23,171.965 80.126,178.583L55.735,164.713C57.004,162.564 57.732,160.06 57.732,157.387C57.732,154.717 57.006,152.215 55.739,150.068L81.453,135.317Z"></PetriLot>
                    <PetriLot cityKey={props.cityKey} districtKey={props.districtKey} className="urban_4" lotKey={district.lots[0]} lotDrawn="M55.725,150.044C53.211,145.801 48.585,142.954 43.301,142.954L43.3,112.51C59.792,112.51 74.143,121.75 81.453,135.331L55.725,150.044Z"></PetriLot>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="265.931px" y="77.859px" style={{fontSize:'46.631px'}}>
                            {(district.q === 0 && district.r === 0) ? '🏫' : '⛲'}
                        </text>
                    </g>
                </g>: <g transform="matrix(0.990588,0,0,1.33139,453.063,64.7779)">
                    <g id="circle" transform="matrix(1.0095,0,0,0.751097,-457.368,-48.6545)">
                        <circle className="district-circle" cx="285.248" cy="60.588" r="17.271"/>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="265.931px" y="77.859px" style={{fontSize:'46.631px'}}>{DistrictTypeIcon['nature']}</text>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="270px" y="-20px" style={{fontSize:'36.631px'}}>🏕️</text>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="180.931px" y="147.859px" style={{fontSize:'36.631px'}}>🏕️</text>
                    </g>
                    <g transform="matrix(0.402264,0,0,0.299296,-287.943,-23.1242)">
                        <text x="365.931px" y="147.859px" style={{fontSize:'36.631px'}}>🏕️</text>
                    </g>
                </g>}
            </g>
        </svg> 
        {props.children}
    </div>

}

export const PetriHexes2: React.FC<{
    cityKey: number
}> = (props) => {
    const city = useAppSelector(state => state.world.cities.byID[props.cityKey]);
    const districtKeys = useAppSelector(state => state.world.cities.byID[props.cityKey]?.districtKeys);
    return <>{districtKeys.map((dKey, i) => {
        return <PetriHex cityKey={props.cityKey }key={dKey} districtKey={dKey}>
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
                <UIBuilding building={x} style={{}} getStyle={() => {return{}}}></UIBuilding>
            </div> )
        }
    </>
}