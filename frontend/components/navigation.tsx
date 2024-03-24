"use client";
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Date_selector from './date_selector';
import CONFORT_VIEW from './confort_viewer';

const QUERY_PARAMS_PAGE = () => {
  var startid = `START_DATE`;
  var endid = `END_DATE`;
  const [date, setDate] = useState({ [startid]: null, [endid]: null })
  var isValidPeriod = false

  useEffect(() => {
    if (date[startid] && date[endid]) {
      isValidPeriod = true;
      console.log("YEAH")
    }
  }, [date])

  function passContextDates(id: string, selector_date: any) {
    if (id == startid){
      setDate({...date, [startid]:selector_date})
    }
    else {
      setDate({...date, [endid]:selector_date})
    }
  }

  return (
    <div className='absolute flex flex-col min-h-screen justify-center p-10 space-y-10 font-sans'>
      <span>
        <b>Selecione período:</b>
      </span>
      <div className='relative grid w-min-[1/4] gap-y-10 font-sans'>
        <Date_selector id={startid} text="Data de início:" handleCallback={passContextDates} />
        <Date_selector id={endid} text="Data de fim:" handleCallback={passContextDates} />
      </div>

      <CONFORT_VIEW data={date} />
    </div>
  )
}

export default QUERY_PARAMS_PAGE