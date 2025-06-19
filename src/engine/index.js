// Bootstrap the lightweight simulation engine in the main thread.
import SimulationManager from './SimulationManager.js';

const manager = new SimulationManager();
manager.startBackground();

// Example UI hook - assumes renderBacteriaMessage is defined elsewhere
manager.events.on('newMessage', ({ from, to, text }) => {
  if (typeof renderBacteriaMessage === 'function') {
    renderBacteriaMessage(from, to, text);
  }
});

export default manager;
