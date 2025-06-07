// 🧪 Unit Tests for Ring Buffer System
// Ensures memory-efficient tracking works correctly

import { 
    RingBuffer, 
    WordTrackingBuffer, 
    ContextHistoryBuffer, 
    BufferManager 
} from '../src/utils/RingBuffer.js';

// Mock console for clean tests
const originalConsole = console.log;
console.log = jest.fn();

describe('RingBuffer', () => {
    let buffer;

    beforeEach(() => {
        buffer = new RingBuffer(5);
    });

    afterEach(() => {
        console.log.mockClear();
    });

    afterAll(() => {
        console.log = originalConsole;
    });

    test('should initialize with correct default parameters', () => {
        const defaultBuffer = new RingBuffer();
        expect(defaultBuffer.maxSize).toBe(100);
        expect(defaultBuffer.size).toBe(0);
        expect(defaultBuffer.isFull).toBe(false);
    });

    test('should push items correctly without overflow', () => {
        buffer.push('item1');
        buffer.push('item2');
        
        expect(buffer.size).toBe(2);
        expect(buffer.toArray()).toEqual(['item2', 'item1']);
        expect(buffer.isFull).toBe(false);
    });

    test('should handle buffer overflow correctly', () => {
        // Fill buffer completely
        for (let i = 1; i <= 5; i++) {
            buffer.push(`item${i}`);
        }
        
        expect(buffer.size).toBe(5);
        expect(buffer.isFull).toBe(true);
        
        // Add one more to trigger overflow
        buffer.push('item6');
        
        expect(buffer.size).toBe(5);
        expect(buffer.isFull).toBe(true);
        expect(buffer.toArray()).toEqual(['item6', 'item5', 'item4', 'item3', 'item2']);
        expect(buffer.includes('item1')).toBe(false); // Oldest item evicted
    });

    test('should return correct last N items', () => {
        buffer.push('a').push('b').push('c').push('d');
        
        expect(buffer.getLast(2)).toEqual(['d', 'c']);
        expect(buffer.getLast(10)).toEqual(['d', 'c', 'b', 'a']);
    });

    test('should count item occurrences correctly', () => {
        buffer.push('apple').push('banana').push('apple').push('cherry');
        
        expect(buffer.count('apple')).toBe(2);
        expect(buffer.count('banana')).toBe(1);
        expect(buffer.count('grape')).toBe(0);
    });

    test('should filter and map items correctly', () => {
        buffer.push('hello').push('world').push('test').push('code');
        
        const longWords = buffer.filter(word => word.length > 4);
        expect(longWords).toEqual(['world', 'hello']);
        
        const upperCased = buffer.map(word => word.toUpperCase());
        expect(upperCased).toEqual(['CODE', 'TEST', 'WORLD', 'HELLO']);
    });

    test('should clear buffer completely', () => {
        buffer.push('item1').push('item2');
        buffer.clear();
        
        expect(buffer.size).toBe(0);
        expect(buffer.isFull).toBe(false);
        expect(buffer.toArray()).toEqual([]);
    });

    test('should serialize and deserialize correctly', () => {
        buffer.push('test1').push('test2').push('test3');
        
        const serialized = buffer.serialize();
        expect(serialized.maxSize).toBe(5);
        expect(serialized.data).toEqual(['test3', 'test2', 'test1']);
        
        const deserialized = RingBuffer.deserialize(serialized);
        expect(deserialized.toArray()).toEqual(['test3', 'test2', 'test1']);
        expect(deserialized.maxSize).toBe(5);
    });
});

describe('WordTrackingBuffer', () => {
    let wordBuffer;

    beforeEach(() => {
        wordBuffer = new WordTrackingBuffer(4);
    });

    test('should track word frequencies correctly', () => {
        wordBuffer.push('hello').push('world').push('hello').push('test');
        
        expect(wordBuffer.getWordFrequency('hello')).toBe(2);
        expect(wordBuffer.getWordFrequency('world')).toBe(1);
        expect(wordBuffer.getWordFrequency('nonexistent')).toBe(0);
    });

    test('should identify overused words', () => {
        wordBuffer.push('spam').push('spam').push('normal');
        
        expect(wordBuffer.isOverused('spam', 0.5)).toBe(true); // 2/3 > 0.5
        expect(wordBuffer.isOverused('normal', 0.5)).toBe(false);
    });

    test('should return most frequent words', () => {
        wordBuffer.push('a').push('b').push('a').push('c').push('a');
        
        const mostFrequent = wordBuffer.getMostFrequent(2);
        expect(mostFrequent[0]).toEqual({ word: 'a', count: 2 }); // a appears 2 times in buffer
        expect(mostFrequent[1].word).toBeTruthy(); // Second most frequent exists
    });

    test('should handle frequency updates with overflow', () => {
        // Fill buffer and trigger overflow
        wordBuffer.push('old').push('word1').push('word2').push('word3');
        expect(wordBuffer.getWordFrequency('old')).toBe(1);
        
        // Add new word to trigger overflow
        wordBuffer.push('new');
        expect(wordBuffer.getWordFrequency('old')).toBe(0); // Evicted
        expect(wordBuffer.getWordFrequency('new')).toBe(1);
    });
});

