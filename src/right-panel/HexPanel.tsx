import React from "react";
import { keyToName } from "../i18n/text";
import { Subtabs } from "../chrome/Subtab";
import { IDifficulty } from "../Game";
import { ICity } from "../simulation/City";
import { BuildingIcon, BuildingJobIcon, BuildingToGood, BuildingTypes, HexPoint, IBuilding, IDistrict } from "../simulation/Geography";
import { EnterpriseType, EnterpriseTypeIcon, EnterpriseTypes, IEnterprise } from "../simulation/Institutions";
import { CostSmall } from "../widgets/CostSmall";
import { BuildingOpenSlots, BuildingUsedSlots } from "../simulation/RealEstate";
import { useSelector } from "react-redux";
import { RootState, selectSelectedBuilding, selectSelectedCity } from "../state/state";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { beam, build, changeEnterprise, fireBean, selectCity, upgrade } from "../state/features/world.reducer";
import { doSelectCity, doSelectDistrict, doSelectNone } from "../state/features/selected.reducer";
import { BuildingJobSlot } from "../simulation/Occupation";
import { GoodIcon, TraitGood } from "../World";

export const BeamButton: React.FC<{
    city: number,
    hex: HexPoint,
    difficulty: IDifficulty
}> = (props) => {
    const dispatch = useAppDispatch();
    return <div className="card-parent">
    <button className="card button" type="button" onClick={() => dispatch(beam({cityKey: props.city, where: props.hex}))}>
        🛸 Beam In New Subject
        <CostSmall cost={props.difficulty.cost.hex.beam} rider="+Subject"></CostSmall>
    </button>
</div>
}
export const BuildPanel: React.FC<{
    cityKey: number,
    selectedLotKey: number|undefined,
    district: IDistrict,
    difficulty: IDifficulty,
}> = (props) => {
    const districtLots = useAppSelector(x => props.district.lots.map(y => x.world.lots.byID[y]));
    const targetLot = props.selectedLotKey ?? districtLots.find(z => z.buildingKey == null)?.key;
    const dispatch = useAppDispatch();
    const eHex = props.difficulty.cost.emptyHex;
    if (targetLot){
        return <div>

        <h3>Build:</h3>
        <div className="card-parent">
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: props.cityKey, lot: targetLot, what: 'house'}))}>
                {BuildingIcon['house']} House
                <CostSmall cost={eHex.build.house}></CostSmall>
            </button>
        </div>
        <div className="card-parent">
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: props.cityKey, lot: targetLot, what: 'farm'}))}>
                {BuildingIcon['farm']} Farm
                <CostSmall cost={eHex.build.farm}></CostSmall>
            </button>
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: props.cityKey, lot: targetLot, what: 'hospital'}))}>
                {BuildingIcon['hospital']} Hospital
                <CostSmall cost={eHex.build.hospital}></CostSmall>
            </button>
        </div>
        <div className="card-parent">
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: props.cityKey, lot: targetLot, what: 'theater'}))}>
                {BuildingIcon['theater']} Theater
                <CostSmall cost={eHex.build.theater}></CostSmall>
            </button>
            <button className="card button" type="button" onClick={
                () => dispatch(build({city: props.cityKey, lot: targetLot, what: 'park'}))}>
                {BuildingIcon['park']} Park
                <CostSmall cost={eHex.build.park}></CostSmall>
            </button>
        </div>
        </div>
    } else {
        return <div></div>
    }
}

const DistrictTypeIcon = {
    urban: '⛲',
    rural: '📪',
    fallow: '🌳'
}
const DistrictTypeText = {
    urban: 'Urban',
    rural: 'Rural',
    fallow: 'Empty'
}

export const HexPanel: React.FC<{
    difficulty: IDifficulty
}> = (props) => {
    const districtKey = useSelector((state: RootState) => state.selected.selectedDistrictKey);
    const district = useAppSelector((x) => districtKey != null ? x.world.districts.byID[districtKey]: undefined);
    const lotKey = useAppSelector((x) => x.selected.selectedLotKey);
    const building = useSelector(selectSelectedBuilding);
    const city = useSelector(selectSelectedCity);
    const dispatch = useAppDispatch();
    if (city && district == null){
        return <div></div>
    }
    else if (city && building && district){
        return <HexBuildingPanel building={building} city={city} hex={district} difficulty={props.difficulty}></HexBuildingPanel>
    } else if (city && district){
        return <div>
        <div>
            <strong>{DistrictTypeIcon[district.kind]} {DistrictTypeText[district.kind]} District</strong> in <strong>{city.name}</strong>
            <button type="button" className="pull-r" onClick={() => dispatch(doSelectCity({cityKey: city.key}))} >❌</button>
        </div>

        <BuildPanel cityKey={city.key} district={district} selectedLotKey={lotKey} difficulty={props.difficulty}></BuildPanel>

        {/* <div>
            {hex.q}x
            {hex.r}
        </div> */}
        <h3>Beings:</h3>
        <BeamButton difficulty={props.difficulty} hex={district} city={city.key}></BeamButton>
    </div>
    } else {
        return <div></div>
    }
}

export const HexBuildingPanel: React.FC<{
    building: IBuilding,
    difficulty: IDifficulty,
    city: ICity,
    hex: HexPoint
}> = (props) => {
    const b = props.building;
    const e = useAppSelector(s => b.enterpriseKey != null ? s.world.enterprises.byID[b.enterpriseKey]: undefined);
    const dispatch = useAppDispatch();
    const free = BuildingOpenSlots(b);
    const hasJobs = b.type != 'park' && b.type != 'nature';
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
        e != null ? <div>
            <small>
                ${e.cash?.toFixed(2)} from sales today
            </small>
            <EnterpriseListings enterpriseKey={e.key} good={BuildingToGood[b.type]}></EnterpriseListings>
        </div> : null
    }
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
        <WorkerList cityKey={props.city.key} building={b}></WorkerList>
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
    <BeamButton city={props.city.key} difficulty={props.difficulty} hex={props.hex}></BeamButton>
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
    cityKey: number,
    building: IBuilding
}> = (props) => {
    const dispatch = useAppDispatch();
    const beans = useAppSelector(x => props.building.jobs.map((k) => x.world.beans.byID[k]));
    const enterprise = useAppSelector(s => s.world.enterprises.byID[props.building.key]);
    if (beans.length < 0) {
        return <div>No Workers</div>
    }
    return <div>
    <strong>Workers:</strong>
    {
        beans.map((x) => <div key={x.key}>
            {BuildingJobIcon[props.building.type]} {x.name} {enterprise && enterprise.enterpriseType === 'company' && x.key === enterprise.ownerBeanKey ? '🎩' : ''}
            <button title="Fire" className="callout marg-0" onClick={() => x ? dispatch(fireBean({cityKey: props.cityKey, beanKey: x.key})) : null}>
                🔥
            </button>
        </div>)
    }
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

export const EnterpriseListings: React.FC<{
    enterpriseKey: number,
    good: TraitGood
}> = (props) => {
    const listings = useAppSelector(s => s.world.economy.market.listings[props.good])
    return <div>
        {
            listings.filter(y => y.sellerEnterpriseKey === props.enterpriseKey).map((x,i) => <div key={i}>
                {x.quantity} {GoodIcon[props.good]} @ ${x.price.toFixed(2)}
            </div>)
        }
    </div>
}

function HexStringToHex(hex: string): HexPoint {
    const split = hex.split(',');
    return {
        q: +split[0],
        r: +split[1]
    }
}
