/**
 * Turkish Morphology Engine
 * Türkçe morfoloji kuralları: ünlü uyumu, ünsüz benzeşmesi, ek üretimi
 */

export class MorphologyEngine {
    constructor() {
        // Ünlü uyumu tabloları
        this.frontVowels = ['e', 'i', 'ö', 'ü'];
        this.backVowels = ['a', 'ı', 'o', 'u'];
        this.roundedVowels = ['o', 'ö', 'u', 'ü'];
        this.unroundedVowels = ['a', 'e', 'ı', 'i'];
        
        // Ünsüz benzeşmesi
        this.voiceless = ['p', 't', 'k', 'ç', 'f', 's', 'ş', 'h'];
        this.voiced = ['b', 'd', 'g', 'c', 'v', 'z', 'j', 'l', 'm', 'n', 'r', 'y'];
        
        // Ek şablonları
        this.suffixTemplates = {
            accusative: ['{consonant}ı', '{consonant}i', '{consonant}u', '{consonant}ü'],
            dative: ['{consonant}a', '{consonant}e'],
            locative: ['{consonant}da', '{consonant}de', '{consonant}ta', '{consonant}te'],
            ablative: ['{consonant}dan', '{consonant}den', '{consonant}tan', '{consonant}ten'],
            genitive: ['{consonant}ın', '{consonant}in', '{consonant}un', '{consonant}ün'],
            present_continuous: ['{consonant}ıyor', '{consonant}iyor', '{consonant}uyor', '{consonant}üyor'],
            aorist: ['{consonant}ar', '{consonant}er', '{consonant}ır', '{consonant}ir'],
            past_definite: ['{consonant}dı', '{consonant}di', '{consonant}du', '{consonant}dü']
        };
    }

    /**
     * Kelimenin son ünlüsünü bul
     */
    getLastVowel(word) {
        const vowels = 'aeıioöuü';
        for (let i = word.length - 1; i >= 0; i--) {
            if (vowels.includes(word[i])) {
                return word[i];
            }
        }
        return 'a'; // default fallback
    }

    /**
     * Kelimenin son harfini bul
     */
    getLastChar(word) {
        return word.slice(-1).toLowerCase();
    }

    /**
     * Ünlü uyumu kuralına göre doğru ünlüyü seç
     */
    selectVowelByHarmony(word, vowelSet) {
        const lastVowel = this.getLastVowel(word);
        const isFront = this.frontVowels.includes(lastVowel);
        const isRounded = this.roundedVowels.includes(lastVowel);
        
        if (vowelSet.length === 4) {
            // 4'lü uyum: ı/i/u/ü veya a/e/o/ö
            if (isFront) {
                return isRounded ? vowelSet[3] : vowelSet[1]; // ü veya i
            } else {
                return isRounded ? vowelSet[2] : vowelSet[0]; // u veya ı
            }
        } else if (vowelSet.length === 2) {
            // 2'li uyum: a/e
            return isFront ? vowelSet[1] : vowelSet[0]; // e veya a
        }
        
        return vowelSet[0]; // fallback
    }

    /**
     * Ünsüz benzeşmesi uygula
     */
    applyConsonantAssimilation(word, suffix) {
        const lastChar = this.getLastChar(word);
        const suffixFirstChar = suffix[0];
        
        // Sessiz ünsüz + d/g başlangıcı → t/k
        if (this.voiceless.includes(lastChar)) {
            if (suffixFirstChar === 'd') {
                return suffix.replace(/^d/, 't');
            } else if (suffixFirstChar === 'g') {
                return suffix.replace(/^g/, 'k');
            }
        }
        
        return suffix;
    }

    /**
     * Bağlama ünsüzü ekle (ünlü ile biten kelimeler için)
     */
    addLinkingConsonant(word, suffix) {
        const lastChar = this.getLastChar(word);
        const vowels = 'aeıioöuü';
        
        // Kelime ünlü ile bitiyorsa
        if (vowels.includes(lastChar)) {
            // Ek de ünlü ile başlıyorsa bağlama ünsüzü ekle
            if (vowels.includes(suffix[0])) {
                return 'n' + suffix; // 'su-n-u', 'kapı-n-ı'
            } else {
                return suffix;
            }
        }
        
        return suffix;
    }

