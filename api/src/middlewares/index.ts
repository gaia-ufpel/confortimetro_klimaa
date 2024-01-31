import express from 'express';
import { merge, get } from 'lodash';

import { getUserByToken } from 'models/users';

export const is_authenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        //const token = req.cookies["TOKEN"];
        const token = req.headers.authorization;

        if (!token) {
            return res.sendStatus(403);
        }

        const user = await getUserByToken(token);

        if (!user) {
            return res.sendStatus(403);
        }

        merge(req, { identity: user });

        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};