/**
 * 🚀 Enhanced Morphological Dialogue Generator v2.7
 * 
 * Sıkılaştırılmış sistem - Anlamsız kelime üretimi önlenir:
 * 1. Kelime Sanitasyon & Filtreleme
 * 2. Sıkılaştırılmış Morfoloji Kuralları
 * 3. Artırılmış Coherence Ağırlığı
 * 4. Mood Kontrollü Absürd Tolerans
 * 5. Türkçe Kelime Doğrulama
 * 6. Ünlü Uyumu Kontrolü
 */

// ——————————————
// 1. Gelişmiş Kelime Havuzları (Sanitized + Filtered)
// ——————————————
class DynamicLexicon {
    constructor() {
        this.baseWords = {
            subjects: ['bakteri', 'hücre', 'gezgin', 'hayal', 'karınca', 'atom', 'çiçek', 'balık', 'ruh', 'zihin', 'kalp', 'nefes', 'yıldız'],
            verbs: ['sentezliyor', 'keşfediyor', 'dans ediyor', 'paylaşıyor', 'görüyor', 'müzik yapıyor', 'rüya kuruyor', 'titreşiyor', 'parıldıyor', 'evrimleşiyor', 'fısıldıyor', 'büyülüyor', 'uyanıyor', 'hissediyor', 'anlıyor'],
            objects: ['enerji', 'dna', 'düşünce', 'vitamin', 'mineral', 'şarkı', 'renk', 'koku', 'anı', 'gizem', 'umut', 'korku', 'sevgi'],
            emotions: ['mutlu', 'meraklı', 'şaşkın', 'kararlı', 'hüzünlü', 'heyecanlı', 'sakin', 'endişeli', 'umutlu', 'korkmuş', 'şefkatli', 'gururlu', 'utangaç', 'cesur', 'nazik'],
            locations: ['laboratuvar', 'okyanús', 'gökyüzü', 'yaprak', 'toprak', 'hava', 'su', 'ışık', 'gölge', 'rüzgar', 'kalp', 'zihin', 'ev', 'yol', 'köprü'],
            conjunctions: ['ancak', 'ama', 'fakat', 'lakin', 'oysa', 've', 'ile', 'hem', 'ya da', 'veya', 'ki', 'çünkü', 'zira', 'hatta', 'ayrıca'],
            intensifiers: ['çok', 'epey', 'oldukça', 'fazlasıyla', 'son derece', 'büyük ölçüde', 'hayli', 'bir hayli', 'gayet', 'pek'],
            temporal: ['şimdi', 'sonra', 'önce', 'hemen', 'yavaşça', 'birden', 'aniden', 'derhal', 'zamanla', 'sonunda']
        };
        
        this.dynamicWords = {
            subjects: new Set(),
            verbs: new Set(),
            objects: new Set(),
            emotions: new Set(),
            locations: new Set()
        };
        
        this.wordSuccessRates = new Map();
        this.contextFrequency = new Map();
        
        // Türkçe alfabe ve karakter setleri
        this.turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
        this.validCharacters = new Set(this.turkishAlphabet.split(''));
        this.minWordLength = 2;
        this.maxWordLength = 15;
    }
    
    // Kelime sanitasyon ve doğrulama
    sanitizeWord(word) {
        if (!word || typeof word !== 'string') return null;
        
        // Küçük harfe çevir ve temizle
        let cleaned = word.toLowerCase().trim();
        
        // Sadece Türkçe karakterleri tut
        cleaned = cleaned.split('').filter(char => this.validCharacters.has(char)).join('');
        
        // Uzunluk kontrolü
        if (cleaned.length < this.minWordLength || cleaned.length > this.maxWordLength) {
            return null;
        }
        
        // Tekrar eden karakterleri kontrol et (3'ten fazla aynı karakter)
        if (/(.)\1{3,}/.test(cleaned)) {
            return null;
        }
        
        // Sesli harf kontrolü (en az 1 sesli harf)
        const vowels = 'aıoueiöü';
        if (![...cleaned].some(char => vowels.includes(char))) {
            return null;
        }
        
        return cleaned;
    }
    
