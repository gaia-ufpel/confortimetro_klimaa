import { db } from './index';

export const getDevices = () => {
    return db.any('SELECT * FROM devices');
}
export const getDevicesBySerialNumber = (serial_number: string) => {
    return db.any('SELECT * FROM devices WHERE serial_number = $1', serial_number);
}
export const getDeviceByCampus = (campus: string) => {
    return db.any('SELECT * FROM devices WHERE campus = $1', campus);
}
export const getDeviceByCampusAndBuilding = (campus: string, building: string) => {
    return db.any('SELECT * FROM devices WHERE campus = $1 AND building = $2', [campus, building]);
}
export const getDeviceByCampusAndBuildingAndRoom = (campus: string, building: string, room: string) => {
    return db.any('SELECT * FROM devices WHERE campus = $1 AND building = $2 AND room = $3', [campus, building, room]);
}