import { Router } from 'express';
import simulationEvents from './simulationService.js';
import { getAllLogs } from './logger.js';

/**
 * Express router exposing simulation state and analytics logs.
 * `/state` responses are cached briefly for performance.
 * @module api
 */
const router = Router();

let cachedState = null;
let cachedAt = 0;

/**
 * GET /state - Retrieve the latest simulation state.
 * Emits a `requestState` event and waits for the corresponding `state` event.
 * Results are cached for 100ms to avoid unnecessary work.
 */
router.get('/state', async (req, res, next) => {
  try {
    const now = Date.now();
    if (cachedState && now - cachedAt < 100) {
      return res.json(cachedState);
    }

    const state = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        simulationEvents.off('state', onState);
        reject(new Error('Timeout retrieving state'));
      }, 2000);

      function onState(s) {
        clearTimeout(timer);
        resolve(s);
      }

      simulationEvents.once('state', onState);
      simulationEvents.emit('requestState');
    });

    cachedState = state;
    cachedAt = now;
    res.json(state);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /logs - Retrieve all experiment logs.
 */
router.get('/logs', async (req, res, next) => {
  try {
    const logs = await getAllLogs();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
