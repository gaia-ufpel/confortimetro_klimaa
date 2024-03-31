"use client";
import React from 'react'
import { useState, useEffect, useContext, createContext } from 'react';
import DATE_CONTROL from '../date_selector/page';
import GRAPHIC_VIEWER from '../chart/page';


const CONFORT_VIEW = (props: any) => {
    const [date, setDate] = useState({ 'start_datetime': null, 'end_datetime': null, 'valid': false })
    const [signalToMetrics, setSignalToMetrics] = useState(false)
    const params = ['Temperatura', 'Temperatura de globo', 'Pressão atmosférica', 'Umidade', 'Velocidade do vento']
    const [clickedButtons, setClickedButtons] = useState(params);

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


    return (
        <div className='relative flex flex-col'>
            <DATE_CONTROL date={date} setDate={setDate} signalToMetrics={signalToMetrics} setSignalToMetrics={setSignalToMetrics} />
            <div className='text-center'>
                <GRAPHIC_VIEWER metrics={clickedButtons} date={date} signalToMetrics={signalToMetrics} setSignalToMetrics={setSignalToMetrics}></GRAPHIC_VIEWER>
            </div>
            <div className='flex flex-col md:flex-row text-center justify-center space-x-10'>
                {
                    params.map((value, index) => <button className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded' key={index} onClick={() => { handleClick(value) }}>{value}</button>)
                }
            </div>
        </div>
    )
}

export default CONFORT_VIEW