    // Levenshtein mesafesi ile kelime düzeltme
    findClosestWord(word, wordList, maxDistance = 2) {
        let bestMatch = null;
        let bestDistance = Infinity;
        
        for (const candidate of wordList) {
            const distance = this.levenshteinDistance(word, candidate);
            if (distance <= maxDistance && distance < bestDistance) {
                bestDistance = distance;
                bestMatch = candidate;
            }
        }
        
        return bestMatch;
    }
    
    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
        
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        return matrix[a.length][b.length];
    }
    
    addDynamicWord(category, word, successRate = 0.5) {
        const sanitized = this.sanitizeWord(word);
        if (!sanitized) return false;
        
        // Mevcut kelime havuzunda ara
        const allWords = this.getWords(category);
        const corrected = this.findClosestWord(sanitized, allWords);
        
        if (corrected) {
            // Mevcut kelimeyi güçlendir
            this.updateWordSuccess(corrected, successRate);
            return true;
        }
        
        // Başarı oranı eşiği (0.3'ten yüksek olmalı)
        if (successRate < 0.3) return false;
        
        if (this.dynamicWords[category]) {
            this.dynamicWords[category].add(sanitized);
            this.wordSuccessRates.set(sanitized, successRate);
            return true;
        }
        
        return false;
    }
    
    getWords(category) {
        const base = this.baseWords[category] || [];
        const dynamic = Array.from(this.dynamicWords[category] || []);
        
        // Başarı oranına göre filtrele
        const filtered = dynamic.filter(word => this.getWordSuccess(word) > 0.3);
        
        return [...base, ...filtered];
    }
    
    updateWordSuccess(word, success) {
        const current = this.wordSuccessRates.get(word) || 0.5;
        const updated = (current * 0.8) + (success * 0.2);
        this.wordSuccessRates.set(word, Math.max(0.0, Math.min(1.0, updated)));
    }
    
    getWordSuccess(word) {
        return this.wordSuccessRates.get(word) || 0.5;
    }
}

// Global dynamic lexicon instance
const dynamicLexicon = new DynamicLexicon();

// ——————————————
// 2. Sıkılaştırılmış Türkçe Morfoloji Engine
// ——————————————
class TurkishMorphologyEngine {
    constructor() {
        this.vowelHarmony = {
            back: ['a', 'ı', 'o', 'u'],
            front: ['e', 'i', 'ö', 'ü'],
            rounded: ['o', 'u', 'ö', 'ü'],
            unrounded: ['a', 'ı', 'e', 'i']
        };
        
        this.specialCases = {
            // Consonant changes
            'kitap': 'kitabı',
            'kalp': 'kalbi',
            'renk': 'rengi',
            'süt': 'sütü',
            'burun': 'burnu',
            'karın': 'karnı',
            'göz': 'gözü',
            'kız': 'kızı'
        };
        
        this.invalidCombinations = [
            /[çğışöü]{3,}/, // 3'ten fazla özel karakter
            /[bcdfghjklmnpqrstvwxyz]{4,}/, // 4'ten fazla ünsüz
            /^[çğışöü]/, // Özel karakterle başlama
            /[çğışöü]$/ // Özel karakterle bitme (bazı istisnalar hariç)
        ];
        
        this.caseEndingsAdvanced = {
            nom: '',
            acc: this.getAccusativeEnding.bind(this),
            dat: this.getDativeEnding.bind(this),
            loc: this.getLocativeEnding.bind(this),
            abl: this.getAblativeEnding.bind(this),
            gen: this.getGenitiveEnding.bind(this),
            ins: this.getInstrumentalEnding.bind(this)
        };
    }
    
