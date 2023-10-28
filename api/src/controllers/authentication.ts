import express from 'express';
import bcrypt from 'bcrypt';

import { random } from '../helpers';
import { getUserByEmail } from 'models/users';

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        // verifica se o email e a senha foram enviados
        if (!email || !password) {
            return res.sendStatus(400);
        }

        const user = await getUserByEmail(email);

        // verifica se o usuário existe
        if (!user) {
            return res.sendStatus(400);
        }

        // verifica se os hash são iguais
        let result = bcrypt.compareSync(password, user.password);

        if (!result) {
            return res.sendStatus(403);
        }

        const session_token = random();

        res.cookie('TOKEN', user.token, {
            expires: new Date(Date.now() + 12 * 3600000),
            httpOnly: true,
            secure: false
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        // sendStatus define o status e já manda para o cliente
        return res.sendStatus(400);
    }
};

export const register = async (req: express.Request, res: express.Response) => {

};