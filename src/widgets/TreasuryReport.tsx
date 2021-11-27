import React, { useEffect, useState } from "react";
import { useAppSelector } from "../state/hooks";


export const TreasuryReport: React.FC<{

}> = (props) => {
    const coin = useAppSelector(s => s.world.law.cash);

    return <div className="pad-4p">
        <div>
            <strong><span role="img" aria-label="cashbag">💰</span> Treasury: {coin.toFixed(2)}</strong>
        </div>
    </div>
}