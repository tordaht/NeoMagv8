/**
 * Minimal server-side SimulationManager used by the background simulation
 * service. Bacteria objects hold a small vocabulary and learn words from each
 * other. This manager is intentionally lightweight so it can run both in the
 * main thread and in a worker.
 */
export class SimulationManager {
  constructor(count = 10) {
    /** @type {Array<{id:string,name:string,age:number,vocabulary:Set<string>,memory:string[]}>} */
    this.bacteria = [];
    this.running = false;
    for (let i = 0; i < count; i++) {
      this.bacteria.push({
        id: `b_${i}`,
        name: `Bac${i}`,
        age: 0,
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
    });
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
        vocabularySize: b.vocabulary.size
      }))
    };
  }
}

export default { SimulationManager };
