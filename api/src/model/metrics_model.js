import db from './model';

class MetricsRepository {
    constructor (db) {
        this.db = db;
    }

    getMetricsByDatalogger (datalogger_id) {
        return this.db.any('SELECT * FROM metrics WHERE datalogger_id = $1', datalogger_id);
    }

    getMetricsByInterval (time_start, time_end) {
        return this.db.any('SELECT * FROM metrics WHERE date_metric BETWEEN $1 AND $2', [time_start, time_end]);
    }

    getMetricsByDataloggerAndInterval (datalogger_id, time_start, time_end) {
        return this.db.any('SELECT * FROM metrics WHERE datalogger_id = $1 AND date_metric BETWEEN $2 AND $3', [datalogger_id, time_start, time_end]);
    }
}

module.exports = MetricsRepository;