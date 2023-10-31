import { db } from './index';

export const getUsers = () => {
    return db.any('SELECT * FROM users');
};
export const getUsersEmail = () => {
    return db.any('SELECT email FROM users');
};
export const getUserByEmail = (email: string) => {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
};
export const getUserByToken = (token: string) => {
    return db.oneOrNone('SELECT * FROM users WHERE token = $1', token);
};
export const updateUserToken = (email: string, token: string) => {
    return db.none('UPDATE users SET token = $1 WHERE email = $2', [token, email]);
};
export const updateUserTokenExpiration = (email: string, token_expiration: string) => {
    return db.none('UPDATE users SET token_expiration = $1 WHERE email = $2', [token_expiration, email]);
};
export const insertUser = (email: string, password: string) => {
    return db.none('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);
};