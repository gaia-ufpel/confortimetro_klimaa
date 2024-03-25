import React, { useState } from 'react'
import Date_selector from './date_selector'

const DATE_CONTROL = (props: any) => {
    return (
        <div className='absolute flex flex-col min-h-screen justify-center p-10 space-y-10 font-sans'>
            <span>
                <b>Selecione período:</b>
            </span>
            <div className='relative grid w-min-[1/4] gap-y-10 font-sans'>
                <Date_selector id={props.startid} text="Data de início:" handleCallback={props.getState} />
                <Date_selector id={props.endid} text="Data de fim:" handleCallback={props.getState} />
            </div>
        </div>
    )
}

export default DATE_CONTROL