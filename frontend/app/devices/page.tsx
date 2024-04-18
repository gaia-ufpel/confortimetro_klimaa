"use client";
import React, { useState, useEffect, useRef } from 'react'
import Loading_animation from '@/components/loading_animation';

interface Device {

}

export default function DEVICES() {
    const [devices, setDevices] = useState<Device[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const signal = abortControllerRef.current?.signal;


    const getDevices = async () => {
        var serialnumber;
        var campus;
        var building;
        var room;
        const devicesurl = '/api/v1/devices';
        var data;
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        try {
            data = await fetch(`${devicesurl}`, { method: 'GET', signal: abortControllerRef.current?.signal })
            const deviceData = (await data.json()) as Device[]
            setDevices(deviceData)
            setIsLoading(false);
        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            setError(e)
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className='relative flex justify-center min-h-screen items-center'>

            <button className='absolute top-0 right-0 m-10' onClick={getDevices}>
                <p className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">SEARCH DEVICES</p>
            </button>
            {isLoading && <Loading_animation />}
            <div className='flex md:flex-col'>
                {
                    devices.length > 0 ? devices.map((value, index) => <button className='bg-white text-black border border-gray-300 rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-gray-300 focus:outline-none focus:shadow-outline' key={index}>{value}</button>)
                        : <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role='alert'>No devices found</div>
                }
            </div>
        </div>
    )
}
