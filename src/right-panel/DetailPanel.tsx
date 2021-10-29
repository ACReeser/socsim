import React, { useState } from "react";
import { doSelectNone } from "../state/features/selected.reducer";
import { abduct } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectSelectedBean, selectSelectedCity } from "../state/state";
import { BeanPanel } from "./BeanPanel";
import { HexPanel } from "./HexPanel";
import { OverviewPanel } from "./OverviewPanel";

export const DetailPanel: React.FC<{
    openBrainwash: () => void,
    openEntitle: () => void,
}> = (props) => {
    const city = useAppSelector(selectSelectedCity);
    const districtKey = useAppSelector((x) => x.selected.selectedDistrictKey);
    const district = useAppSelector((x) => districtKey != null ? x.world.districts.byID[districtKey]: undefined);
    const bean = useAppSelector(selectSelectedBean);
    const alien = useAppSelector((x) => x.world.alien);
    const dispatch = useAppDispatch();
    if (bean && city){
        return <BeanPanel bean={bean} city={city} alien={alien}
        brainwash={() => props.openBrainwash()}
        entitle={() => props.openEntitle()}
        ></BeanPanel>
    }
    if (district) {
        return <HexPanel difficulty={alien.difficulty}></HexPanel>
    }
    if (city) {
        return <OverviewPanel city={city} clearCity={() => dispatch(doSelectNone())} alien={alien}></OverviewPanel>
    }
    return <div></div>
}