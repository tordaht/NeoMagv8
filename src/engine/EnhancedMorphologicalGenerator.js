/**
 * 🚀 Enhanced Morphological Dialogue Generator v2.0
 * 
 * Önerilerinizi implement eden gelişmiş sistem:
 * 1. Dinamik Lexicon & Öğrenme
 * 2. Gelişmiş Punktuasyon & Stil
 * 3. Kompozisyon & Bağlaçlar
 * 4. Performance Optimizasyonu
 * 5. Türkçeye Özgü İnce Ayarlar
 * 6. Context Embedding (stub)
 */

// ——————————————
// 1. Gelişmiş Kelime Havuzları (Dinamik + Genişletilmiş)
// ——————————————
class DynamicLexicon {
    constructor() {
        this.baseWords = {
            subjects: ['bakteri', 'hücre', 'gezgin', 'dinozor', 'hayal', 'karınca', 'atom', 'kristal', 'çiçek', 'balık', 'ruh', 'zihin', 'kalp', 'nefes', 'yıldız'],
            verbs: ['sentezliyor', 'keşfediyor', 'dans ediyor', 'paylaşıyor', 'yıldızı görüyor', 'müzik yapıyor', 'rüya kuruyor', 'titreşiyor', 'parıldıyor', 'evrimleşiyor', 'fısıldıyor', 'büyülüyor', 'uyanıyor', 'hissediyor', 'anlıyor'],
            objects: ['enerji', 'dna', 'pizza', 'mikrofon', 'düşünce', 'vitamin', 'mineral', 'şarkı', 'renk', 'koku', 'anı', 'gizem', 'umut', 'korku', 'sevgi'],
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
    }
    
    addDynamicWord(category, word, successRate = 0.5) {
        if (this.dynamicWords[category]) {
            this.dynamicWords[category].add(word);
            this.wordSuccessRates.set(word, successRate);
        }
    }
    
    getWords(category) {
        const base = this.baseWords[category] || [];
        const dynamic = Array.from(this.dynamicWords[category] || []);
        return [...base, ...dynamic];
    }
    
    updateWordSuccess(word, success) {
        const current = this.wordSuccessRates.get(word) || 0.5;
        const updated = (current * 0.8) + (success * 0.2);
        this.wordSuccessRates.set(word, updated);
    }
    
    getWordSuccess(word) {
        return this.wordSuccessRates.get(word) || 0.5;
    }
}

// Global dynamic lexicon instance
const dynamicLexicon = new DynamicLexicon();

// ——————————————
// 2. Gelişmiş Morfoloji Engine (Daha Kapsamlı Türkçe Kuralları)
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
            // Vowel insertions
            'burun': 'burnu',
            'karın': 'karnı'
        };
        
        this.caseEndingsAdvanced = {
            nom: '',
            acc: this.getAccusativeEnding.bind(this),
            dat: this.getDativeEnding.bind(this),
            loc: this.getLocativeEnding.bind(this),
            abl: this.getAblativeEnding.bind(this),
            gen: this.getGenitiveEnding.bind(this),
            ins: this.getInstrumentalEnding.bind(this) // Araç hali
        };
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
        // Check special cases first
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
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        return word + (isBack ? 'a' : 'e');
    }
    
    getLocativeEnding(word) {
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        const lastConsonant = this.getLastConsonant(word);
        
        // Voicing assimilation
        const voiceless = ['p', 't', 'k', 'ç', 'f', 's', 'ş', 'h'];
        const suffix = voiceless.includes(lastConsonant) ? 't' : 'd';
        
        return word + (isBack ? 'a' : 'e') + suffix;
    }
    
    getAblativeEnding(word) {
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        const lastConsonant = this.getLastConsonant(word);
        
        const voiceless = ['p', 't', 'k', 'ç', 'f', 's', 'ş', 'h'];
        const suffix = voiceless.includes(lastConsonant) ? 'tan' : 'dan';
        
        return word + (isBack ? 'a' : 'e') + suffix.slice(1); // Remove 'a'/'e' if already added
    }
    
    getGenitiveEnding(word) {
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
        const lastVowel = this.getLastVowel(word);
        const isBack = this.isBackVowel(lastVowel);
        return word + (isBack ? 'la' : 'le');
    }
    
    addCase(word, role = 'nom') {
        if (role === 'nom') return word;
        
        const endingFunc = this.caseEndingsAdvanced[role];
        if (typeof endingFunc === 'function') {
            return endingFunc(word);
        }
        
        return word; // fallback
    }
}

const morphologyEngine = new TurkishMorphologyEngine();

// ——————————————
// 3. Performance-Optimized Scoring System
// ——————————————
class OptimizedScoringEngine {
    constructor() {
        this.scoreCache = new Map(); // Memoization
        this.contextEmbedCache = new Map();
        this.beamWidth = 5; // Beam search width
        this.dynamicLexicon = null;
    }
    
