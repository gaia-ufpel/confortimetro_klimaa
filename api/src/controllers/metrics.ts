import express from 'express';

import { getMetricsByDevice, getMetricsByInterval, getMetricsByDeviceAndInterval } from '../models/metrics'; 

export const getMetrics = async (req: express.Request, res: express.Response) => {
    try {
        const { serial_number, time_start, time_end } = req.query;

        // verifica se o serial_number foi enviado
        if (!serial_number) {
            return res.sendStatus(400);
        }

        // verifica se o time_start e o time_end foram enviados
        if (!time_start || !time_end) {
            const metrics = await getMetricsByDevice(serial_number as string);

            return res.status(200).json(metrics);
        }

        const metrics = await getMetricsByDeviceAndInterval(serial_number as string, time_start as string, time_end as string);

        return res.status(200).json(metrics);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};
