import React, { useState } from "react";
import { Subtabs } from "../chrome/Subtab";
import { ITitle, TitleBadge, TitleHeadwear, TitlePrivilege, PrivilegeData } from "../simulation/Titles";
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
                <span role="img" aria-label="crown">👑</span> Titles
                <button 
                    className="callout marg-0 pull-r"
                    onClick={() => {
                        dispatch(addTitle({}));
                    }}
                ><span role="img" aria-label="plus">➕</span> Title</button>
            </h2>
        </div>
        <div className="title-row">
            {
                titles.map(y => <TitleEdit key={y.key} title={y} onEdit={(t) => {
                    dispatch(editTitle({newT: t}))
                }}></TitleEdit>)
            }
            {
                titles.length === 0 ? <div>
                    <p>
                    <i>No Titles</i>
                    </p>
                    <p>
                        Titles are cosmetic items and privileges that can be awarded to subjects.
                    </p>
                </div> : null
            }
        </div>
      </div>
}


export const TitleEdit: React.FC<{
    title: ITitle,
    onEdit: (newT: ITitle) => void
}> = (props) => {
    return <div className="title-box">
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
                    <option value='👑'><span role="img" aria-label="crown">👑</span></option>
                    <option value='👒'><span role="img" aria-label="hat">👒</span></option>
                    <option value='🎩'><span role="img" aria-label="hat">🎩</span></option>
                    <option value='🎓'><span role="img" aria-label="hat">🎓</span></option>
                    <option value='🧢'><span role="img" aria-label="hat">🧢</span></option>
                </select>
            </label>
            <label>
                &nbsp;Badge:&nbsp;
                <select value={props.title.badge} onChange={(e) => props.onEdit({
                    ...props.title,
                    badge: e.target.value as TitleBadge
                })}>
                    <option value={undefined}>None</option>
                    <option value='⭐'><span role="img" aria-label="badge">⭐</span></option>
                    <option value='🛡️'><span role="img" aria-label="badge">🛡️</span></option>
                    <option value='⚖️'><span role="img" aria-label="badge">⚖️</span></option>
                    <option value='📋'><span role="img" aria-label="badge">📋</span></option>
                    <option value='🏅'><span role="img" aria-label="badge">🏅</span></option>
                    <option value='🎀'><span role="img" aria-label="badge">🎀</span></option>
                    <option value='🌸'><span role="img" aria-label="badge">🌸</span></option>
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
            props.title.privileges.map((p,i) => <div key={p}>
                <select key={i} value={p} onChange={(ev) => {
                    const newArray = props.title.privileges.slice();
                    if (ev.target.value === 'None'){
                        newArray.splice(i, 1);
                    } else {
                        newArray.splice(i, 1, ev.target.value as TitlePrivilege);
                    }
                    props.onEdit({...props.title, privileges: newArray})
                }}>
                    <option value={undefined}>None</option>
                    <option value={'social_deference'}>Social Deference</option>
                    <option value={'criminal_immunity'}>Criminal Immunity</option>
                    <option value={'tax_exemption'}>Tax Exemption</option>
                    <option value={'hereditary'}>Hereditary</option>
                    <option value={'gentility'}>Gentility</option>
                </select>
                {
                    (p != null && PrivilegeData[p]) ? <div>{PrivilegeData[p].description}</div> : null
                }
            </div>)
        }
    </div>
}