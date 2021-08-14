import React from "react";
import { keyToName } from "../i18n/text";
import { Subtabs } from "../chrome/Subtab";
import { IDifficulty } from "../Game";
import { City, ICity } from "../simulation/City";
import { BuildingIcon, BuildingJobIcon, BuildingTypes, HexPoint, IBuilding } from "../simulation/Geography";
import { EnterpriseType, EnterpriseTypeIcon, EnterpriseTypes, IEnterprise } from "../simulation/Institutions";
import { CostSmall } from "../widgets/CostSmall";
import { BuildingOpenSlots, BuildingUsedSlots } from "../simulation/RealEstate";
import { useSelector } from "react-redux";
import { RootState, selectSelectedBuilding, selectSelectedCity } from "../state/state";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { beam, build, changeEnterprise, fireBean, selectCity, upgrade } from "../state/features/world.reducer";
import { doSelectCity, doSelectHex, doSelectNone } from "../state/features/selected.reducer";

export const BeamButton: React.FC<{
    city: number,
    hex: string,
    difficulty: IDifficulty
}> = (props) => {
    const dispatch = useAppDispatch();
    return <div className="card-parent">
    <button className="card button" type="button" onClick={() => dispatch(beam({cityKey: props.city, where: HexStringToHex(props.hex)}))}>
        🛸 Beam In New Subject
        <CostSmall cost={props.difficulty.cost.hex.beam} rider="+Subject"></CostSmall>
    </button>
</div>
}

export const HexPanel: React.FC<{
    difficulty: IDifficulty
}> = (props) => {
    const hex = useSelector((state: RootState) => state.selected.selectedHexKey);
    const building = useSelector(selectSelectedBuilding);
    const city = useSelector(selectSelectedCity);
    const dispatch = useAppDispatch();
    if (city && building){
        return <HexBuildingPanel building={building} city={city} difficulty={props.difficulty}></HexBuildingPanel>
    } else if (city && hex){
        const eHex = props.difficulty.cost.emptyHex;
        return <div>
        <div>
            <strong>Empty Lot</strong> in <strong>{city.name}</strong>
            <button type="button" className="pull-r" onClick={() => dispatch(doSelectCity({cityKey: city.key}))} >❌</button>
        </div>
        {/* <div>
            {hex.q}x
            {hex.r}
        </div> */}
        <h3>Build:</h3>
        <div className="card-parent">
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: city.key, where: HexStringToHex(hex), what: 'house'}))}>
                {BuildingIcon['house']} House
                <CostSmall cost={eHex.build.house}></CostSmall>
            </button>
        </div>
        <div className="card-parent">
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: city.key, where: HexStringToHex(hex), what: 'farm'}))}>
                {BuildingIcon['farm']} Farm
                <CostSmall cost={eHex.build.farm}></CostSmall>
            </button>
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: city.key, where: HexStringToHex(hex), what: 'hospital'}))}>
                {BuildingIcon['hospital']} Hospital
                <CostSmall cost={eHex.build.hospital}></CostSmall>
            </button>
        </div>
        <div className="card-parent">
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: city.key, where: HexStringToHex(hex), what: 'theater'}))}>
                {BuildingIcon['theater']} Theater
                <CostSmall cost={eHex.build.theater}></CostSmall>
            </button>
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: city.key, where: HexStringToHex(hex), what: 'park'}))}>
                {BuildingIcon['park']} Park
                <CostSmall cost={eHex.build.park}></CostSmall>
            </button>
        </div>
        <h3>Beings:</h3>
        <BeamButton difficulty={props.difficulty} hex={hex} city={city.key}></BeamButton>
    </div>
    } else {
        return <div></div>
    }
}

export const HexBuildingPanel: React.FC<{
    building: IBuilding,
    difficulty: IDifficulty,
    city: ICity
}> = (props) => {
    const b = props.building;
    const e = useAppSelector(s => b.enterpriseKey != null ? s.world.enterprises.byID[b.enterpriseKey]: undefined);
    const dispatch = useAppDispatch();
    const slots = BuildingUsedSlots(b);
    const free = BuildingOpenSlots(b);
    const hasJobs = b.type != 'park' && b.type != 'nature';
    const hex = `${b.address.q},${b.address.r}`;
    return <div>
        <div>
            <strong>{b.upgraded && hasJobs ? 'Dense ': 'Small '}{keyToName[b.type]}</strong>
            <button type="button" className="pull-r" onClick={() => dispatch(doSelectNone())}>❌</button>
        </div>
        <div className="text-right">
            <small>
            in&nbsp;<strong>{props.city.name}</strong>
            </small>
        </div>
    {
        b.upgraded && hasJobs ? <div>
            {renderDensityWarning(b.type)}
        </div> : null
    }
    {
        e != null ?  <EnterpriseTypePicker 
            enter={e} 
            changeEnterprise={(t) => dispatch(changeEnterprise({enterpriseKey: b.key, newType: t}))}>
            </EnterpriseTypePicker> : null
    }
    {
        (slots.length === 0) ? null : <WorkerList></WorkerList>
    }
    {
        !hasJobs ? null : <div>
            This {keyToName[b.type]} can support {free.length} more jobs.
            {
                b.upgraded ? null : <span><br/>Upgrade it to add 3 more job slots.</span>
            }
        </div>
    }
    {
        b.upgraded || !hasJobs ? null : <div><div className="card-parent">
                <button className="card button" type="button" onClick={() => dispatch(upgrade({buildingKey: b.key}))}>
                    🛠️ Upgrade
                    <CostSmall cost={props.difficulty.cost.hex.upgrade}></CostSmall>
                </button>
            </div>
            {renderDensityWarning(b.type)}
        </div>
    }
    <BeamButton city={props.city.key} difficulty={props.difficulty} hex={hex}></BeamButton>
    </div>
}

const renderDensityWarning = (typ: BuildingTypes) => {
    if (typ === 'house')
    return <>
        <div className="text-center">
        <small>
        🐮 Parochial subjects may emit 👎<br/>when living in dense buildings
        </small>
    </div> 
    <div className="text-center">
        <small>
        🍸 Cosmopolitan subjects may emit 👎<br/>when living in small buildings
        </small>
    </div>
    </>;
    else return <div>

    </div>
}

export const WorkerList: React.FC<{
}> = (props) => {
    return <div>
    <strong>Workers:</strong>
    {/* {
        slots.map((x) => {
            return {
                key: x,
                bean: props.city.beans.get.find((y) => y.key === b.job_slots[x])
            }
        }).map((x) => <div key={x.key}>
            {BuildingJobIcon[b.type]} {x.bean?.name} {isEnterprise(b) && b.enterpriseType === 'company' && x.bean?.key === b.ownerBeanKey ? '🎩' : ''}
            <button title="Fire" className="callout marg-0" onClick={() => x.bean ? dispatch(fireBean({cityKey: props.city.key, beanKey: b.key})) : null}>
                🔥
            </button>
        </div>)
    } */}
</div>
}
export const EnterpriseTypePicker: React.FC<{
    enter: IEnterprise,
    changeEnterprise: (newType: EnterpriseType) => void,
}> = (props) => {
    const options = EnterpriseTypes.map((x) => {
        return {
            icon: EnterpriseTypeIcon[x],
            text: x[0].toUpperCase()+x.substring(1),
            value: x,
            onClick: () => {
                props.changeEnterprise(x);
            }
        }
    }); 
    return <Subtabs active={props.enter.enterpriseType} options={options}></Subtabs>
}

function HexStringToHex(hex: string): HexPoint {
    const split = hex.split(',');
    return {
        q: +split[0],
        r: +split[1]
    }
}
