import { EventEmitter } from 'node:events';
import { SimulationManager } from '../engine/SimulationManager.js';

/**
 * Node.js background simulation service.
 * Running the simulation on the server ensures expensive ticks do not block
 * the browser event loop while still allowing real-time updates through the
 * {@link simulationEvents} emitter.
 * @module simulationService
 */
export const simulationEvents = new EventEmitter();

/** @type {SimulationManager} */
export let manager;
let tickInterval;
let talkInterval;

/**
 * Start the continuous background simulation.
 * @returns {Promise<void>}
 */
export async function startBackground() {
  manager = new SimulationManager();
  tickInterval = setInterval(() => manager.tick(), 1000 / 60);
  talkInterval = setInterval(() => {
    const pair = manager.pickRandomPair();
    if (pair.length === 2) {
      const [a, b] = pair;
      const msg = manager.talk(a, b);
      manager.receive(b, msg, a);
      simulationEvents.emit('newMessage', { from: a.id, to: b.id, text: msg });
    }
  }, 4000);
}

/** Stop the simulation loops */
export function stopBackground() {
  clearInterval(tickInterval);
  clearInterval(talkInterval);
}

/**
 * Example usage:
 * @example
 * import { startBackground } from './simulationService.js';
 * startBackground();
 */

