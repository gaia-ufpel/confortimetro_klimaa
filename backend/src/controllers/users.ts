import express from 'express';
import bcrypt from 'bcrypt';

import { getUsers, getUsersEmail, getUserByEmail, insertUser } from '../models/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsersEmail();

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};