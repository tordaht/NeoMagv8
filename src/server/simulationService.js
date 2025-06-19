/**
 * @module simulationService
 * @description
 * Runs the bacterial simulation in the background at 60 FPS and emits autonomous dialogues.
 */

import { EventEmitter } from 'events';
import SimulationManager from '../engine/SimulationManager.js';

const simulationEvents = new EventEmitter();

/**
 * Starts the background simulation loop and autonomous dialogues.
 * @returns {EventEmitter} An EventEmitter that emits 'tick' and 'dialogue' events.
 */
export function startBackgroundSimulation() {
  const manager = new SimulationManager();

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
  });

  return simulationEvents;
}

export default simulationEvents;
