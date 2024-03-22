import React from 'react'
import { useState, useEffect } from 'react'

const Date_selector = (props: any) => {
    var [date, setDate] = useState(null);
    useEffect(() => {
        if(date){
            props.handleCallback({id:`${props.id}`,date:date})
        }
    }, [date])
    return (
        <div className='grid'>
            <label htmlFor={`${props.id}`}>{`${props.text}`}</label>
            <input id={`${props.id}`} type="date" onChange={(ev: any) => { setDate(ev?.target.value); }} />
        </div>
    )
}

export default Date_selector