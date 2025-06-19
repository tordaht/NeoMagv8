// @ts-nocheck
/**
 * Semantic Fields Utility
 * Vite modular yapıda semantic fields yönetimi
 */

export let SEMANTIC_FIELDS = {};

/**
 * Semantic fields JSON dosyasını yükle
 */
export async function loadSemanticFields() {
    try {
        // Vite statik import yapısı
        const response = await fetch('/src/data/semantic_fields.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        SEMANTIC_FIELDS = await response.json();
        
        console.log('🎯 Semantic fields yüklendi:', {
            categories: Object.keys(SEMANTIC_FIELDS),
            totalWords: Object.values(SEMANTIC_FIELDS).reduce((sum, arr) => sum + arr.length, 0)
        });
        
        return SEMANTIC_FIELDS;
        
    } catch (error) {
        console.error('❌ Semantic fields yükleme hatası:', error);
        
        // Fallback - temel kelimeler
        SEMANTIC_FIELDS = {
            'biological': ['yaşam', 'büyüme', 'enerji', 'hareket', 'beslenme'],
            'emotional': ['mutluluk', 'üzüntü', 'korku', 'heyecan', 'sakinlik'],
            'social': ['arkadaşlık', 'iletişim', 'yardım', 'paylaşım', 'birlik'],
            'neutral': ['nesne', 'yer', 'zaman', 'durum', 'şey']
        };
        
        console.log('⚠️ Fallback semantic fields kullanılıyor');
        return SEMANTIC_FIELDS;
    }
}

/**
 * Belirli kategoriden rastgele kelime al
 */
export function getRandomWordFromCategory(category) {
    const words = SEMANTIC_FIELDS[category];
    if (!words || words.length === 0) {
        console.warn(`⚠️ Kategori bulunamadı: ${category}`);
        return null;
    }
    
    return words[Math.floor(Math.random() * words.length)];
}

/**
 * Tüm kategorilerden rastgele kelime al
 */
export function getRandomWord() {
    const categories = Object.keys(SEMANTIC_FIELDS);
    if (categories.length === 0) return null;
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return getRandomWordFromCategory(randomCategory);
}

/**
 * Context'e göre uygun kategori belirle
 */
export function getContextCategory(context) {
    const contextMapping = {
        'survival': 'biological',
        'social': 'social', 
        'creative': 'emotional',
        'philosophical': 'emotional',
        'neutral': 'neutral'
    };
    
    return contextMapping[context] || 'neutral';
}

/**
 * Context'e göre kelime öner
 */
export function getContextualWord(context) {
    const category = getContextCategory(context);
    return getRandomWordFromCategory(category) || getRandomWord();
}

/**
 * Semantic fields durumu
 */
export function getSemanticFieldsStatus() {
    return {
        loaded: Object.keys(SEMANTIC_FIELDS).length > 0,
        categories: Object.keys(SEMANTIC_FIELDS),
        wordCounts: Object.fromEntries(
            Object.entries(SEMANTIC_FIELDS).map(([key, words]) => [key, words.length])
        ),
        totalWords: Object.values(SEMANTIC_FIELDS).reduce((sum, arr) => sum + arr.length, 0)
    };
} 