"use client";
import React from 'react'
import { useState, useEffect, useRef } from 'react';
import DATE_CONTROL from '../date_selector/page';

const CONFORT_VIEW = (props: any) => {
    var startid = `START_DATE`;
    var endid = `END_DATE`;
    const [date, setDate] = useState({ [startid]: null, [endid]: null })
    const [clickedButtons, setClickedButtons] = useState([]);
    const params = ['Temperatura', 'Temperatura de globo', 'Pressão atmosférica', 'Umidade', 'Velocidade do vento']
    function fromContextSetDates(id: string, selector_date: any) {
        if (id == startid) {
            setDate({ ...date, [startid]: selector_date })
        }
        else {
            setDate({ ...date, [endid]: selector_date })
        }
    }
    const handleClick = (option: never) => {
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
    }, [date, clickedButtons])
    return (
        <div className='relative flex flex-col'>
            <DATE_CONTROL getState={fromContextSetDates} startid={startid} endid={endid}></DATE_CONTROL>

            <div className='text-center'>
                HELO
            </div>
            <div className='flex flex-col text-center md:flex-row  justify-center space-x-10'>
                {
                    params.map((value, index) => <button className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center' key={index} onClick={() => { handleClick(value) }}>{value}</button>)
                }
            </div>

        </div>
    )
}

export default CONFORT_VIEW