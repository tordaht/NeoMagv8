export default class TabPFNFineTuner {
  constructor() { this.tuningSteps = 0; }
  fineTune(dataset = []) { this.tuningSteps += dataset.length; }
  getStatus() { return { tunedSamples: this.tuningSteps }; }
}
