import React, { useEffect, useState } from 'react'

interface Metrics {

}

const GRAPHIC_VIEWER = (props: any) => {
    const [tableData, setTableData] = useState<any>()
    const params = ['Temperatura', 'Temperatura de globo', 'Umidade', 'Velocidade do vento']
    const [clickedButtons, setClickedButtons] = useState(params);
    let metricsURL = '/api/v1/metrics';

    const getMetrics = async () => {
        var data;
        try {
            data = await fetch(`${metricsURL}`, { method: 'GET' })
            const deviceData = await data.json() as Metrics
            setTableData(deviceData)
        } catch (e) {
            console.log("error")
        } finally {

        }
    }
    useEffect(() => {
        if (props.signalToMetrics == true) {
            getMetrics()
            props.setSignalToMetrics(false)
        }
    }, [props.signalToMetrics])

    function setGraphics() {
    }

    const handleClick = (option: any) => {
        const index = clickedButtons.indexOf(option);
        if (index === -1) {
            setClickedButtons([...clickedButtons, option]);
        } else {
            const newButtons = [...clickedButtons];
            newButtons.splice(index, 1);
            setClickedButtons(newButtons);
        }
    };

    return (
        <div className='relative text-center'>
            <canvas id='mainChart'></canvas>

            <div className='flex flex-col md:flex-row text-center justify-center space-x-10'>
                {
                    params.map((value, index) => <button className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded' key={index} onClick={() => { handleClick(value) }}>{value}</button>)
                }
            </div>
        </div>
    )
}

export default GRAPHIC_VIEWER