import React, { useEffect, useState, useRef } from 'react'
import { LineChart, Line, CartesianGrid, YAxis, XAxis, Tooltip, Legend } from 'recharts';

interface Metrics {

}

const GRAPHIC_VIEWER = (props: any) => {
    const [tableData, setTableData] = useState<any>();
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const params = ['Temperatura', 'Temperatura de globo', 'Umidade', 'Velocidade do vento']
    const [clickedButtons, setClickedButtons] = useState(params);

    const abortControllerRef = useRef<AbortController | null>(null);
    const signal = abortControllerRef.current?.signal;
    let metricsURL = '/api/v1/metrics';
    const data = [
        { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
        { name: 'Fev', uv: 3000, pv: 1398, amt: 2210 },
        { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    ];

    const getMetrics = async () => {
        var data;
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        try {
            data = await fetch(`${metricsURL}`, { method: 'GET', signal: abortControllerRef.current?.signal })
            const deviceData = (await data.json()) as Metrics[]
            setTableData(deviceData)
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
    useEffect(() => {
        if (props.signalToMetrics == true) {
            getMetrics()
            props.setSignalToMetrics(false)
        }
    }, [props.signalToMetrics])

    function setGraphics() {
    }

    function MetricsAdapter() {
        
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
        <div className='relative flex flex-col'>
            {isLoading &&
                <div className="absolute flex justify-center items-center m-10">
                    <div className="absolute text-2xl font-bold text-purple-500">Loading...</div>
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            }
            
            <div className='flex justify-center items-center m-10'>
                <LineChart
                    width={screen.width * 0.7}
                    height={screen.height * 0.7}
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid stroke='#ccc' strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>

            </div>

            <div className='flex flex-col md:flex-row text-center justify-center space-x-10'>
                {
                    params.map((value, index) => <button className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded' key={index} onClick={() => { handleClick(value) }}>{value}</button>)
                }
            </div>
        </div>
    )
}

export default GRAPHIC_VIEWER