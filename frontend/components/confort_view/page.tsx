"use client";
import React from 'react'
import { useState, useEffect, useRef } from 'react';
import DATE_CONTROL from '../date_selector/page';
import GRAPHIC_VIEWER from '../chart/page';
import DATE_PATCHER from '../date_selector/date_patcher';

const CONFORT_VIEW = (props: any) => {
    var startid = `START_DATE`;
    var endid = `END_DATE`;
    const [date, setDate] = useState({ [startid]: null, [endid]: null })
    const params = ['Temperatura', 'Temperatura de globo', 'Pressão atmosférica', 'Umidade', 'Velocidade do vento']
    const [clickedButtons, setClickedButtons] = useState(params);

    function fromContextSetDates(id: string, selector_date: any) {
        if (id == startid) {
            setDate({ ...date, [startid]: selector_date })
        }
        else {
            setDate({ ...date, [endid]: selector_date })
        }
    }

    const handleClick = (option: any) => {
        const index = clickedButtons.indexOf(option);
        if (index === -1) {
            setClickedButtons([...clickedButtons, option]);
        } else {
            const newButtons = [...clickedButtons];
            newButtons.splice(index, 1);
            setClickedButtons(newButtons);
        }
    };


    useEffect(() => {
    }, [])

    return (
        <div className='relative flex flex-col'>
            <DATE_CONTROL getState={fromContextSetDates} startid={startid} endid={endid} >
                <DATE_PATCHER start_datetime={props.start_datetime} end_datetime={props.end_datetime}></DATE_PATCHER>
            </DATE_CONTROL>
            <div className='text-center'>
                <GRAPHIC_VIEWER metrics={clickedButtons} start_datetime={date[startid]} end_datetime={date[endid]}></GRAPHIC_VIEWER>
            </div>
            <div className='flex flex-col text-center md:flex-row justify-center space-x-10'>
                {
                    params.map((value, index) => <button className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded' key={index} onClick={() => { handleClick(value) }}>{value}</button>)
                }
            </div>

        </div>
    )
}

export default CONFORT_VIEW