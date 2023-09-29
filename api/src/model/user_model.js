import db from './model'

class UserRepository {
    constructor (db) {
        this.db = db;
    }

    getByUsername(username) {
        return this.db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
    }
}

module.exports = UserRepository;