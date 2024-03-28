import React, { useState } from 'react'

const DATE_PATCHER = (props: any) => {
    const [toggleWarningPeriod, setToggleWarningPeriod] = useState(false)
    const [period, setPeriod] = useState({ start_datetime: null, end_datetime: null })
    const evaluatePeriod = (start_datetime: string, end_datetime: string) => {
        let currentDate = new Date(getTodayDateFormat())
        let start = new Date(start_datetime)
        let end = new Date(end_datetime)
        if (start_datetime == null  || end_datetime == null) {
            return setToggleWarningPeriod(true)
        }
        if (start.getTime() > currentDate.getTime() || end.getTime() > currentDate.getTime()) {
            return setToggleWarningPeriod(true)
        }
        if (start.getTime() <= end.getTime()) {
            return setToggleWarningPeriod(false)
        } else {
            return setToggleWarningPeriod(true)
        }

    }
    const getTodayDateFormat = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm: any = today.getMonth() + 1;
        let dd: any = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        const formattedToday = yyyy + '-' + mm + '-' + dd;
        return formattedToday
    }

    return (
        <div className='relative flex flex-col items-center text-center'>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" onClick={() => evaluatePeriod(props.start_datetime, props.end_datetime)}>Monitorar</button>
            {toggleWarningPeriod && <p className='absolute translate-y-10 float-end text-red-500 font-bold px-4 py-2 rounded-md animate-pulse'>Invalid period</p>}
        </div>
    )
}

export default DATE_PATCHER