    setDynamicLexicon(lexicon) {
        this.dynamicLexicon = lexicon;
    }
    
    getCacheKey(word, context, role, position) {
        return `${word}|${context}|${role}|${position}`;
    }
    
    coherenceScore(word, contextEmbed, previousContext = [], useCache = true) {
        const cacheKey = this.getCacheKey(word, JSON.stringify(contextEmbed), 'coherence', '');
        
        if (useCache && this.scoreCache.has(cacheKey)) {
            return this.scoreCache.get(cacheKey);
        }
        
        let score = 1.0;
        
        // Enhanced contextual scoring
        if (contextEmbed && contextEmbed.topWords) {
            const topWords = contextEmbed.topWords;
            const wordInContext = topWords.find(w => w.word === word);
            if (wordInContext) {
                score += wordInContext.frequency * 0.5;
            }
        }
        
        // Previous context coherence
        if (previousContext.length > 0) {
            const lastWord = previousContext[previousContext.length - 1];
            const wordCategory = this.getWordCategory(word);
            const lastCategory = this.getWordCategory(lastWord);
            
            if (wordCategory === lastCategory) {
                score += 0.3;
            }
            
            if (this.hasSemanticRelation(word, lastWord)) {
                score += 0.5;
            }
        }
        
        // Dynamic success rate bonus
        const successRate = this.dynamicLexicon.getWordSuccess(word);
        score += (successRate - 0.5) * 0.4; // Boost/penalize based on past success
        
        if (useCache) {
            this.scoreCache.set(cacheKey, score);
        }
        
        return score;
    }
    
    infoScore(word) {
        // Enhanced information scoring with dynamic learning
        const allWords = Object.values(this.dynamicLexicon.baseWords).flat();
        const dynamicWords = Object.values(this.dynamicLexicon.dynamicWords).flat();
        const totalWords = [...allWords, ...dynamicWords];
        
        const frequency = totalWords.filter(w => w === word).length;
        const totalCount = totalWords.length;
        
        // Shannon information with smoothing
        const probability = (frequency + 1) / (totalCount + totalWords.length);
        const infoValue = -Math.log(probability);
        
        // Bonus for successful dynamic words
        const successBonus = this.dynamicLexicon.getWordSuccess(word) > 0.7 ? 0.3 : 0;
        
        return infoValue + successBonus;
    }
    
    surprisalScore(word, previousWords = []) {
        if (previousWords.length === 0) {
            return Math.random() * 0.3;
        }
        
        const lastWord = previousWords[previousWords.length - 1];
        const wordCategory = this.getWordCategory(word);
        const lastCategory = this.getWordCategory(lastWord);
        
        // Enhanced surprisal with context awareness
        let surprisal = 0.2; // Base surprisal
        
        if (wordCategory !== lastCategory) {
            surprisal += 0.4; // Category change surprisal
        }
        
        // Semantic distance surprisal
        if (!this.hasSemanticRelation(word, lastWord)) {
            surprisal += 0.3;
        }
        
        // Add some randomness but controlled
        surprisal += Math.random() * 0.2;
        
        return surprisal;
    }
    
    morphCompatibilityScore(role, sentencePosition = 'middle', wordCategory = 'unknown') {
        const roleScores = {
            'nom': 1.0, 'acc': 1.2, 'dat': 0.9, 'loc': 0.8, 'abl': 0.7, 'gen': 0.6, 'ins': 0.7
        };
        
        let score = roleScores[role] || 1.0;
        
        // Position-specific bonuses
        const positionBonuses = {
            'start': { 'nom': 0.3, 'gen': 0.2 },
            'middle': { 'acc': 0.2, 'dat': 0.15, 'loc': 0.1 },
            'end': { 'ins': 0.1, 'abl': 0.1 }
        };
        
        if (positionBonuses[sentencePosition] && positionBonuses[sentencePosition][role]) {
            score += positionBonuses[sentencePosition][role];
        }
        
        // Category-specific bonuses
        const categoryBonuses = {
            'objects': { 'acc': 0.2, 'dat': 0.1 },
            'locations': { 'loc': 0.3, 'abl': 0.2, 'dat': 0.1 },
            'subjects': { 'nom': 0.2, 'gen': 0.1 }
        };
        
        if (categoryBonuses[wordCategory] && categoryBonuses[wordCategory][role]) {
            score += categoryBonuses[wordCategory][role];
        }
        
        return score;
    }
    
