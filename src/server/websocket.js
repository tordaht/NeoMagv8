import { Server } from 'socket.io';
import { simulationEvents } from './simulationService.js';

/**
 * Attach socket.io to the provided HTTP server and broadcast bacteria messages
 * emitted by the simulation service.
 * @param {import('http').Server} httpServer
 */
export function setupWebsocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } });
  simulationEvents.on('newMessage', msg => {
    io.emit('bacteriaMessage', msg);
  });
  return io;
}
