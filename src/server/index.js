/**
 * Entry point of the server side architecture. The HTTP API exposes the current
 * state of the simulation while a websocket broadcasts bacteria-to-bacteria
 * communication. A lightweight simulation service continuously mutates the
 * environment in the background.
 */
import express from 'express';
import http from 'http';
import api from './api.js';
import { setupWebsocket } from './websocket.js';
import { manager } from './simulationService.js';

const app = express();
app.use(express.json());
app.use('/', api);

const server = http.createServer(app);
setupWebsocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function shutdown() {
  console.log('Shutting down...');
  manager.stop();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