    // Kelime geçerliliği kontrolü
    isValidWord(word) {
        if (!word || word.length < 2) return false;
        
        // Geçersiz kombinasyonları kontrol et
        for (const pattern of this.invalidCombinations) {
            if (pattern.test(word)) return false;
        }
        
        // En az bir ünlü olmalı
        const vowels = [...this.vowelHarmony.back, ...this.vowelHarmony.front];
        if (![...word].some(char => vowels.includes(char))) return false;
        
        return true;
    }
    
    getLastVowel(word) {
        for (let i = word.length - 1; i >= 0; i--) {
            const char = word[i].toLowerCase();
            if ([...this.vowelHarmony.back, ...this.vowelHarmony.front].includes(char)) {
                return char;
            }
        }
        return 'a'; // default
    }
    
    isBackVowel(vowel) {
        return this.vowelHarmony.back.includes(vowel);
    }
    
    isRoundedVowel(vowel) {
        return this.vowelHarmony.rounded.includes(vowel);
    }
    
    getLastConsonant(word) {
        for (let i = word.length - 1; i >= 0; i--) {
            const char = word[i].toLowerCase();
            if (!'aıoueiöü'.includes(char)) {
                return char;
            }
        }
        return '';
    }
    
    needsBuffer(word) {
        const lastChar = word.slice(-1).toLowerCase();
        const consonantClusters = ['st', 'sk', 'sp', 'kt', 'pt'];
        return consonantClusters.some(cluster => word.toLowerCase().endsWith(cluster));
    }
    
    getAccusativeEnding(word) {
        // Geçerlilik kontrolü
        if (!this.isValidWord(word)) {
            const corrected = dynamicLexicon.findClosestWord(word, dynamicLexicon.getWords('objects'));
            if (corrected) word = corrected;
            else return word; // Düzeltilemezse olduğu gibi döndür
        }
        
        // Özel durumları kontrol et
        if (this.specialCases[word]) {
            return this.specialCases[word];
        }
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        const isRounded = this.isRoundedVowel(lastVowel);
        
        if (isBack) {
            return word + (isRounded ? 'u' : 'ı');
        } else {
            return word + (isRounded ? 'ü' : 'i');
        }
    }
    
    getDativeEnding(word) {
        if (!this.isValidWord(word)) {
            const corrected = dynamicLexicon.findClosestWord(word, dynamicLexicon.getWords('objects'));
            if (corrected) word = corrected;
            else return word;
        }
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        return word + (isBack ? 'a' : 'e');
    }
    
    getLocativeEnding(word) {
        if (!this.isValidWord(word)) {
            const corrected = dynamicLexicon.findClosestWord(word, dynamicLexicon.getWords('locations'));
            if (corrected) word = corrected;
            else return word;
        }
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        const lastConsonant = this.getLastConsonant(word);
        
        // Voicing assimilation
        const voiceless = ['p', 't', 'k', 'ç', 'f', 's', 'ş', 'h'];
        const suffix = voiceless.includes(lastConsonant) ? 't' : 'd';
        
        return word + (isBack ? 'a' : 'e') + suffix;
    }
    
    getAblativeEnding(word) {
        if (!this.isValidWord(word)) {
            const corrected = dynamicLexicon.findClosestWord(word, dynamicLexicon.getWords('locations'));
            if (corrected) word = corrected;
            else return word;
        }
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        const lastConsonant = this.getLastConsonant(word);
        
        const voiceless = ['p', 't', 'k', 'ç', 'f', 's', 'ş', 'h'];
        const suffix = voiceless.includes(lastConsonant) ? 'tan' : 'dan';
        
        return word + (isBack ? 'a' : 'e') + suffix.slice(1);
    }
    
    getGenitiveEnding(word) {
        if (!this.isValidWord(word)) {
            const corrected = dynamicLexicon.findClosestWord(word, dynamicLexicon.getWords('subjects'));
            if (corrected) word = corrected;
            else return word;
        }
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        const isRounded = this.isRoundedVowel(lastVowel);
        
        if (isBack) {
            return word + (isRounded ? 'un' : 'ın');
        } else {
            return word + (isRounded ? 'ün' : 'in');
        }
    }
    