    /**
     * Ana ek uygulama fonksiyonu
     */
    applySuffix(word, suffixType) {
        if (!word || !suffixType) return word;
        
        const templates = this.suffixTemplates[suffixType];
        if (!templates) {
            console.warn(`Bilinmeyen ek türü: ${suffixType}`);
            return word;
        }
        
        try {
            // Template'den ünlüleri çıkar
            const vowelPattern = templates.map(t => t.replace('{consonant}', ''));
            
            // Ünlü uyumuna göre seç
            const selectedSuffix = this.selectVowelByHarmony(word, vowelPattern);
            
            // Bağlama ünsüzü kontrol et
            const linkedSuffix = this.addLinkingConsonant(word, selectedSuffix);
            
            // Ünsüz benzeşmesi uygula
            const finalSuffix = this.applyConsonantAssimilation(word, linkedSuffix);
            
            return word + finalSuffix;
            
        } catch (error) {
            console.warn(`Morfoloji hatası: ${word} + ${suffixType}:`, error);
            return word;
        }
    }

    /**
     * Fiil çekimi özel kuralları
     */
    conjugateVerb(verbRoot, tense, person = '3sg') {
        // Fiil kökünden 'mek/mak' ekini çıkar
        let cleanRoot = verbRoot;
        if (verbRoot.endsWith('mek') || verbRoot.endsWith('mak')) {
            cleanRoot = verbRoot.slice(0, -3);
        }
        
        switch (tense) {
            case 'present_continuous':
                return this.applySuffix(cleanRoot, 'present_continuous');
                
            case 'aorist':
                // Geniş zaman daha karmaşık, basit versiyonu
                const aoristSuffix = this.selectVowelByHarmony(cleanRoot, ['ar', 'er']);
                return cleanRoot + aoristSuffix;
                
            case 'past_definite':
                return this.applySuffix(cleanRoot, 'past_definite');
                
            case 'imperative':
                // Emir kipi - çoğunlukla kök hali
                return cleanRoot;
                
            default:
                return this.applySuffix(cleanRoot, 'present_continuous');
        }
    }

    /**
     * Özel durumlar ve istisna kelimeler
     */
    handleSpecialCases(word, suffixType) {
        const specialCases = {
            'su': {
                accusative: 'suyu',
                dative: 'suya'
            },
            'kapı': {
                accusative: 'kapıyı',
                dative: 'kapıya'
            },
            'kitap': {
                accusative: 'kitabı', // p→b değişimi
                dative: 'kitaba'
            }
        };
        
        if (specialCases[word] && specialCases[word][suffixType]) {
            return specialCases[word][suffixType];
        }
        
        return null; // Normal kurallara devam et
    }

    /**
     * Gelişmiş ek uygulama (özel durumlarla)
     */
    applyAdvancedSuffix(word, suffixType) {
        // Önce özel durumları kontrol et
        const special = this.handleSpecialCases(word, suffixType);
        if (special) return special;
        
        // Normal kurallara göre uygula
        return this.applySuffix(word, suffixType);
    }

    /**
     * Test fonksiyonu
     */
    test() {
        const testWords = ['ev', 'masa', 'kitap', 'kedi', 'su', 'ağaç'];
        const testSuffixes = ['accusative', 'dative', 'locative'];
        
        console.log('🧪 MorphologyEngine Test:');
        testWords.forEach(word => {
            testSuffixes.forEach(suffix => {
                const result = this.applyAdvancedSuffix(word, suffix);
                console.log(`${word} + ${suffix} = ${result}`);
            });
        });
        
        // Fiil testi
        const testVerbs = ['yapmak', 'gelmek', 'koşmak'];
        testVerbs.forEach(verb => {
            const present = this.conjugateVerb(verb, 'present_continuous');
            const aorist = this.conjugateVerb(verb, 'aorist');
            console.log(`${verb}: ${present}, ${aorist}`);
        });
    }
}

// Global instance
export const morphologyEngine = new MorphologyEngine(); 