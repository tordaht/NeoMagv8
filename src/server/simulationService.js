import os from 'node:os';
import { EventEmitter } from 'node:events';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { SimulationManager } from '../engine/SimulationManager.js';

/**
 * Background simulation running at ~60 FPS. When CPU usage exceeds 50% the
 * heavy tick computation is executed inside a Worker thread to keep the main
 * loop responsive.
 */
export const simulationEvents = new EventEmitter();
export let manager;

// Worker thread behaviour
if (!isMainThread) {
  const bacteria = workerData.bacteria;
  // simple heavy operation: increment ages
  for (const b of bacteria) {
    b.age += 0.016;
  }
  parentPort.postMessage(bacteria);
} else {
  /** Global simulation manager instance */
  manager = new SimulationManager();
  manager.start();

  const FRAME_MS = 1000 / 60;
  setInterval(() => {
    const load = (os.loadavg()[0] / os.cpus().length) * 100;
    if (load > 50) {
      const worker = new Worker(new URL('./simulationService.js', import.meta.url), {
        workerData: { bacteria: manager.bacteria }
      });
      worker.on('message', updated => { manager.bacteria = updated; });
      worker.on('error', err => console.error('Worker error', err));
    } else {
      manager.tick();
    }
  }, FRAME_MS);

  // communication every 4 seconds
  setInterval(() => {
    const pair = manager.pickRandomPair();
    if (pair.length === 2) {
      const [a, b] = pair;
      const msg = manager.talk(a, b);
      manager.receive(b, msg, a);
      simulationEvents.emit('newMessage', { from: a.id, to: b.id, text: msg });
    }
  }, 4000);
}