describe('ContextHistoryBuffer', () => {
    let contextBuffer;

    beforeEach(() => {
        contextBuffer = new ContextHistoryBuffer(5);
    });

    test('should track context transitions', () => {
        contextBuffer.push('biological').push('emotional').push('social');
        
        const patterns = contextBuffer.getTransitionPatterns();
        expect(patterns).toContainEqual(
            expect.objectContaining({
                transition: 'biological->emotional',
                count: 1
            })
        );
        expect(patterns).toContainEqual(
            expect.objectContaining({
                transition: 'emotional->social',
                count: 1
            })
        );
    });

    test('should predict next context based on patterns', () => {
        // Create pattern: biological -> emotional (twice)
        contextBuffer.push('biological').push('emotional');
        contextBuffer.push('biological').push('emotional');
        contextBuffer.push('biological'); // Current context
        
        const availableContexts = ['emotional', 'social', 'creative'];
        const prediction = contextBuffer.predictNextContext(availableContexts);
        
        expect(prediction).toBe('emotional'); // Most likely transition
    });

    test('should handle no available context predictions', () => {
        contextBuffer.push('biological');
        
        const prediction = contextBuffer.predictNextContext(['unknown']);
        expect(prediction).toBeNull();
    });
});

describe('BufferManager', () => {
    let manager;

    beforeEach(() => {
        manager = new BufferManager();
    });

    afterEach(() => {
        manager.shutdown();
    });

    test('should create and register buffers correctly', () => {
        const buffer = manager.create('test_buffer', 'word', 10);
        
        expect(buffer).toBeInstanceOf(WordTrackingBuffer);
        expect(buffer.maxSize).toBe(10);
        expect(manager.get('test_buffer')).toBe(buffer);
    });

    test('should create different buffer types', () => {
        const wordBuffer = manager.create('words', 'word', 20);
        const contextBuffer = manager.create('contexts', 'context', 15);
        const basicBuffer = manager.create('basic', 'basic', 25);
        
        expect(wordBuffer).toBeInstanceOf(WordTrackingBuffer);
        expect(contextBuffer).toBeInstanceOf(ContextHistoryBuffer);
        expect(basicBuffer).toBeInstanceOf(RingBuffer);
    });

    test('should return null for non-existent buffer', () => {
        expect(manager.get('nonexistent')).toBeNull();
    });

    test('should collect stats from all buffers', () => {
        manager.create('buffer1', 'word', 10);
        manager.create('buffer2', 'context', 5);
        
        const stats = manager.getStats();
        expect(stats).toHaveProperty('buffer1');
        expect(stats).toHaveProperty('buffer2');
        expect(stats.buffer1).toHaveProperty('size');
        expect(stats.buffer1).toHaveProperty('maxSize');
    });

    test('should clear all buffers', () => {
        const buffer1 = manager.create('test1', 'basic', 5);
        const buffer2 = manager.create('test2', 'word', 5);
        
        buffer1.push('item');
        buffer2.push('word');
        
        expect(buffer1.size).toBe(1);
        expect(buffer2.size).toBe(1);
        
        manager.clearAll();
        
        expect(buffer1.size).toBe(0);
        expect(buffer2.size).toBe(0);
    });

    test('should handle shutdown gracefully', () => {
        manager.create('test', 'basic', 5);
        manager.startAutoCleanup();
        
        expect(manager.cleanupInterval).toBeTruthy();
        
        manager.shutdown();
        
        expect(manager.cleanupInterval).toBeNull();
        expect(manager.buffers.size).toBe(0);
    });
});

describe('Performance Tests', () => {
    test('should handle large number of operations efficiently', () => {
        const buffer = new RingBuffer(1000);
        const startTime = Date.now();
        
        // Perform 10,000 operations
        for (let i = 0; i < 10000; i++) {
            buffer.push(`item${i}`);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Should complete in reasonable time (< 100ms)
        expect(duration).toBeLessThan(100);
        expect(buffer.size).toBe(1000); // Buffer should maintain max size
        expect(buffer.isFull).toBe(true);
    });

    test('should maintain O(1) insertion complexity', () => {
        const buffer = new WordTrackingBuffer(500);
        
        // Measure time for different sizes
        const measurements = [];
        
        for (let size = 100; size <= 500; size += 100) {
            const start = Date.now();
            
            for (let i = 0; i < 100; i++) {
                buffer.push(`word${i}`);
            }
            
            const end = Date.now();
            measurements.push(end - start);
        }
        
        // Time should remain relatively constant (O(1))
        // Allow some variance but shouldn't grow linearly
        const maxVariance = Math.max(...measurements) - Math.min(...measurements);
        expect(maxVariance).toBeLessThan(20); // 20ms variance threshold
    });
}); 