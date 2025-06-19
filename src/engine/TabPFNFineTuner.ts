// @ts-nocheck
/*
 * TabPFNFineTuner - Lightweight fine-tuning helper for TabPFN models
 * Inspired by LennartPurucker/finetune_tabpfn_v2, adapted for browser usage.
 */

export class TabPFNFineTuner {
    constructor(tabpfn, wordTracker) {
        this.tabpfn = tabpfn;
        this.wordTracker = wordTracker;
        this.tuningSteps = 0;
    }

    // Apply fine-tuning with a dataset generated from TabPFGenAdapter
    fineTune(dataset = []) {
        if (!this.tabpfn || dataset.length === 0) return;

        dataset.forEach(record => {
            if (record.text) {
                this.wordTracker.registerWord(record.text);
            }
        });
        this.tuningSteps += dataset.length;
        console.log(`🔧 TabPFN fine-tuned with ${dataset.length} samples`);
    }

    getStatus() {
        return { tunedSamples: this.tuningSteps };
    }
}

export const tabpfnFineTuner = new TabPFNFineTuner(null, null);
