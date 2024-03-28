import React, { useEffect, useState } from 'react'
import { Chart, Line } from 'react-chartjs-2';

const GRAPHIC_VIEWER = (props: any, children: any) => {
    const [tableData, setTableData] = useState(null)
    var ctx = document.getElementById('mainChart')
    let api = '/api/v1/metrics';
    const getMetrics = async () => {
        
    }
    useEffect(() => {
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
    //var myChart = new Chart(ctx, config)

    return (
        <div className='relative'>
            <canvas id='mainChart'></canvas>
        </div>
    )
}

export default GRAPHIC_VIEWER