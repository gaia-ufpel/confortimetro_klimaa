import express from 'express';

import { getDevices, getDeviceByCampus, getDeviceByCampusAndBuilding, getDeviceByCampusAndBuildingAndRoom, getDevicesBySerialNumber } from 'models/devices';

export const getDevice = async (req: express.Request, res: express.Response) => {
    try {
        const { serial_number, campus, building, room } = req.query;

        // verifica se o serial_number foi enviado
        if (!serial_number) {
            // verifica se o campus foi enviado
            if (!campus) {
                const devices = await getDevices();

                return res.status(200).json(devices);
            }

            // verifica se o building foi enviado
            if (!building) {
                const devices = await getDeviceByCampus(campus as string);

                return res.status(200).json(devices);
            }

            // verifica se o room foi enviado
            if (!room) {
                const devices = await getDeviceByCampusAndBuilding(campus as string, building as string);

                return res.status(200).json(devices);
            }

            const devices = await getDeviceByCampusAndBuildingAndRoom(campus as string, building as string, room as string);

            return res.status(200).json(devices);
        }

        const devices = await getDevicesBySerialNumber(serial_number as string);

        return res.status(200).json(devices);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}