    getInstrumentalEnding(word) {
        if (!this.isValidWord(word)) {
            const corrected = dynamicLexicon.findClosestWord(word, dynamicLexicon.getWords('objects'));
            if (corrected) word = corrected;
            else return word;
        }
        
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        return word + (isBack ? 'la' : 'le');
    }
    
    addCase(word, role = 'nom') {
        // Önce kelimeyi sanitize et
        const sanitized = dynamicLexicon.sanitizeWord(word);
        if (!sanitized) return word;
        
        if (role === 'nom' || !this.caseEndingsAdvanced[role]) {
            return sanitized;
        }
        
        try {
            return this.caseEndingsAdvanced[role](sanitized);
        } catch (error) {
            console.warn(`Morfoloji hatası: ${word} -> ${role}`, error);
            return sanitized;
        }
    }
}

const morphologyEngine = new TurkishMorphologyEngine();

// ——————————————
// 3. Gelişmiş Scoring Engine (Yüksek Coherence Ağırlığı)
// ——————————————
class OptimizedScoringEngine {
    constructor() {
        this.coherenceCache = new Map();
        this.beamWidth = 3;
        this.dynamicLexicon = null;
        
        // Mood kontrollü ağırlıklar
        this.moodWeights = {
            high: { α: 2.5, β: 1.0, γ: 0.3, δ: 1.5 },    // Yüksek mood: Yüksek coherence
            medium: { α: 2.0, β: 0.8, γ: 0.5, δ: 1.2 },  // Orta mood: Dengeli
            low: { α: 3.0, β: 0.6, γ: 0.2, δ: 1.8 }      // Düşük mood: Çok yüksek coherence
        };
    }
    
    setDynamicLexicon(lexicon) {
        this.dynamicLexicon = lexicon;
    }
    
    getCacheKey(word, context, role, position) {
        return `${word}-${JSON.stringify(context)}-${role}-${position}`;
    }
    
    // Mood kontrolü ile ağırlık seçimi
    getMoodWeights(mood = 0.5) {
        if (mood < 0.3) return this.moodWeights.low;
        if (mood > 0.7) return this.moodWeights.high;
        return this.moodWeights.medium;
    }
    
    coherenceScore(word, contextEmbed, previousContext = [], useCache = true) {
        const cacheKey = this.getCacheKey(word, contextEmbed, 'coherence', previousContext.length);
        
        if (useCache && this.coherenceCache.has(cacheKey)) {
            return this.coherenceCache.get(cacheKey);
        }
        
        let score = 1.0;
        
        // Kelime geçerliliği bonusu
        if (morphologyEngine.isValidWord(word)) {
            score += 0.5;
        } else {
            score -= 1.0; // Geçersiz kelimeler için büyük ceza
        }
        
        // Başarı oranı bonusu
        const successRate = this.dynamicLexicon ? this.dynamicLexicon.getWordSuccess(word) : 0.5;
        score += successRate * 0.8;
        
        // Önceki kelimelerle semantik ilişki
        if (previousContext.length > 0) {
            const relatedWords = previousContext.filter(prevWord => 
                this.hasSemanticRelation(word, prevWord)
            );
            score += relatedWords.length * 0.3;
        }
        
        // Context embedding ile uyum (basit simulasyon)
        if (contextEmbed) {
            const contextScore = this.calculateContextAlignment(word, contextEmbed);
            score += contextScore * 0.4;
        }
        
        // Kelime uzunluğu bonusu (çok kısa veya çok uzun kelimeler cezalı)
        const idealLength = word.length >= 3 && word.length <= 10;
        score += idealLength ? 0.2 : -0.3;
        
        if (useCache) {
            this.coherenceCache.set(cacheKey, score);
        }
        
        return Math.max(0, score);
    }
    
