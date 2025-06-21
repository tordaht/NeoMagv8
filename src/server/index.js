#!/usr/bin/env node
/**
 * @file index.js
 * @description
 * Entry point for the Node.js service hosting the background simulation.
 * Starts an Express HTTP server, exposes a basic health check and runs the
 * simulation loop in the background. The process listens for termination
 * signals in order to stop the simulation and close the server cleanly.
 */

import express from 'express';
import http from 'http';
import simulationEvents, { startBackgroundSimulation } from './simulationService.js';
import apiRouter from './api.js';

const app = express();

// Mount REST API
app.use('/api', apiRouter);
app.get('/health', (req, res) => res.json({ status: 'running' }));

startBackgroundSimulation();

const PORT = 4000;
const server = http.createServer(app);
server.listen(PORT, () => {
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
