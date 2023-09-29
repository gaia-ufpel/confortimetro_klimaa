import db from './model.js'

class SessionRepository {
    constructor(db) {
        this.db = db;
    }

    getById(session_id) {
        return this.db.oneOrNone('SELECT * FROM klimaa.sessions WHERE session_id = $1', session_id);
    }
}

module.exports = SessionRepository;