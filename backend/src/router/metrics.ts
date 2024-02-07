import express from 'express';

import { getMetrics } from '../controllers/metrics';

export default (router: express.Router) => {
    router.get('/api/v1/metrics', getMetrics);
};