    calculateContextAlignment(word, contextEmbed) {
        // Basit context alignment simulasyonu
        if (!contextEmbed || !contextEmbed.context) return 0;
        
        const contextWords = {
            'biological': ['bakteri', 'hücre', 'dna', 'enerji', 'protein', 'sentez'],
            'social': ['arkadaş', 'grup', 'paylaş', 'konuş', 'birlik', 'toplum'],
            'creative': ['hayal', 'sanat', 'yaratıcı', 'düşünce', 'fikir', 'özgün'],
            'scientific': ['keşif', 'araştır', 'analiz', 'gözlem', 'deney', 'veri'],
            'philosophical': ['anlam', 'varlık', 'düşünce', 'bilinç', 'ruh', 'zihin']
        };
        
        const contextType = contextEmbed.context.toLowerCase();
        const relevantWords = contextWords[contextType] || [];
        
        // Kelime ile context arasında benzerlik skoru
        const similarity = relevantWords.some(cw => 
            word.includes(cw) || cw.includes(word) || 
            this.dynamicLexicon.levenshteinDistance(word, cw) <= 2
        );
        
        return similarity ? 1.0 : 0.0;
    }
    
    infoScore(word) {
        if (!word || word.length < 2) return 0;
        
        // Bilgi içeriği = -log(kelime_uzunluğu_normalleştirilmiş)
        const normalizedLength = Math.min(word.length / 10, 1);
        const infoContent = -Math.log(normalizedLength + 0.1);
        
        // Türkçe karakter zenginliği bonusu
        const turkishChars = 'çğıöşü';
        const turkishCharCount = [...word].filter(char => turkishChars.includes(char)).length;
        const turkishBonus = turkishCharCount * 0.1;
        
        return Math.max(0, infoContent + turkishBonus);
    }
    
    surprisalScore(word, previousWords = []) {
        if (!word) return 1.0;
        
        // Kelime tekrarı cezası
        const repetitionCount = previousWords.filter(w => w === word).length;
        const repetitionPenalty = repetitionCount * 0.5;
        
        // Yaygın kelimeler daha az sürpriz
        const commonWords = ['bir', 'bu', 'şu', 'o', 'var', 'yok', 'çok', 'az'];
        const commonnessPenalty = commonWords.includes(word) ? 0.3 : 0;
        
        // Kelime uzunluğu ile sürpriz
        const lengthSurprise = Math.min(word.length / 15, 1);
        
        return Math.max(0, lengthSurprise - repetitionPenalty - commonnessPenalty);
    }
    
    morphCompatibilityScore(role, sentencePosition = 'middle', wordCategory = 'unknown') {
        let score = 1.0;
        
        // Rol uygunluğu
        const roleCompatibility = {
            'nom': { subjects: 1.5, verbs: 0.8, objects: 0.5 },
            'acc': { objects: 1.5, subjects: 0.3, verbs: 0.2 },
            'dat': { objects: 1.2, locations: 1.3, subjects: 0.4 },
            'loc': { locations: 1.8, objects: 0.8, subjects: 0.3 },
            'abl': { locations: 1.6, objects: 0.7, subjects: 0.3 },
            'gen': { subjects: 1.4, objects: 1.0, verbs: 0.2 },
            'ins': { objects: 1.3, subjects: 0.8, verbs: 0.5 }
        };
        
        if (roleCompatibility[role] && roleCompatibility[role][wordCategory]) {
            score *= roleCompatibility[role][wordCategory];
        }
        
        // Cümle pozisyon uygunluğu
        const positionBonus = {
            'start': { subjects: 0.5, verbs: -0.3, objects: -0.2 },
            'middle': { objects: 0.3, subjects: 0.1, verbs: -0.1 },
            'end': { verbs: 0.8, objects: 0.2, subjects: -0.3 }
        };
        
        if (positionBonus[sentencePosition] && positionBonus[sentencePosition][wordCategory]) {
            score += positionBonus[sentencePosition][wordCategory];
        }
        
        return Math.max(0, score);
    }
    
