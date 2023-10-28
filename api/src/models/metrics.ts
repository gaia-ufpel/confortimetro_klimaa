import { db } from './index';

export const getMetricsByDatalogger = (serial_number: string) => {
    return db.any('SELECT * FROM metrics WHERE device_serial_number = $1', serial_number);
};
export const getMetricsByInterval = (time_start: string, time_end: string) => {
    return db.any('SELECT * FROM metrics WHERE date_metric BETWEEN $1 AND $2', [time_start, time_end]);
};
export const getMetricsByDataloggerAndInterval = (serial_number: string, time_start: string, time_end: string) => {
    return db.any('SELECT * FROM metrics WHERE device_serial_number = $1 AND date_metric BETWEEN $2 AND $3', [serial_number, time_start, time_end]);
};