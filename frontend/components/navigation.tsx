"use client";
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Date_selector from './date_selector';
import CONFORT_VIEW from './confort_viewer';

const Navigation = () => {
  const [date, setDate] = useState({inicio: null, fim: null})

    useEffect(() => {
      if (date.inicio && date.fim) {
        console.log("True")
      }
    }, [date])

  function passContextDates(id: string,date: any) {
    return {id:id, date:date}
  }

  return (
    <div className='absolute flex border-2 border-black'>
      <div className='relative grid w-min-[1/4] gap-y-10 p-10 font-sans underline'>
        <Date_selector id="START_DATE" text="Data de início:" handleCallback={passContextDates} />
        <Date_selector id="END_DATE" text="Data de fim:" handleCallback={passContextDates} />
      </div>
      <CONFORT_VIEW data={date}/>
    </div>
  )
}

export default Navigation