    beamSearchBest(candidates, contextEmbed, prevWords = [], role = 'nom', position = 'middle', mood = 0.5) {
        // Mood kontrollü ağırlıklar
        const weights = this.getMoodWeights(mood);
        const { α, β, γ, δ } = weights;
        
        // Önce adayları filtrele ve sanitize et
        const validCandidates = candidates
            .map(word => this.dynamicLexicon.sanitizeWord(word))
            .filter(word => word && morphologyEngine.isValidWord(word))
            .slice(0, 20); // Performans için sınırla
        
        if (validCandidates.length === 0) {
            return candidates[0] || 'kelime';
        }
        
        const scoredCandidates = validCandidates.map(word => {
            const wordCategory = this.getWordCategory(word);
            
            const coherence = α * this.coherenceScore(word, contextEmbed, prevWords, false);
            const info = β * this.infoScore(word);
            const surprisal = γ * this.surprisalScore(word, prevWords);
            const morphCompat = δ * this.morphCompatibilityScore(role, position, wordCategory);
            
            const totalScore = coherence + info - surprisal + morphCompat;
            
            return { word, score: totalScore, details: { coherence, info, surprisal, morphCompat } };
        });
        
        // Sort and return top beam width  
        const topCandidates = scoredCandidates
            .sort((a, b) => b.score - a.score)
            .slice(0, this.beamWidth);
        
        // Probabilistic selection from top candidates
        const totalScore = topCandidates.reduce((sum, c) => sum + Math.exp(c.score), 0);
        let random = Math.random() * totalScore;
        
        for (const candidate of topCandidates) {
            random -= Math.exp(candidate.score);
            if (random <= 0) {
                return candidate.word;
            }
        }
        
        return topCandidates[0]?.word || validCandidates[0];
    }
    
    getWordCategory(word) {
        for (const [category, words] of Object.entries(this.dynamicLexicon.baseWords)) {
            if (words.includes(word)) return category;
        }
        
        for (const [category, words] of Object.entries(this.dynamicLexicon.dynamicWords)) {
            if (words.has && words.has(word)) return category;
        }
        
        return 'unknown';
    }
    
    hasSemanticRelation(word1, word2) {
        const relations = {
            'biological': ['bakteri', 'hücre', 'dna', 'enerji', 'nefes', 'kalp'],
            'emotional': ['mutlu', 'hüzünlü', 'korkmuş', 'sevgi', 'umut', 'korku'],
            'nature': ['çiçek', 'yaprak', 'toprak', 'su', 'hava', 'rüzgar', 'yıldız'],
            'abstract': ['düşünce', 'hayal', 'rüya', 'gizem', 'anı', 'ruh', 'zihin'],
            'sensory': ['renk', 'koku', 'müzik', 'şarkı', 'ışık', 'gölge']
        };
        
        for (const [domain, relatedWords] of Object.entries(relations)) {
            if (relatedWords.includes(word1) && relatedWords.includes(word2)) {
                return true;
            }
        }
        
        // Levenshtein distance ile benzerlik kontrolü
        return this.dynamicLexicon.levenshteinDistance(word1, word2) <= 2;
    }
}

const scoringEngine = new OptimizedScoringEngine();
scoringEngine.setDynamicLexicon(dynamicLexicon);

// ——————————————
// 4. Advanced Sentence Composer with Punctuation & Style
// ——————————————
class AdvancedSentenceComposer {
    constructor() {
        this.punctuationPatterns = {
            excitement: ['!', '!!', '...!'],
            question: ['?', '??', '...?'],
            ellipsis: ['...', '…', '. . .'],
            emphasis: ['!', '.', '...'],
            doubt: ['...', '?', '...?']
        };
        
        this.styleModifiers = {
            intensity: ['çok', 'epey', 'oldukça', 'son derece'],
            temporal: ['şimdi', 'sonra', 'birden', 'yavaşça'],
            modal: ['belki', 'muhtemelen', 'kesinlikle', 'sanki'],
            connective: ['ancak', 'ama', 'fakat', 've', 'hem de']
        };
        
        this.sentenceTemplates = {
            simple: '{subject} {object} {verb}{punct}',
            complex: '{subject} {location} {object} {verb}{punct}',
            emotional: '{subject} {emotion} bir şekilde {object} {verb}{punct}',
            locative: '{subject} {fromLocation} {toLocation} {verb}{punct}',
            compound: '{subject} {object} {verb}, {conjunction} {subject2} {object2} {verb2}{punct}',
            temporal: '{temporal} {subject} {object} {verb}{punct}',
            modal: '{subject} {modal} {object} {verb}{punct}',
            intensive: '{subject} {intensity} {object} {verb}{punct}'
        };
    }
    
