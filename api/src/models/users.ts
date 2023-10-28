import { db } from './index';

export const getUserByEmail = (email: string) => {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
}
export const setUserToken = (email: string, token: string) => {
    return db.none('UPDATE users SET token = $1 WHERE email = $2', [token, email]);
}
export const setUserTokenExpiration = (email: string, token_expiration: string) => {
    return db.none('UPDATE users SET token_expiration = $1 WHERE email = $2', [token_expiration, email]);
}