import express from 'express';
import simulationEvents from './simulationService.js';
import { getAllLogs } from './logger.js';

/**
 * Express router exposing simulation state and analytics logs via REST.
 * @module api
 */
const router = express.Router();

/**
 * GET /state - Retrieve the latest simulation state.
 * Emits a `requestState` event and waits for the corresponding `state` event.
 */
router.get('/state', async (req, res, next) => {
  try {
    const state = await new Promise((resolve, reject) => {
      /**
       * Handler for the single `state` response.
       * @param {object} s
       */
      const onState = s => resolve(s);

      const timer = setTimeout(() => {
        simulationEvents.off('state', onState);
        reject(new Error('State request timed out'));
      }, 2000);

      simulationEvents.once('state', data => {
        clearTimeout(timer);
        onState(data);
      });

      simulationEvents.emit('requestState');
    });

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
