import React, { useState } from "react";
import { Subtabs } from "../chrome/Subtab";
import { ITitle, TitleBadge, TitleHeadwear, TitlePrivilege } from "../simulation/Titles";
import { addTitle, editTitle } from "../state/features/world.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";

export const SocietyPanel: React.FC<{

}> = (props) => {
    const titles = useAppSelector(s => s.world.titles.allIDs.reduce( (all, id)=>{all.push(s.world.titles.byID[id]); return all;}, [] as ITitle[]));
    const dispatch = useAppDispatch();
    return <div className="pad-4p">
        <Subtabs active={'titles'} options={[{icon: '👑',text:'Titles',value:'titles',onClick:() => {}},{icon:'🔖',text:'Names',value:'names',onClick:() => {}}]}></Subtabs>
        {/* <div className="subheader">
            <h3>Other</h3>
        </div>
        <div>

        </div> */}
        <div className="subheader">
            <h2>
                Titles
                <button 
                    className="callout marg-0 pull-r"
                    onClick={() => {
                        dispatch(addTitle({}));
                    }}
                >➕ Title</button>
            </h2>
        </div>
        <div>
            {
                titles.map(y => <TitleEdit key={y.key} title={y} onEdit={(t) => {
                    dispatch(editTitle({newT: t}))
                }}></TitleEdit>)
            }
        </div>
      </div>
}


export const TitleEdit: React.FC<{
    title: ITitle,
    onEdit: (newT: ITitle) => void
}> = (props) => {
    return <div style={{border:'1px solid black',borderRadius: '10px',padding:'2px',display:'flex',width:'300px',flexDirection:'column'}}>
        <div>
            <label>
                Title:&nbsp;
                <input type="text" value={props.title.name} onChange={(ev) => props.onEdit({...props.title, name: ev.target.value})} />
            </label>
        </div>
        <div>
            <label>
                Headwear:&nbsp;
                <select value={props.title.headwear} onChange={(e) => props.onEdit({
                    ...props.title,
                    headwear: e.target.value as TitleHeadwear
                })}>
                    <option value={undefined}>None</option>
                    <option value='👑'>👑</option>
                    <option value='👒'>👒</option>
                    <option value='🎩'>🎩</option>
                    <option value='🎓'>🎓</option>
                    <option value='🧢'>🧢</option>
                </select>
            </label>
            <label>
                &nbsp;Badge:&nbsp;
                <select value={props.title.badge} onChange={(e) => props.onEdit({
                    ...props.title,
                    badge: e.target.value as TitleBadge
                })}>
                    <option value={undefined}>None</option>
                    <option value='⭐'>⭐</option>
                    <option value='🛡️'>🛡️</option>
                    <option value='⚖️'>⚖️</option>
                    <option value='📋'>📋</option>
                    <option value='🏅'>🏅</option>
                    <option value='🎀'>🎀</option>
                    <option value='🌸'>🌸</option>
                </select>
            </label>
        </div>
        <h3>
            Privileges
            <button 
                className="callout marg-0 pull-r"
                onClick={() => {
                    const c = props.title.privileges.slice();
                    c.push(undefined);
                    props.onEdit({...props.title, privileges: c})
                }}
            >➕ Privilege</button>
        </h3>
        {
            props.title.privileges.map((p,i) => <div>
                <select key={i} value={p} onChange={(ev) => {
                    
                    // const c = props.title.privileges.splice(i, 1, ev.target.value as TitlePrivilege);
                    // props.onEdit({...props.title, privileges: c})
                }}>
                    <option value={undefined}>None</option>
                    <option value={'tax_exemption'}>Social Deference</option>
                    <option value={'tax_exemption'}>Criminal Immunity</option>
                    <option value={'tax_exemption'}>Tax Exemption</option>
                </select>
            </div>)
        }
    </div>
}