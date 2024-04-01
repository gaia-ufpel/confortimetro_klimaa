"use client";
import React from 'react'
import { useState, useEffect, useContext, createContext } from 'react';
import DATE_CONTROL from '../date_selector/page';
import GRAPHIC_VIEWER from '../chart/page';


const CONFORT_VIEW = (props: any) => {
    const [date, setDate] = useState({ 'start_datetime': null, 'end_datetime': null, 'valid': false })
    const [signalToMetrics, setSignalToMetrics] = useState(false)

    return (
        <div className='relative flex flex-col'>
            <DATE_CONTROL date={date} setDate={setDate} signalToMetrics={signalToMetrics} setSignalToMetrics={setSignalToMetrics} />
            <GRAPHIC_VIEWER date={date} signalToMetrics={signalToMetrics} setSignalToMetrics={setSignalToMetrics}></GRAPHIC_VIEWER>
        </div>
    )
}

export default CONFORT_VIEW