    selectPunctuation(emotionalTone = 'neutral', complexity = 'simple') {
        const patterns = this.punctuationPatterns;
        
        switch (emotionalTone) {
            case 'heyecanlı':
            case 'mutlu':
                return this.randomChoice(patterns.excitement);
            case 'meraklı':
            case 'şaşkın':
                return this.randomChoice(patterns.question);
            case 'hüzünlü':
            case 'endişeli':
                return this.randomChoice(patterns.ellipsis);
            case 'kararlı':
            case 'cesur':
                return this.randomChoice(patterns.emphasis);
            default:
                return Math.random() > 0.8 ? this.randomChoice(patterns.ellipsis) : '.';
        }
    }
    
    addStyleModifier(sentence, style = 'neutral') {
        if (Math.random() > 0.6) return sentence; // 40% chance to add modifier
        
        const modifiers = this.styleModifiers;
        let modifier = '';
        
        switch (style) {
            case 'intensive':
                modifier = this.randomChoice(modifiers.intensity);
                break;
            case 'temporal':
                modifier = this.randomChoice(modifiers.temporal);
                break;
            case 'modal':
                modifier = this.randomChoice(modifiers.modal);
                break;
            default:
                const categories = Object.keys(modifiers);
                const category = this.randomChoice(categories);
                modifier = this.randomChoice(modifiers[category]);
        }
        
        // Insert modifier at appropriate position
        const words = sentence.split(' ');
        if (modifier && words.length > 2) {
            words.splice(1, 0, modifier); // Insert after subject
            return words.join(' ');
        }
        
        return sentence;
    }
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

const sentenceComposer = new AdvancedSentenceComposer();

// ——————————————
// 5. Enhanced Sentence Generation Engine (Mood Kontrollü)
// ——————————————
async function generateEnhancedMorphSentence(contextEmbed = null, sentenceType = 'simple', options = {}) {
    const {
        emotionalTone = 'neutral',
        complexity = 'medium',
        consciousness = 0.5,
        enableStyle = true,
        enableComposition = true,
        mood = 0.5
    } = options;
    
    const prevWords = [];
    let sentence = '';
    
    // Mood kontrolü - düşük mood'da basit cümleler
    if (mood < 0.3) {
        sentenceType = 'simple';
        enableComposition = false;
    }
    
    // Advanced sentence type selection
    const advancedTypes = ['compound', 'temporal', 'modal', 'intensive'];
    if (enableComposition && Math.random() > 0.7 && complexity !== 'simple' && mood > 0.4) {
        sentenceType = sentenceComposer.randomChoice(advancedTypes);
    }
    
    switch (sentenceType) {
        case 'simple':
            sentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood);
            break;
        case 'complex':
            sentence = await generateAdvancedComplexSentence(contextEmbed, prevWords, emotionalTone, mood);
            break;
        case 'compound':
            sentence = await generateCompoundSentence(contextEmbed, prevWords, emotionalTone, mood);
            break;
        case 'temporal':
            sentence = await generateTemporalSentence(contextEmbed, prevWords, emotionalTone, mood);
            break;
        case 'modal':
            sentence = await generateModalSentence(contextEmbed, prevWords, emotionalTone, mood);
            break;
        case 'intensive':
            sentence = await generateIntensiveSentence(contextEmbed, prevWords, emotionalTone, mood);
            break;
        default:
            sentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood);
    }
    
    // Apply style modifications (mood kontrollü)
    if (enableStyle && mood > 0.3) {
        sentence = sentenceComposer.addStyleModifier(sentence, sentenceType);
    }
    
    // Add appropriate punctuation
    const punct = sentenceComposer.selectPunctuation(emotionalTone, complexity);
    if (!sentence.endsWith(punct) && !sentence.match(/[.!?…]$/)) {
        sentence += punct;
    }
    
    return sentence;
}

