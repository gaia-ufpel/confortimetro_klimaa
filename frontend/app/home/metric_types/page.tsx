"use client";
import React, { useState, useEffect, useRef } from 'react';
import Loading_animation from '../../loading_animation';

interface Metric {
    name: string;
    description: string;
}

const fetchMetricTypes = async () => {
    var data;
    const metricTypesUrl = '/api/v1/metric_types';
    try {
        data = await fetch(`${metricTypesUrl}`, { method: 'GET' })
        const metricTypesData = (await data.json())
        console.log(metricTypesData)
    } catch (e: any) {
        console.log(e)
    }
}


const METRIC_TYPES = () => {
    useEffect(() => {
        fetchMetricTypes()
    }, [])
    const [metricTypes, setMetricTypes] = useState<Metric[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    return (
        <div className='flex min-h-screen min-w-screen justify-center items-center font-montserrat'>
            {isLoading && <Loading_animation />}
            {error && <div>Error loading data</div>}
            {metricTypes.length == 0 ? <div>No metrics to show</div> :
                <div className="relative overflow-x-auto rounded">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Metric
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                metricTypes.map((metricType: any) => {
                                    return (
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {metricType.name}
                                            </th>
                                            <td className="px-6 py-4">
                                                {metricType.description}
                                            </td>
                                        </tr>
                                    )
                                })
                            }

                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}

export default METRIC_TYPES