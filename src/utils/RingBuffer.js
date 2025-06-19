// @ts-nocheck
// 🔄 Ring Buffer Utility - Prevents Memory Leaks in Tracking Systems
// Replaces growing arrays with fixed-size circular buffers

import { RUNTIME_CONFIG } from '../config/SystemConfig.js';


export class RingBuffer {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.buffer = new Array(maxSize);
        this.head = 0; // Next write position
        this.tail = 0; // Next read position
        this.size = 0; // Current number of elements
        this.isFull = false;
    }

    // Add item to buffer (overwrites oldest if full)
    push(item) {
        this.buffer[this.head] = item;

        if (this.isFull) {
            this.tail = (this.tail + 1) % this.maxSize;
        }

        this.head = (this.head + 1) % this.maxSize;

        if (this.size < this.maxSize) {
            this.size++;
        }

        this.isFull = this.size >= this.maxSize;

        
        return this;
    }

    // Get all items as array (newest first)
    toArray() {
        if (this.size === 0) return [];
        
        const result = [];
        let index = this.isFull ? this.head : 0;
        
        for (let i = 0; i < this.size; i++) {
            const pos = this.isFull ? 
                (this.head - 1 - i + this.maxSize) % this.maxSize :
                this.size - 1 - i;
            result.push(this.buffer[pos]);
        }
        
        return result;
    }

    // Get last N items
    getLast(n = 5) {
        return this.toArray().slice(0, Math.min(n, this.size));
    }

    // Get first N items
    getFirst(n = 5) {
        const arr = this.toArray();
        return arr.slice(Math.max(0, arr.length - n));
    }

    // Check if item exists in buffer
    includes(item) {
        if (this.size === 0) return false;
        
        for (let i = 0; i < this.size; i++) {
            const pos = this.isFull ? 
                (this.tail + i) % this.maxSize :
                i;
            if (this.buffer[pos] === item) return true;
        }
        
        return false;
    }

    // Count occurrences of item
    count(item) {
        if (this.size === 0) return 0;
        
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            const pos = this.isFull ? 
                (this.tail + i) % this.maxSize :
                i;
            if (this.buffer[pos] === item) count++;
        }
        
        return count;
    }

    // Filter items
    filter(predicate) {
        return this.toArray().filter(predicate);
    }

    // Map items
    map(mapper) {
        return this.toArray().map(mapper);
    }

    // Clear buffer
    clear() {
        this.head = 0;
        this.tail = 0;
        this.size = 0;
        this.isFull = false;
        this.buffer.fill(undefined);
        return this;
    }

    // Get buffer statistics
    getStats() {
        return {
            size: this.size,
            maxSize: this.maxSize,
            usage: (this.size / this.maxSize * 100).toFixed(1) + '%',
            isFull: this.isFull,
            memoryEfficient: true
        };
    }

    // Serialize for storage
    serialize() {
        return {
            maxSize: this.maxSize,
            data: this.toArray(),
            timestamp: Date.now()
        };
    }

    // Deserialize from storage
    static deserialize(serialized) {
        const buffer = new RingBuffer(serialized.maxSize);
        if (serialized.data) {
            serialized.data.reverse().forEach(item => buffer.push(item));
        }
        return buffer;
    }
}

// 📊 Specialized Ring Buffer for Word Tracking
export class WordTrackingBuffer extends RingBuffer {
    constructor(maxSize = 50) {
        super(maxSize);
        this.wordCounts = new Map();
    }

    push(word) {
        // Remove old word from count if buffer is full
        if (this.isFull) {
            const oldWord = this.buffer[this.head];
            if (oldWord) {
                const count = this.wordCounts.get(oldWord) || 0;
                if (count <= 1) {
                    this.wordCounts.delete(oldWord);
                } else {
                    this.wordCounts.set(oldWord, count - 1);
                }
            }
        }

        // Add new word
        super.push(word);
        this.wordCounts.set(word, (this.wordCounts.get(word) || 0) + 1);
        
        return this;
    }

    // Get word frequency in current buffer
    getWordFrequency(word) {
        return this.wordCounts.get(word) || 0;
    }

    // Get most frequent words
    getMostFrequent(limit = 5) {
        return Array.from(this.wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, count]) => ({ word, count }));
    }

    // Check if word is overused (frequency > threshold)
    isOverused(word, threshold = 0.3) {
        const frequency = this.getWordFrequency(word);
        return frequency > (this.size * threshold);
    }

    clear() {
        super.clear();
        this.wordCounts.clear();
        return this;
    }
}

