export default class TabPFGenAdapter {
  constructor() { this.isReady = false; }
  async init() { this.isReady = true; }
  generateRecord(context = 'neutral') {
    return { context, text: 'stub text', emotion: 'neutral' };
  }
  generateDataset(size = 10, context = 'neutral') {
    return Array.from({ length: size }, () => this.generateRecord(context));
  }
  getStatus() { return { ready: this.isReady, generated: 0 }; }
}
