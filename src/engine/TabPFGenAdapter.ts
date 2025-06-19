// @ts-nocheck
/*
 * TabPFGenAdapter - Synthetic data generator for TabPFN models
 * Mimics core functionality of sebhaan/TabPFGen for in-browser use.
 * Provides simple dataset generation based on the DynamicLexicon.
 */

import { dynamicLexicon } from './core/DynamicLexicon.ts';

export class TabPFGenAdapter {
    constructor() {
        this.isReady = false;
        this.generatedCount = 0;
    }

    async init() {
        // In a real implementation we would load schemas from TabPFGen
        this.isReady = true;
        console.log('✅ TabPFGenAdapter ready');
    }

    // Generate a single synthetic record for a context
    generateRecord(context = 'neutral') {
        const subject = this._sample('subjects');
        const verb = this._sample('verbs');
        const object = this._sample('objects');
        const emotion = this._sample('emotions');

        this.generatedCount += 1;
        return {
            context,
            text: `${subject} ${verb} ${object}`,
            emotion
        };
    }

    // Generate an array of records
    generateDataset(size = 10, context = 'neutral') {
        const dataset = [];
        for (let i = 0; i < size; i++) {
            dataset.push(this.generateRecord(context));
        }
        return dataset;
    }

    getStatus() {
        return { ready: this.isReady, generated: this.generatedCount };
    }

    _sample(category) {
        const words = dynamicLexicon.getWords(category);
        const index = Math.floor(Math.random() * words.length);
        return words[index] || '';
    }
}

export const tabPFGenAdapter = new TabPFGenAdapter();
