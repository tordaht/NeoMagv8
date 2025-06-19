import * as tf from '@tensorflow/tfjs';

export class ModelService {
    private modelUrl: string;
    private version: string;
    private cache: Map<string, tf.GraphModel>;
    private currentVersion: string | null;

    constructor(modelUrl: string, version: string) {
        this.modelUrl = modelUrl;
        this.version = version;
        this.cache = new Map();
        this.currentVersion = null;
    }

    setVersion(version: string) {
        if (this.version !== version) {
            if (this.currentVersion && this.cache.has(this.currentVersion)) {
                this.cache.delete(this.currentVersion);
            }
            this.version = version;
        }
    }

    async loadModel(): Promise<tf.GraphModel> {
        if (this.currentVersion !== this.version) {
            if (this.currentVersion && this.cache.has(this.currentVersion)) {
                this.cache.delete(this.currentVersion);
            }
            this.currentVersion = this.version;
        }

        if (this.cache.has(this.version)) {
            return this.cache.get(this.version) as tf.GraphModel;
        }

        const url = `${this.modelUrl}/${this.version}/model.json`;
        const model = await tf.loadGraphModel(url);
        this.cache.set(this.version, model);
        return model;
    }

    clearCache() {
        this.cache.clear();
        this.currentVersion = null;
    }
}
