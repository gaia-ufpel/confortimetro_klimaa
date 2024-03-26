import React, { useState } from 'react'

const DATE_PATCHER = (props: any) => {
    const [toggleWarningPeriod, setToggleWarningPeriod] = useState(false)
    const [period, setPeriod] = useState({ start_datetime: null, end_datetime: null })
    const evaluatePeriod = (start_datetime: string, end_datetime: string) => {
        let currentDate = new Date(getTodayDateFormat())
        if (!start_datetime || !end_datetime) {
            if (!end_datetime) {
                return console.log("sim")
            }
        }
        if (start_datetime == null) {
            return setToggleWarningPeriod(true)
        }
        let start = new Date(start_datetime)
        let end = new Date(end_datetime)
        if (start.getTime() <= end.getTime() && end.getTime() <= currentDate.getTime()) {
            setToggleWarningPeriod(false)
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
        <div>
            <button onClick={() => evaluatePeriod(props.start_datetime, props.end_datetime)}>Monitorar</button>
            {toggleWarningPeriod && <p className='absolute float-end text-red-800 font-bold px-4 py-2 rounded-md'>Invalid period, select again:</p>}
        </div>
    )
}

export default DATE_PATCHER