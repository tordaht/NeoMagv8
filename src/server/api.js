import { Router } from 'express';
import { manager } from './simulationService.js';
import { getLogs } from './logger.js';

/** Express router exposing simulation API */
const router = Router();

let cachedState = null;
let cachedAt = 0;

/**
 * GET /state - returns simulation state. Result is cached for a short duration
 * to avoid expensive state assembly when called repeatedly.
 */
router.get('/state', (req, res) => {
  const now = Date.now();
  if (!cachedState || now - cachedAt > 100) {
    cachedState = manager.getState();
    cachedAt = now;
  }
  res.json(cachedState);
});

/**
 * GET /logs - return parsed experiment logs
 */
router.get('/logs', async (req, res) => {
  const logs = await getLogs();
  res.json(logs);
});

export default router;
