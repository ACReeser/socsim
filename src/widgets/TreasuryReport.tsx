import React, { useEffect, useState } from "react";
import { Live } from "../events/Events";
import { useAppSelector } from "../state/hooks";


export const TreasuryReport: React.FC<{

}> = (props) => {
    const coin = useAppSelector(s => s.world.law.treasury);

    return <div className="pad-4p">
        <div>
            <strong>💰 Treasury: {coin.toFixed(2)}</strong>
        </div>
    </div>
}