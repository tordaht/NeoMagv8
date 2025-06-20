#!/usr/bin/env node
/**
 * @file index.js
 * @description Boots the background simulation service with graceful shutdown.
 */

import http from 'http';
import express from 'express';
import simulationEvents, { startBackgroundSimulation } from './simulationService.js';
import apiRouter from './api.js';
import { attachWebsocket } from './websocket.js';

const app = express();
const server = http.createServer(app);
attachWebsocket(server);

// Start simulation
startBackgroundSimulation();

// Optional: expose a health endpoint
app.use('/api', apiRouter);
app.get('/health', (req, res) => res.json({ status: 'running' }));

// Start HTTP server
const PORT = process.env.PORT || 4000;
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
