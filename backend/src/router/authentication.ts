import express from 'express';

import { register, login } from '../controllers/authentication';

export default (router: express.Router) => {
    router.post('/api/auth/register', register);
    router.post('/api/auth/login', login);
};