// 🎯 Context History Ring Buffer
export class ContextHistoryBuffer extends RingBuffer {
    constructor(maxSize = 10) {
        super(maxSize);
        this.transitions = new Map(); // context -> context transitions
    }

    push(context) {
        const lastContext = this.size > 0 ? this.getLast(1)[0] : null;
        
        super.push(context);
        
        // Track context transitions
        if (lastContext && lastContext !== context) {
            const key = `${lastContext}->${context}`;
            this.transitions.set(key, (this.transitions.get(key) || 0) + 1);
        }
        
        return this;
    }

    // Get context transition patterns
    getTransitionPatterns() {
        return Array.from(this.transitions.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([transition, count]) => ({
                transition,
                count,
                probability: count / Math.max(1, this.size - 1)
            }));
    }

    // Predict next context based on patterns
    predictNextContext(availableContexts) {
        if (this.size === 0) return null;
        
        const currentContext = this.getLast(1)[0];
        const patterns = this.getTransitionPatterns()
            .filter(p => p.transition.startsWith(currentContext + '->'))
            .filter(p => {
                const targetContext = p.transition.split('->')[1];
                return availableContexts.includes(targetContext);
            });
        
        if (patterns.length === 0) return null;
        
        // Weighted random selection
        const totalWeight = patterns.reduce((sum, p) => sum + p.count, 0);
        let random = Math.random() * totalWeight;
        
        for (const pattern of patterns) {
            random -= pattern.count;
            if (random <= 0) {
                return pattern.transition.split('->')[1];
            }
        }
        
        return patterns[0].transition.split('->')[1];
    }

    clear() {
        super.clear();
        this.transitions.clear();
        return this;
    }
}

// 🔧 Buffer Management Utility
export class BufferManager {
    constructor() {
        this.buffers = new Map();
        this.cleanupInterval = null;
        this.cleanupIntervalMs = 300000; // 5 minutes
    }

    // Register a buffer for automatic cleanup
    register(name, buffer, autoCleanup = true) {
        this.buffers.set(name, {
            buffer,
            autoCleanup,
            lastAccess: Date.now()
        });

        if (autoCleanup && !this.cleanupInterval) {
            this.startAutoCleanup();
        }

        return buffer;
    }

    // Get a registered buffer
    get(name) {
        const entry = this.buffers.get(name);
        if (entry) {
            entry.lastAccess = Date.now();
            return entry.buffer;
        }
        return null;
    }

    // Create and register a new buffer
    create(name, type = 'basic', maxSize = 100, autoCleanup = true) {
        let buffer;
        
        switch (type) {
            case 'word':
                buffer = new WordTrackingBuffer(maxSize);
                break;
            case 'context':
                buffer = new ContextHistoryBuffer(maxSize);
                break;
            default:
                buffer = new RingBuffer(maxSize);
        }

        return this.register(name, buffer, autoCleanup);
    }

    // Start automatic cleanup of unused buffers
    startAutoCleanup() {
        if (this.cleanupInterval) return;

        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            const threshold = 30 * 60 * 1000; // 30 minutes

            for (const [name, entry] of this.buffers.entries()) {
                if (entry.autoCleanup && (now - entry.lastAccess) > threshold) {
                    if (RUNTIME_CONFIG.DEV.ENABLE_DETAILED_LOGGING) {
                        console.log(`🧹 Auto-cleaning unused buffer: ${name}`);
                    }
                    entry.buffer.clear();
                    this.buffers.delete(name);
                }
            }

            // Stop cleanup if no buffers left
            if (this.buffers.size === 0) {
                this.stopAutoCleanup();
            }
        }, this.cleanupIntervalMs);
    }

    // Stop automatic cleanup
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    // Get statistics for all buffers
    getStats() {
        const stats = {};
        for (const [name, entry] of this.buffers.entries()) {
            stats[name] = {
                ...entry.buffer.getStats(),
                lastAccess: new Date(entry.lastAccess).toISOString(),
                autoCleanup: entry.autoCleanup
            };
        }
        return stats;
    }

    // Clear all buffers
    clearAll() {
        for (const [name, entry] of this.buffers.entries()) {
            entry.buffer.clear();
        }
        if (RUNTIME_CONFIG.DEV.ENABLE_DETAILED_LOGGING) {
            console.log('🧹 All buffers cleared');
        }
    }

    // Shutdown manager
    shutdown() {
        this.stopAutoCleanup();
        this.clearAll();
        this.buffers.clear();
    }
}

// 🚀 Global buffer manager instance
export const bufferManager = new BufferManager();

// Export for testing
export default { RingBuffer, WordTrackingBuffer, ContextHistoryBuffer, BufferManager, bufferManager }; 
