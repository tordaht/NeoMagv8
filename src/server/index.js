#!/usr/bin/env node
/**
 * @file index.js
 * @description
 * Boots the background simulation service and handles graceful shutdown.
 */

import http from 'http';
import express from 'express';
import simulationEvents, { startBackgroundSimulation } from './simulationService.js';

const app = express();
const server = http.createServer(app);

// Start the simulation in the background
startBackgroundSimulation();
simulationEvents.on('tick', state => console.log('tick', state.population.length));
simulationEvents.on('dialogue', d => console.log('dialogue', d));

// Optional: expose a health endpoint
app.get('/health', (req, res) => res.send({ status: 'running' }));

// Start HTTP server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Background simulation service listening on port ${PORT}`);
});

// Handle graceful shutdown
function shutdown() {
  console.log('Shutting down simulation service...');
  simulationEvents.emit('stop');
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
