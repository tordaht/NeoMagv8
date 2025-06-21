import { Server } from 'socket.io';
import simulationEvents from './simulationService.js';

/**
 * Attach a Socket.IO server to an existing HTTP server and broadcast
 * simulation updates in real time. Clients receive dialogue messages
 * and periodic tick events.
 *
 * @param {import('http').Server} httpServer - Node HTTP server
 * @returns {void}
 */
export function attachWebsocket(httpServer) {
  const io = new Server(httpServer);

  io.on('connection', socket => {
    console.log(`Client connected: ${socket.id}`);
  });

  simulationEvents.on('dialogue', msg => {
    io.emit('bacteriaMessage', msg);
  });

  simulationEvents.on('tick', state => {
    io.emit('simulationTick', state);
  });
}