// Enhanced sentence generation functions (Mood parametreli)
async function generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood = 0.5) {
    const subject = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start',
        mood
    );
    prevWords.push(subject);
    
    const objectBase = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle',
        mood
    );
    const object = morphologyEngine.addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end',
        mood
    );
    prevWords.push(verb);
    
    return `${sentenceComposer.capitalize(subject)} ${object} ${verb}`;
}

async function generateCompoundSentence(contextEmbed, prevWords, emotionalTone, mood = 0.5) {
    // Generate two simple sentences and connect them
    const sentence1 = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood);
    
    const conjunction = sentenceComposer.randomChoice(dynamicLexicon.getWords('conjunctions'));
    
    // Generate second sentence with different subject
    const subject2 = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('subjects').filter(s => !prevWords.includes(s)), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start',
        mood
    );
    
    const objectBase2 = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        [...prevWords, subject2], 
        'acc', 
        'middle',
        mood
    );
    const object2 = morphologyEngine.addCase(objectBase2, 'acc');
    
    const verb2 = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        [...prevWords, subject2, object2], 
        'nom', 
        'end',
        mood
    );
    
    return `${sentence1}, ${conjunction} ${subject2} ${object2} ${verb2}`;
}

async function generateTemporalSentence(contextEmbed, prevWords, emotionalTone, mood = 0.5) {
    const temporal = sentenceComposer.randomChoice(dynamicLexicon.getWords('temporal'));
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood);
    
    return `${sentenceComposer.capitalize(temporal)} ${baseSentence.toLowerCase()}`;
}

async function generateModalSentence(contextEmbed, prevWords, emotionalTone, mood = 0.5) {
    const modal = sentenceComposer.randomChoice(['belki', 'muhtemelen', 'kesinlikle', 'sanki', 'galiba']);
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood);
    
    const words = baseSentence.split(' ');
    words.splice(1, 0, modal); // Insert after subject
    
    return words.join(' ');
}

async function generateIntensiveSentence(contextEmbed, prevWords, emotionalTone, mood = 0.5) {
    const intensity = sentenceComposer.randomChoice(dynamicLexicon.getWords('intensifiers'));
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone, mood);
    
    const words = baseSentence.split(' ');
    if (words.length >= 3) {
        words.splice(-2, 0, intensity); // Insert before verb
    }
    
    return words.join(' ');
}

async function generateAdvancedComplexSentence(contextEmbed, prevWords, emotionalTone, mood = 0.5) {
    const subject = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start',
        mood
    );
    prevWords.push(subject);
    
    const locationBase = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('locations'), 
        contextEmbed, 
        prevWords, 
        'loc', 
        'middle',
        mood
    );
    const location = morphologyEngine.addCase(locationBase, 'loc');
    prevWords.push(location);
    
    const objectBase = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle',
        mood
    );
    const object = morphologyEngine.addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end',
        mood
    );
    
    return `${sentenceComposer.capitalize(subject)} ${location} ${object} ${verb}`;
}

// ——————————————
// 6. Export & Global Access
// ——————————————
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateEnhancedMorphSentence,
        dynamicLexicon,
        morphologyEngine,
        scoringEngine,
        sentenceComposer
    };
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.generateEnhancedMorphSentence = generateEnhancedMorphSentence;
    window.dynamicLexicon = dynamicLexicon;
    window.morphologyEngine = morphologyEngine;
    window.scoringEngine = scoringEngine;
    window.sentenceComposer = sentenceComposer;
}

console.log('🚀 Enhanced Morphological Generator v2.7 loaded successfully! - Sıkılaştırılmış ve Filtrelenmiş');