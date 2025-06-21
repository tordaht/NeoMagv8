#!/usr/bin/env node
/**
 * @file index.js
 * @description Express server that runs the background simulation and exposes a
 * simple health endpoint. Handles graceful shutdown on termination signals.
 */

import express from 'express';
import simulationEvents, { startBackgroundSimulation } from './simulationService.js';

const app = express();
app.get('/health', (req, res) => res.json({ status: 'running' }));

startBackgroundSimulation();

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Simulation service listening on port ${PORT}`);
});

// Handle graceful shutdown
function shutdown() {
  console.log('Shutting down simulation service...');
  simulationEvents.emit('stop');
  server.close(() => {
    console.log('HTTP server closed. Exiting.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
