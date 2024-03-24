"use client";
import React from 'react'
import { useState, useEffect, useRef } from 'react';
import DATE_CONTROL from '../date_selector/page';

const CONFORT_VIEW = (props: any) => {
    var startid = `START_DATE`;
    var endid = `END_DATE`;
    const [date, setDate] = useState({ [startid]: null, [endid]: null })
    var [selectedParam, setSelectedParam] = useState(null)
    const params = ['Temperatura', 'Temperatura de globo', 'Pressão atmosférica', 'Umidade', 'Velocidade do vento']
    function fromContextSetDates(id: string, selector_date: any) {
        if (id == startid) {
            setDate({ ...date, [startid]: selector_date })
        }
        else {
            setDate({ ...date, [endid]: selector_date })
        }
    }
    useEffect(() => {
        console.log(date)
    }, [date])
    return (
        <div className='relative flex flex-col'>
            <DATE_CONTROL getState={fromContextSetDates} startid={startid} endid={endid}></DATE_CONTROL>

            <div className='text-center'>
                HELO
            </div>
            <div className='flex flex-col text-center md:flex-row  justify-center space-x-10'>
                {
                    params.map((value, index) => <button className='border-2 border-black' key={index} onClick={() => { }}>{value}</button>)
                }
            </div>

        </div>
    )
}

export default CONFORT_VIEW