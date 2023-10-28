import express from 'express';
import compression from 'compression';
import cors from 'cors';

import router from './router';

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(compression());

app.use('/api', router());

const HOST: string = process.env.API_HOST || 'localhost';
const PORT: number = parseInt(process.env.API_PORT) || 3000;

app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
})