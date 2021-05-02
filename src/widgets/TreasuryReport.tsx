import React, { useEffect, useState } from "react";
import { Live } from "../events/Events";


export const TreasuryReport: React.FC<{
    treasury: Live<number>
}> = (props) => {
    const [coin, setCoin] = useState(props.treasury.get);
    const update = () => {
        setCoin(props.treasury.get);
    }
    useEffect(() => {
        props.treasury.onChange.subscribe(update);
        return props.treasury.onChange.unsubscribe(update);
    })
    return <div className="pad-4p">
        <div>
            <strong>💰 Treasury: {coin.toFixed(2)}</strong>
        </div>
    </div>
}