    // Beam search for optimal word selection
    beamSearchBest(candidates, contextEmbed, prevWords = [], role = 'nom', position = 'middle') {
        const α = 1.0, β = 0.8, γ = 0.6, δ = 1.2;
        
        const scoredCandidates = candidates.map(word => {
            const wordCategory = this.getWordCategory(word);
            
            const coherence = α * this.coherenceScore(word, contextEmbed, prevWords);
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
        
        return topCandidates[0]?.word || candidates[0];
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
        
        return false;
    }
}

const scoringEngine = new OptimizedScoringEngine();

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
// 5. Enhanced Sentence Generation Engine
// ——————————————
async function generateEnhancedMorphSentence(contextEmbed = null, sentenceType = 'simple', options = {}) {
    const {
        emotionalTone = 'neutral',
        complexity = 'medium',
        consciousness = 0.5,
        enableStyle = true,
        enableComposition = true
    } = options;
    
    const prevWords = [];
    let sentence = '';
    
    // Advanced sentence type selection
    const advancedTypes = ['compound', 'temporal', 'modal', 'intensive'];
    if (enableComposition && Math.random() > 0.7 && complexity !== 'simple') {
        sentenceType = sentenceComposer.randomChoice(advancedTypes);
    }
    
    switch (sentenceType) {
        case 'simple':
            sentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'complex':
            sentence = await generateAdvancedComplexSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'emotional':
            sentence = await generateAdvancedEmotionalSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'locative':
            sentence = await generateAdvancedLocativeSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'compound':
            sentence = await generateCompoundSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'temporal':
            sentence = await generateTemporalSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'modal':
            sentence = await generateModalSentence(contextEmbed, prevWords, emotionalTone);
            break;
        case 'intensive':
            sentence = await generateIntensiveSentence(contextEmbed, prevWords, emotionalTone);
            break;
        default:
            sentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    }
    
    // Apply style modifications
    if (enableStyle) {
        sentence = sentenceComposer.addStyleModifier(sentence, sentenceType);
    }
    
    // Add appropriate punctuation
    const punct = sentenceComposer.selectPunctuation(emotionalTone, complexity);
    if (!sentence.endsWith(punct) && !sentence.match(/[.!?…]$/)) {
        sentence += punct;
    }
    
    return sentence;
}

// Enhanced sentence generation functions
async function generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone) {
    const subject = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    prevWords.push(subject);
    
    const objectBase = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle'
    );
    const object = morphologyEngine.addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end'
    );
    prevWords.push(verb);
    
    return `${sentenceComposer.capitalize(subject)} ${object} ${verb}`;
}

async function generateCompoundSentence(contextEmbed, prevWords, emotionalTone) {
    // Generate two simple sentences and connect them
    const sentence1 = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    const conjunction = sentenceComposer.randomChoice(dynamicLexicon.getWords('conjunctions'));
    
    // Generate second sentence with different subject
    const subject2 = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('subjects').filter(s => !prevWords.includes(s)), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    
    const objectBase2 = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        [...prevWords, subject2], 
        'acc', 
        'middle'
    );
    const object2 = morphologyEngine.addCase(objectBase2, 'acc');
    
    const verb2 = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        [...prevWords, subject2, object2], 
        'nom', 
        'end'
    );
    
    return `${sentence1}, ${conjunction} ${subject2} ${object2} ${verb2}`;
}

async function generateTemporalSentence(contextEmbed, prevWords, emotionalTone) {
    const temporal = sentenceComposer.randomChoice(dynamicLexicon.getWords('temporal'));
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    return `${sentenceComposer.capitalize(temporal)} ${baseSentence.toLowerCase()}`;
}

async function generateModalSentence(contextEmbed, prevWords, emotionalTone) {
    const modal = sentenceComposer.randomChoice(['belki', 'muhtemelen', 'kesinlikle', 'sanki', 'galiba']);
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    const words = baseSentence.split(' ');
    words.splice(1, 0, modal); // Insert after subject
    
    return words.join(' ');
}

async function generateIntensiveSentence(contextEmbed, prevWords, emotionalTone) {
    const intensity = sentenceComposer.randomChoice(dynamicLexicon.getWords('intensifiers'));
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    const words = baseSentence.split(' ');
    if (words.length >= 3) {
        words.splice(-2, 0, intensity); // Insert before verb
    }
    
    return words.join(' ');
}

async function generateAdvancedComplexSentence(contextEmbed, prevWords, emotionalTone) {
    const subject = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    prevWords.push(subject);
    
    const locationBase = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('locations'), 
        contextEmbed, 
        prevWords, 
        'loc', 
        'middle'
    );
    const location = morphologyEngine.addCase(locationBase, 'loc');
    prevWords.push(location);
    
    const objectBase = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle'
    );
    const object = morphologyEngine.addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = scoringEngine.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end'
    );
    
    return `${sentenceComposer.capitalize(subject)} ${location} ${object} ${verb}`