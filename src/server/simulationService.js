/**
 * @module simulationService
 * @description Background service that drives the simulation at 60 FPS and
 * periodically triggers bacteria dialogue. Emits `tick` and `dialogue` events
 * that other modules can subscribe to.
 */

import { EventEmitter } from 'events';
import SimulationManager from '../engine/SimulationManager.js';

const simulationEvents = new EventEmitter();
let manager = null;

/**
 * Start the background simulation loop and dialogue cycle.
 * @returns {EventEmitter} Event emitter publishing `tick` and `dialogue` events.
 */
export function startBackgroundSimulation() {
  manager = new SimulationManager();

  // 60 FPS simulation tick loop
  const tickInterval = setInterval(() => {
    manager.tick();
    simulationEvents.emit('tick', manager.getState());
  }, 1000 / 60);

  // Every 4 seconds, have two random bacteria talk
  const dialogueInterval = setInterval(() => {
    const [a, b] = manager.pickRandomPair();
    if (!a || !b) return;
    const msg = manager.talk(a, b);
    manager.receive(b, msg, a);
    simulationEvents.emit('dialogue', { from: a.id, to: b.id, message: msg });
  }, 4000);

  // Provide a stop function for cleanup
  simulationEvents.once('stop', () => {
    clearInterval(tickInterval);
    clearInterval(dialogueInterval);
  });

  return simulationEvents;
}

export default simulationEvents;
