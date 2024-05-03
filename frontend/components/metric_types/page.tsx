import React, { useEffect, useState } from 'react'
import Loading_animation from '../loading_animation'

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

useEffect(() => {
    fetchMetricTypes()
}, [])

const METRIC_TYPES = () => {
    const [metricTypes, setMetricTypes] = useState([])
    return (
        <div>

        </div>
    )
}

export default METRIC_TYPES