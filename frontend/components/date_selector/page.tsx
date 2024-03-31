import React, {useState, useEffect} from 'react'
import Date_selector from './date_selector'

const DATE_CONTROL = (props: any) => {
    const [toggleWarningPeriod, setToggleWarningPeriod] = useState(false)

    useEffect(() => {
        evaluatePeriod(props.date.start_datetime, props.date.end_datetime)
    }, [props.date.start_datetime, props.date.end_datetime])

    const evaluatePeriod = (start_datetime: string, end_datetime: string) => {
        let currentDate = new Date(getTodayDateFormat())
        let start = new Date(start_datetime)
        let end = new Date(end_datetime)
        if (start_datetime == null || end_datetime == null) {
            props.setDate({ ...props.date, 'valid': false })
            return setToggleWarningPeriod(true)
        }
        if (start.getTime() > currentDate.getTime() || end.getTime() > currentDate.getTime()) {
            props.setDate({ ...props.date, 'valid': false })
            return setToggleWarningPeriod(true)
        }
        if (start.getTime() <= end.getTime()) {
            props.setDate({ ...props.date, 'valid': true })
            return setToggleWarningPeriod(false)
        } else {
            props.setDate({ ...props.date, 'valid': false })
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
        <div className='absolute flex flex-col justify-center min-h-screen min-w-[1/4] p-10 space-y-10 font-sans '>
            <span>
                <b>Selecione período:</b>
            </span>
            <div className='relative grid gap-y-10 font-sans'>
                <Date_selector id={'start_datetime'} setDate={props.setDate} text="Data de início:" date={props.date} />
                <Date_selector id={'end_datetime'} setDate={props.setDate} text="Data de fim:" date={props.date} />
            </div>
            <div className='relative flex flex-col items-center text-center'>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" onClick={() => { }}>Monitorar</button>
                {props.date.valid ? '' : <p className='absolute translate-y-10 float-end text-red-500 font-bold px-4 py-2 rounded-md animate-pulse'>Invalid period</p>}
            </div>
        </div>
    )
}

export default DATE_CONTROL