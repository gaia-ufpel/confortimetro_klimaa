import React, { useState, useEffect } from 'react'

const Date_selector = (props:any) => {
    return (
        <div className='grid'>
            <label htmlFor={`${props.id}`}>{`${props.text}`}</label>
            <input id={`${props.id}`} type="date" onChange={(ev: any) => { props.setDate({...props.date, [props.id]:ev?.target.value}) }} />
        </div>
    )
}

export default Date_selector