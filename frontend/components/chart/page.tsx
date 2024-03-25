import React, { useEffect, useState } from 'react'
import { Chart, Line } from 'react-chartjs-2';

const GRAPHIC_VIEWER = (props: any, children: any) => {
    const [tableData, setTableData] = useState(null)
    const [toggleWarningPeriod, setToggleWarningPeriod] = useState(false)

    const evaluatePeriod = (start_datetime: string, end_datetime: string) => {
        let currentDate = new Date(getTodayDateFormat())
        let start = new Date(start_datetime)
        let end = new Date(end_datetime)
        console.log(start.getTime() > currentDate.getTime())
        if (true) {
            setToggleWarningPeriod(true)
        }
        else { setToggleWarningPeriod(false) }
    }

    const getTodayDateFormat = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm:any = today.getMonth() + 1;
        let dd:any = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        const formattedToday = yyyy + '-' + mm + '-' + dd;
        return formattedToday
    }

    useEffect(() => {
        evaluatePeriod(props.start_datetime, props.end_datetime)
    }, [props.start_datetime, props.end_datetime])
    var config

    return (
        <div className='relative'>
            {toggleWarningPeriod && <p className='absolute float-end text-red-800 font-bold px-4 py-2 rounded-md'>Please select a valid period:</p>}
        </div>
    )
}

export default GRAPHIC_VIEWER