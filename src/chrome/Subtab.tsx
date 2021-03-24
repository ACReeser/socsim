import React from 'react';

export const Subtabs: React.FC<{
    additionalClasses?: string,
    active: string,
    options: {icon: string, value: string, text: string, onClick: () => void}[]    
}> = (props) => {

    return <div className={'horizontal blue-orange cylinder f-size-125em marg-t-20'+(props.additionalClasses||'')}>
        {
            props.options.map((x) => <button type="button" key={x.value} onClick={() => x.onClick()}  className={props.active === x.value ? 'active': ''}>
                {x.icon} {x.text}
            </button>)
        }
    </div>
}