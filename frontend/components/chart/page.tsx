import React, { useEffect, useState } from 'react'
import { Chart, Line } from 'react-chartjs-2';

const GRAPHIC_VIEWER = (props: any, children: any) => {
    const [tableData, setTableData] = useState(null)
    var ctx = document.getElementById('mainChart')

    const getMetrics = async () => {
        try {
            let response = await fetch('')
            if (!response.ok) {
                throw new Error("Failed to fetch metrics")
            }
        }
        let data = await response
    }
    useEffect(() => {
        console.log(props.metrics)
    }, [props.metrics])

    var config = {
        type: 'line',
        data: tableData,
        options: {
            resposive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Métricas'
                }
            }
        }
    }
    var myChart = new Chart(ctx, config)

    return (
        <div className='relative'>
            <canvas id='mainChart'></canvas>
        </div>
    )
}

export default GRAPHIC_VIEWER