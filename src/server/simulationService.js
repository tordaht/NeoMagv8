/**
 * @module simulationService
 * @description Runs the bacterial simulation continuously at 60 FPS and emits
 * autonomous dialogues. Listens for `requestState` and responds with a `state`
 * event containing the current simulation snapshot.
 */

import { EventEmitter } from 'events';
import SimulationManager from '../engine/SimulationManager.js';

const simulationEvents = new EventEmitter();
let manager = null;

/**
 * Starts the background simulation loop and autonomous dialogues.
 * @returns {EventEmitter} Emits 'tick', 'dialogue' and responds to
 * `requestState` with a `state` event.
*/
export function startBackgroundSimulation() {
  manager = new SimulationManager();

  const handleRequestState = () => {
    simulationEvents.emit('state', manager.getState());
  };
  simulationEvents.on('requestState', handleRequestState);

  // 60 FPS simulation tick loop
  const tickInterval = setInterval(() => {
    manager.tick();
    simulationEvents.emit('tick', manager.getState());
  }, 1000 / 60);

  // Every 4 seconds, have two random bacteria talk
  const dialogueInterval = setInterval(() => {
    const [a, b] = manager.pickRandomPair();
    const msg = manager.talk(a, b);
    manager.receive(b, msg, a);
    simulationEvents.emit('dialogue', { from: a.id, to: b.id, message: msg });
  }, 4000);

  // Provide a stop function for cleanup
  simulationEvents.once('stop', () => {
    clearInterval(tickInterval);
    clearInterval(dialogueInterval);
    simulationEvents.off('requestState', handleRequestState);
  });

  return simulationEvents;
}

export default simulationEvents;
