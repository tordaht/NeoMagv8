/**
 * Minimal server-side SimulationManager used by the background simulation
 * service. Bacteria objects hold a small vocabulary and learn words from each
 * other. This manager is intentionally lightweight so it can run both in the
 * main thread and in a worker.
 */
import { EventEmitter } from 'events';

export class SimulationManager {
  constructor(count = 10, initialEnergy = 1) {
    /**
     * Emits internal simulation events like `newMessage`.
     * @type {EventEmitter}
     */
    this.events = new EventEmitter();
    this._bgLoop = null;
    this._dialogueLoop = null;
    /** @type {Array<{id:string,name:string,age:number,vocabulary:Set<string>,memory:string[]}>} */
    this.bacteria = [];
    this.initialEnergy = Math.max(initialEnergy, 0.6);
    this.running = false;
    for (let i = 0; i < count; i++) {
      this.bacteria.push({
        id: `b_${i}`,
        name: `Bac${i}`,
        age: 0,
        energy: this.initialEnergy,
        vocabulary: new Set(["merhaba", "selam", "nasilsin"].slice(0, 2)),
        memory: []
      });
    }
  }

  /** Start the simulation loop */
  start() {
    this.running = true;
  }

  /** Stop simulation */
  stop() {
    this.running = false;
  }

  /** Update all bacteria. Called every tick. */
  tick() {
    this.bacteria.forEach(b => {
      b.age += 0.016; // roughly 60fps step
      b.energy = Math.max(0, b.energy - 0.001);
    });
    this.events.emit('tick', this.getState());
  }

  /**
   * Pick two distinct random bacteria
   * @returns {[any, any]}
   */
  pickRandomPair() {
    if (this.bacteria.length < 2) return [];
    const a = this.bacteria[Math.floor(Math.random() * this.bacteria.length)];
    let b = a;
    while (b === a) {
      b = this.bacteria[Math.floor(Math.random() * this.bacteria.length)];
    }
    return [a, b];
  }

  /**
   * Generate a message from a to b
   * @param {*} a
   * @param {*} b
   * @returns {string}
   */
  talk(a, b) {
    const words = Array.from(a.vocabulary);
    const word = words[Math.floor(Math.random() * words.length)] || "merhaba";
    return `${a.name} -> ${b.name}: ${word}`;
  }

  /**
   * Receive a message and learn new words
   * @param {*} target
   * @param {string} msg
   * @param {*} from
   */
  receive(target, msg, from) {
    target.memory.push(msg);
    const parts = msg.split(' ');
    parts.forEach(p => target.vocabulary.add(p));
  }

  /** Get simulation state */
  getState() {
    return {
      running: this.running,
      population: this.bacteria.map(b => ({
        id: b.id,
        name: b.name,
        age: b.age,
        energy: b.energy,
        vocabularySize: b.vocabulary.size
      }))
    };
  }

  /**
   * Start continuous background loops for ticking and autonomous dialogues.
   * Emits `newMessage` events whenever bacteria communicate.
   */
  startBackground() {
    this.running = true;
    this._bgLoop = setInterval(() => this.tick(), 1000 / 60);
    this._dialogueLoop = setInterval(() => {
      const [a, b] = this.pickRandomPair();
      if (!a || !b) return;
      const msg = this.talk(a, b);
      this.receive(b, msg, a);
      this.events.emit('newMessage', { from: a.id, to: b.id, text: msg });
      this.events.emit('dialogue', { from: a.id, to: b.id, text: msg });
    }, 4000);
  }

  /**
   * Stop the background tick and dialogue intervals.
   */
  stopBackground() {
    clearInterval(this._bgLoop);
    clearInterval(this._dialogueLoop);
    this.running = false;
  }
}

export default SimulationManager;
