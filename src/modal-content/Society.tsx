import React, { useState } from "react";
import { ITitle } from "../simulation/Titles";

export const SocietyPanel: React.FC<{

}> = (props) => {
    const [newTitle, setTitle] = useState<ITitle>({key:0,name:'',privileges:[]})
    return <div className="pad-4p">
        {/* <div className="subheader">
            <h3>Other</h3>
        </div>
        <div>

        </div> */}
        <div className="subheader">
            <h2>Titles</h2>
        </div>
        <div>
            <TitleEdit title={newTitle} onEdit={setTitle}></TitleEdit>
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
                <select>
                    <option>None</option>
                    <option>👑</option>
                    <option>👒</option>
                    <option>🎩</option>
                    <option>🎓</option>
                    <option>🧢</option>
                </select>
            </label>
            <label>
                &nbsp;Badge:&nbsp;
                <select>
                    <option>None</option>
                    <option>⭐</option>
                    <option>🛡️</option>
                    <option>⚖️</option>
                    <option>📋</option>
                    <option>🏅</option>
                    <option>🎀</option>
                    <option>🌸</option>
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
            props.title.privileges.map(p => <div>
                <select value={p}>
                    <option value={undefined}>None</option>
                    <option value={'tax_exemption'}>Social Deference</option>
                    <option value={'tax_exemption'}>Criminal Immunity</option>
                    <option value={'tax_exemption'}>Tax Exemption</option>
                </select>
            </div>)
        }
    </div>
}