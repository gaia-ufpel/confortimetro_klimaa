"use client";
import React, { useState, useEffect } from 'react'
import Loading_animation from '@/components/loading_animation';

interface Device {

}

export default function DEVICES() {
    const [devices, setDevices] = useState<Device[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const getDevices = async () => {
        var serialnumber;
        var campus;
        var building;
        var room;
        const devicesurl = '/api/v1/devices';
    }
    return (
        <div className='relative flex justify-center min-h-screen items-center'>
            <button className='absolute top-0 right-0 m-10' onClick={getDevices}>
                <p className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">SEARCH DEVICES</p>
            </button>
            {isLoading && <Loading_animation />}
            <div className='flex md:flex-col'>
                {
                    devices.map((value, index) => <button className='' key={index}>{`${value}`}</button>) && <div className='font-sans text-lg'>NO DEVICES FOUND, PLEASE TRY AGAIN</div>
                }
            </div>
        </div>
    )
}
