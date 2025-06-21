/**
 * @module simulationService
 * @description
 * Provides a small event-based API that runs the server-side simulation in the
 * background. The service ticks the {@link SimulationManager} 60 times per
 * second and triggers autonomous dialogues between random bacteria every four
 * seconds. Consumers can listen to `tick` and `dialogue` events to react to
 * state changes.
 */

import { EventEmitter } from 'events';
import SimulationManager from '../engine/SimulationManager.js';

/**
 * Event emitter used to broadcast simulation updates.
 *
 * @type {EventEmitter}
 */
const simulationEvents = new EventEmitter();

// local reference to the simulation manager instance
let manager = null;

/**
 * Start the background simulation loop and dialogue cycle.
 *
 * The function creates a {@link SimulationManager} instance, schedules a tick
 * loop running at 60 FPS and a dialogue loop every four seconds. Each tick
 * emits the current simulation state via the `tick` event. Dialogues emit a
 * `dialogue` event describing the interaction. A `stop` event listener is
 * attached so callers can gracefully terminate the service.
 *
 * @returns {EventEmitter} emitter broadcasting simulation events
 */
export function startBackgroundSimulation() {
  manager = new SimulationManager();

  // Provide current state on demand
  simulationEvents.on('requestState', () => {
    if (manager) {
      simulationEvents.emit('state', manager.getState());
    }
  });

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
