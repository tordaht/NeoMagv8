// morphologicalDialogueGenerator.js

// ——————————————
// 1. Gelişmiş Dinamik Kelime Havuzları 🚀
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
        
        this.wordSuccessRates = new Map(); // Track success for adaptation
        this.contextFrequency = new Map(); // Track context usage
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
        const updated = (current * 0.8) + (success * 0.2); // Weighted update
        this.wordSuccessRates.set(word, updated);
    }
    
    getWordSuccess(word) {
        return this.wordSuccessRates.get(word) || 0.5;
    }
}

// Global dynamic lexicon instance
const dynamicLexicon = new DynamicLexicon();

// Backward compatibility
const LEXICON = {
    subjects: dynamicLexicon.getWords('subjects'),
    verbs: dynamicLexicon.getWords('verbs'),
    objects: dynamicLexicon.getWords('objects'),
    emotions: dynamicLexicon.getWords('emotions'),
    locations: dynamicLexicon.getWords('locations')
};

// ——————————————
// 2. Genişletilmiş Morfoloji: Türkçe Ünlü Uyumu ile Ek Ekleme
// ——————————————
const VOWELS_BACK = ['a','ı','o','u'];
const VOWELS_FRONT = ['e','i','ö','ü'];

function getLastVowel(word) {
  for (let i = word.length - 1; i >= 0; i--) {
    if (VOWELS_BACK.includes(word[i]) || VOWELS_FRONT.includes(word[i])) {
      return word[i];
    }
  }
  return 'a'; // default
}

function addCase(noun, role) {
  // role: 'nom' | 'acc' | 'dat' | 'loc' | 'abl' | 'gen'
  const lastVowel = getLastVowel(noun);
  const isBack = VOWELS_BACK.includes(lastVowel);
  const isRounded = ['o','u','ö','ü'].includes(lastVowel);
  
  switch(role) {
    case 'acc': // –ı/–i/–u/–ü
      if (isBack) {
        return noun + (isRounded ? 'u' : 'ı');
      } else {
        return noun + (isRounded ? 'ü' : 'i');
      }
    case 'dat': // –a/–e
      return noun + (isBack ? 'a' : 'e');
    case 'loc': // –da/–de
      return noun + (isBack ? 'da' : 'de');
    case 'abl': // –dan/–den
      return noun + (isBack ? 'dan' : 'den');
    case 'gen': // –ın/–in/–un/–ün
      if (isBack) {
        return noun + (isRounded ? 'un' : 'ın');
      } else {
        return noun + (isRounded ? 'ün' : 'in');
      }
    default:    // nom: yalın hali
      return noun;
  }
}

// ——————————————
// 3. Gelişmiş Skorlama Fonksiyonları
// ——————————————
function coherenceScore(word, contextEmbed, previousContext = []) {
  // Bağlam ile uyum skorlaması
  let score = 1.0;
  
  // Önceki kelimelerle anlamsal uyum
  if (previousContext.length > 0) {
    const lastWord = previousContext[previousContext.length - 1];
    
    // Kelime kategorisi uyumu
    const wordCategory = getWordCategory(word);
    const lastCategory = getWordCategory(lastWord);
    
    if (wordCategory === lastCategory) {
      score += 0.3; // Aynı kategori bonus
    }
    
    // Anlamsal yakınlık (basit heuristic)
    if (hasSemanticRelation(word, lastWord)) {
      score += 0.5;
    }
  }
  
  return score;
}

function infoScore(word) {
  // Bilgi değeri skorlaması (daha nadir kelimeler daha yüksek skor)
  const allWords = Object.values(LEXICON).flat();
  const frequency = allWords.filter(w => w === word).length;
  const totalWords = allWords.length;
  
  // Shannon information: -log(p)
  const probability = frequency / totalWords;
  return -Math.log(probability + 0.001); // +0.001 to avoid log(0)
}

function surprisalScore(word, previousWords = []) {
  // Sürpriz değeri skorlaması
  if (previousWords.length === 0) {
    return Math.random() * 0.3; // Başlangıç sürprizi
  }
  
  const lastWord = previousWords[previousWords.length - 1];
  const wordCategory = getWordCategory(word);
  const lastCategory = getWordCategory(lastWord);
  
  // Beklenmedik kategori geçişleri daha yüksek sürpriz
  if (wordCategory !== lastCategory) {
    return Math.random() * 0.7;
  }
  
  return Math.random() * 0.2;
}

function morphCompatibilityScore(role, sentencePosition = 'middle') {
  // Morfolojik uyum skorlaması
  const roleScores = {
    'nom': 1.0,  // Özne için ideal
    'acc': 1.2,  // Nesne için ideal
    'dat': 0.9,  // Dolaylı nesne
    'loc': 0.8,  // Yer belirtme
    'abl': 0.7,  // Çıkma hali
    'gen': 0.6   // İlgi hali
  };
  
  let score = roleScores[role] || 1.0;
  
  // Cümle pozisyonu bonusu
  if (sentencePosition === 'start' && role === 'nom') {
    score += 0.3; // Cümle başında özne bonusu
  } else if (sentencePosition === 'middle' && role === 'acc') {
    score += 0.2; // Cümle ortasında nesne bonusu
  }
  
  return score;
}

// ——————————————
// 4. Yardımcı Fonksiyonlar
// ——————————————
function getWordCategory(word) {
  for (const [category, words] of Object.entries(LEXICON)) {
    if (words.includes(word)) {
      return category;
    }
  }
  return 'unknown';
}

function hasSemanticRelation(word1, word2) {
  // Basit anlamsal ilişki kontrolü
  const relations = {
    'bakteri': ['hücre', 'dna', 'enerji', 'laboratuvar'],
    'müzik': ['şarkı', 'mikrofon', 'dans'],
    'doğa': ['çiçek', 'yaprak', 'toprak', 'su', 'hava'],
    'bilim': ['atom', 'kristal', 'laboratuvar', 'keşif']
  };
  
  for (const [concept, relatedWords] of Object.entries(relations)) {
    if (relatedWords.includes(word1) && relatedWords.includes(word2)) {
      return true;
    }
  }
  
  return false;
}

// ——————————————
// 5. 🚀 Performance-Optimized Scoring with Beam Search
// ——————————————
class OptimizedScoringEngine {
    constructor() {
        this.scoreCache = new Map(); // Memoization for performance
        this.beamWidth = 5; // Beam search width
    }
    
    // Enhanced scoring with dynamic learning integration
    coherenceScoreEnhanced(word, contextEmbed, previousContext = []) {
        let score = 1.0;
        
        // Enhanced contextual scoring
        if (contextEmbed && contextEmbed.topWords) {
            const wordInContext = contextEmbed.topWords.find(w => w.word === word);
            if (wordInContext) {
                score += wordInContext.frequency * 0.5;
            }
        }
        
        // Previous context coherence
        if (previousContext.length > 0) {
            const lastWord = previousContext[previousContext.length - 1];
            const wordCategory = getWordCategory(word);
            const lastCategory = getWordCategory(lastWord);
            
            if (wordCategory === lastCategory) {
                score += 0.3;
            }
            
            if (hasSemanticRelation(word, lastWord)) {
                score += 0.5;
            }
        }
        
        // Dynamic success rate bonus
        const successRate = dynamicLexicon.getWordSuccess(word);
        score += (successRate - 0.5) * 0.4; // Boost/penalize based on past success
        
        return score;
    }
    
    // Enhanced info score with dynamic learning
    infoScoreEnhanced(word) {
        const allWords = Object.values(dynamicLexicon.baseWords).flat();
        const dynamicWords = Object.values(dynamicLexicon.dynamicWords).map(s => Array.from(s)).flat();
        const totalWords = [...allWords, ...dynamicWords];
        
        const frequency = totalWords.filter(w => w === word).length;
        const totalCount = totalWords.length;
        
        // Shannon information with smoothing
        const probability = (frequency + 1) / (totalCount + totalWords.length);
        const infoValue = -Math.log(probability);
        
        // Bonus for successful dynamic words
        const successBonus = dynamicLexicon.getWordSuccess(word) > 0.7 ? 0.3 : 0;
        
        return infoValue + successBonus;
    }
    
    // Beam search for optimal word selection
    beamSearchBest(candidates, contextEmbed, prevWords = [], role = 'nom', position = 'middle') {
        const α = 1.0, β = 0.8, γ = 0.6, δ = 1.2;
        
        const scoredCandidates = candidates.map(word => {
            const coherence = α * this.coherenceScoreEnhanced(word, contextEmbed, prevWords);
            const info = β * this.infoScoreEnhanced(word);
            const surprisal = γ * surprisalScore(word, prevWords);
            const morphCompat = δ * morphCompatibilityScore(role, position);
            
            const totalScore = coherence + info - surprisal + morphCompat;
            
            return { word, score: totalScore, details: { coherence, info, surprisal, morphCompat } };
        });
        
        // Sort and return top beam width
        const topCandidates = scoredCandidates
            .sort((a, b) => b.score - a.score)
            .slice(0, this.beamWidth);
        
        if (topCandidates.length === 0) return candidates[0];
        
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
}

const optimizedScoring = new OptimizedScoringEngine();

// ——————————————
// 🎨 Advanced Sentence Composer with Punctuation & Style
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
}

const sentenceComposer = new AdvancedSentenceComposer();

// Backward compatibility function
function pickBest(candidates, contextEmbed, prevWords = [], role = 'nom', position = 'middle') {
    return optimizedScoring.beamSearchBest(candidates, contextEmbed, prevWords, role, position);
}

// ——————————————
// 6. Gelişmiş Cümle Üretimi
// ——————————————
async function generateMorphSentence(contextEmbed = null, sentenceType = 'simple') {
  const prevWords = [];
  let sentence = '';
  
  switch (sentenceType) {
    case 'simple':
      sentence = await generateSimpleSentence(contextEmbed, prevWords);
      break;
    case 'complex':
      sentence = await generateComplexSentence(contextEmbed, prevWords);
      break;
    case 'emotional':
      sentence = await generateEmotionalSentence(contextEmbed, prevWords);
      break;
    case 'locative':
      sentence = await generateLocativeSentence(contextEmbed, prevWords);
      break;
    default:
      sentence = await generateSimpleSentence(contextEmbed, prevWords);
  }
  
  return sentence;
}

async function generateSimpleSentence(contextEmbed, prevWords) {
  // SOV: Özne + Nesne + Fiil
  
  // Özne seçimi
  const subject = pickBest(LEXICON.subjects, contextEmbed, prevWords, 'nom', 'start');
  prevWords.push(subject);
  
  // Nesne seçimi ve durum eki
  const objectBase = pickBest(LEXICON.objects, contextEmbed, prevWords, 'acc', 'middle');
  const object = addCase(objectBase, 'acc');
  prevWords.push(object);
  
  // Fiil seçimi
  const verb = pickBest(LEXICON.verbs, contextEmbed, prevWords, 'nom', 'end');
  prevWords.push(verb);
  
  return `${capitalize(subject)} ${object} ${verb}.`;
}

async function generateComplexSentence(contextEmbed, prevWords) {
  // Özne + Yer + Nesne + Fiil
  
  const subject = pickBest(LEXICON.subjects, contextEmbed, prevWords, 'nom', 'start');
  prevWords.push(subject);
  
  const locationBase = pickBest(LEXICON.locations, contextEmbed, prevWords, 'loc', 'middle');
  const location = addCase(locationBase, 'loc');
  prevWords.push(location);
  
  const objectBase = pickBest(LEXICON.objects, contextEmbed, prevWords, 'acc', 'middle');
  const object = addCase(objectBase, 'acc');
  prevWords.push(object);
  
  const verb = pickBest(LEXICON.verbs, contextEmbed, prevWords, 'nom', 'end');
  prevWords.push(verb);
  
  return `${capitalize(subject)} ${location} ${object} ${verb}.`;
}

async function generateEmotionalSentence(contextEmbed, prevWords) {
  // Duygusal Özne + Nesne + Fiil
  
  const subject = pickBest(LEXICON.subjects, contextEmbed, prevWords, 'nom', 'start');
  prevWords.push(subject);
  
  const emotion = pickBest(LEXICON.emotions, contextEmbed, prevWords, 'nom', 'middle');
  prevWords.push(emotion);
  
  const objectBase = pickBest(LEXICON.objects, contextEmbed, prevWords, 'acc', 'middle');
  const object = addCase(objectBase, 'acc');
  prevWords.push(object);
  
  const verb = pickBest(LEXICON.verbs, contextEmbed, prevWords, 'nom', 'end');
  prevWords.push(verb);
  
  return `${capitalize(subject)} ${emotion} bir şekilde ${object} ${verb}.`;
}

async function generateLocativeSentence(contextEmbed, prevWords) {
  // Özne + Yerden + Yere + Fiil (Ablative + Dative)
  
  const subject = pickBest(LEXICON.subjects, contextEmbed, prevWords, 'nom', 'start');
  prevWords.push(subject);
  
  const fromLocationBase = pickBest(LEXICON.locations, contextEmbed, prevWords, 'abl', 'middle');
  const fromLocation = addCase(fromLocationBase, 'abl');
  prevWords.push(fromLocation);
  
  const toLocationBase = pickBest(LEXICON.locations, contextEmbed, prevWords, 'dat', 'middle');
  const toLocation = addCase(toLocationBase, 'dat');
  prevWords.push(toLocation);
  
  const verb = pickBest(['gidiyor', 'uçuyor', 'yüzüyor', 'koşuyor', 'sıçrıyor'], contextEmbed, prevWords, 'nom', 'end');
  prevWords.push(verb);
  
  return `${capitalize(subject)} ${fromLocation} ${toLocation} ${verb}.`;
}

// ——————————————
// 7. Yardımcı Fonksiyon
// ——————————————
function capitalize(s) { 
  return s.charAt(0).toUpperCase() + s.slice(1); 
}

// ——————————————
// 8. Çoklu Cümle Üretimi
// ——————————————
async function generateMorphDialogue(sentences = 3, contextEmbed = null) {
  const dialogue = [];
  const types = ['simple', 'complex', 'emotional', 'locative'];
  
  for (let i = 0; i < sentences; i++) {
    const randomType = types[Math.floor(Math.random() * types.length)];
    const sentence = await generateMorphSentence(contextEmbed, randomType);
    dialogue.push(sentence);
  }
  
  return dialogue.join(' ');
}

// ——————————————
// 9. Örnek Kullanım ve Test
// ——————————————
async function testMorphologicalGenerator() {
  console.log('=== Morfolojik Diyalog Üretici Test ===\n');
  
  const sentenceTypes = ['simple', 'complex', 'emotional', 'locative'];
  
  for (const type of sentenceTypes) {
    console.log(`${type.toUpperCase()} Cümle:`);
    const sentence = await generateMorphSentence(null, type);
    console.log(sentence);
    console.log('');
  }
  
  console.log('DIYALOG:');
  const dialogue = await generateMorphDialogue(4);
  console.log(dialogue);
}

// ——————————————
// 🚀 Enhanced Generation Functions with All Improvements
// ——————————————

/**
 * Enhanced morphological sentence generation with style and punctuation
 */
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
    
    // Update dynamic lexicon with usage
    const words = sentence.split(/\s+/);
    words.forEach(word => {
        const cleanWord = word.replace(/[.,!?…]/g, '');
        if (cleanWord.length > 2) {
            dynamicLexicon.updateWordSuccess(cleanWord, 0.7 + Math.random() * 0.3);
        }
    });
    
    return sentence;
}

/**
 * Enhanced dialogue generation with emotional progression
 */
async function generateEnhancedMorphDialogue(sentences = 3, contextEmbed = null, options = {}) {
    const {
        emotionalProgression = true,
        narrativeCoherence = true,
        styleDiversity = true
    } = options;
    
    const dialogue = [];
    const dialogueContext = [];
    
    // Emotional progression pattern
    const emotionalStates = ['neutral', 'meraklı', 'heyecanlı', 'mutlu', 'sakin'];
    let currentEmotion = 'neutral';
    
    for (let i = 0; i < sentences; i++) {
        // Emotional progression
        if (emotionalProgression && Math.random() > 0.5) {
            currentEmotion = sentenceComposer.randomChoice(emotionalStates);
        }
        
        // Sentence type diversity
        const types = ['simple', 'complex', 'emotional', 'locative', 'compound', 'temporal'];
        let sentenceType = 'simple';
        
        if (styleDiversity) {
            if (i === 0) {
                sentenceType = sentenceComposer.randomChoice(['simple', 'temporal', 'modal']);
            } else if (i === sentences - 1) {
                sentenceType = sentenceComposer.randomChoice(['emotional', 'intensive', 'compound']);
            } else {
                sentenceType = sentenceComposer.randomChoice(types);
            }
        }
        
        // Generate with enhanced context
        const enhancedContextEmbed = narrativeCoherence 
            ? enhanceContextWithDialogueHistory(contextEmbed, dialogueContext)
            : contextEmbed;
        
        const sentenceOptions = {
            emotionalTone: currentEmotion,
            complexity: i > 0 ? 'complex' : 'medium',
            consciousness: 0.6 + (i * 0.1), // Progressive consciousness
            enableStyle: styleDiversity,
            enableComposition: i > 0
        };
        
        const sentence = await generateEnhancedMorphSentence(
            enhancedContextEmbed, 
            sentenceType, 
            sentenceOptions
        );
        
        dialogue.push(sentence);
        dialogueContext.push({
            sentence,
            emotion: currentEmotion,
            type: sentenceType,
            position: i
        });
    }
    
    return dialogue.join(' ');
}

// Enhanced sentence generation functions
async function generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone) {
    const subject = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    prevWords.push(subject);
    
    const objectBase = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle'
    );
    const object = addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end'
    );
    
    return `${capitalize(subject)} ${object} ${verb}`;
}

async function generateCompoundSentence(contextEmbed, prevWords, emotionalTone) {
    // Generate two simple sentences and connect them
    const sentence1 = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    const conjunction = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('conjunctions'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'middle'
    );
    
    // Generate second sentence with different subject
    const subject2 = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('subjects').filter(s => !prevWords.includes(s)), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    
    const objectBase2 = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        [...prevWords, subject2], 
        'acc', 
        'middle'
    );
    const object2 = addCase(objectBase2, 'acc');
    
    const verb2 = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        [...prevWords, subject2, object2], 
        'nom', 
        'end'
    );
    
    return `${sentence1}, ${conjunction} ${subject2} ${object2} ${verb2}`;
}

async function generateTemporalSentence(contextEmbed, prevWords, emotionalTone) {
    const temporal = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('temporal'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    return `${capitalize(temporal)} ${baseSentence.toLowerCase()}`;
}

async function generateModalSentence(contextEmbed, prevWords, emotionalTone) {
    const modal = sentenceComposer.randomChoice(['belki', 'muhtemelen', 'kesinlikle', 'sanki', 'galiba']);
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    const words = baseSentence.split(' ');
    words.splice(1, 0, modal); // Insert after subject
    
    return words.join(' ');
}

async function generateIntensiveSentence(contextEmbed, prevWords, emotionalTone) {
    const intensity = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('intensifiers'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'middle'
    );
    const baseSentence = await generateAdvancedSimpleSentence(contextEmbed, prevWords, emotionalTone);
    
    const words = baseSentence.split(' ');
    if (words.length >= 3) {
        words.splice(-2, 0, intensity); // Insert before verb
    }
    
    return words.join(' ');
}

async function generateAdvancedComplexSentence(contextEmbed, prevWords, emotionalTone) {
    const subject = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    prevWords.push(subject);
    
    const locationBase = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('locations'), 
        contextEmbed, 
        prevWords, 
        'loc', 
        'middle'
    );
    const location = addCase(locationBase, 'loc');
    prevWords.push(location);
    
    const objectBase = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle'
    );
    const object = addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end'
    );
    
    return `${capitalize(subject)} ${location} ${object} ${verb}`;
}

async function generateAdvancedEmotionalSentence(contextEmbed, prevWords, emotionalTone) {
    const subject = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    prevWords.push(subject);
    
    const emotion = emotionalTone !== 'neutral' 
        ? emotionalTone 
        : optimizedScoring.beamSearchBest(
            dynamicLexicon.getWords('emotions'), 
            contextEmbed, 
            prevWords, 
            'nom', 
            'middle'
        );
    prevWords.push(emotion);
    
    const objectBase = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('objects'), 
        contextEmbed, 
        prevWords, 
        'acc', 
        'middle'
    );
    const object = addCase(objectBase, 'acc');
    prevWords.push(object);
    
    const verb = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('verbs'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end'
    );
    
    return `${capitalize(subject)} ${emotion} bir şekilde ${object} ${verb}`;
}

async function generateAdvancedLocativeSentence(contextEmbed, prevWords, emotionalTone) {
    const subject = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('subjects'), 
        contextEmbed, 
        prevWords, 
        'nom', 
        'start'
    );
    prevWords.push(subject);
    
    const fromLocationBase = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('locations'), 
        contextEmbed, 
        prevWords, 
        'abl', 
        'middle'
    );
    const fromLocation = addCase(fromLocationBase, 'abl');
    prevWords.push(fromLocation);
    
    const toLocationBase = optimizedScoring.beamSearchBest(
        dynamicLexicon.getWords('locations').filter(l => l !== fromLocationBase), 
        contextEmbed, 
        prevWords, 
        'dat', 
        'middle'
    );
    const toLocation = addCase(toLocationBase, 'dat');
    prevWords.push(toLocation);
    
    const verb = optimizedScoring.beamSearchBest(
        ['gidiyor', 'uçuyor', 'yüzüyor', 'koşuyor', 'sıçrıyor', 'atlıyor', 'süzülüyor'], 
        contextEmbed, 
        prevWords, 
        'nom', 
        'end'
    );
    
    return `${capitalize(subject)} ${fromLocation} ${toLocation} ${verb}`;
}

function enhanceContextWithDialogueHistory(contextEmbed, dialogueContext) {
    if (!contextEmbed || dialogueContext.length === 0) return contextEmbed;
    
    // Extract words from dialogue history
    const historyWords = dialogueContext.flatMap(item => 
        item.sentence.split(/\s+/).map(word => word.replace(/[.,!?…]/g, ''))
    );
    
    // Create enhanced context
    const enhancedEmbed = { ...contextEmbed };
    
    if (enhancedEmbed.topWords) {
        // Boost words that appeared in dialogue
        enhancedEmbed.topWords = enhancedEmbed.topWords.map(wordInfo => {
            if (historyWords.includes(wordInfo.word)) {
                return { ...wordInfo, frequency: wordInfo.frequency * 1.2 };
            }
            return wordInfo;
        });
    }
    
    // Add dialogue coherence info
    enhancedEmbed.dialogueHistory = dialogueContext;
    enhancedEmbed.dominantEmotion = getMostFrequentEmotion(dialogueContext);
    
    return enhancedEmbed;
}

function getMostFrequentEmotion(dialogueContext) {
    const emotionCounts = {};
    dialogueContext.forEach(item => {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });
    
    return Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b
    ) || 'neutral';
}

/**
 * Enhanced testing function with all new features
 */
async function testEnhancedMorphologicalSystem() {
    console.log('🚀 Enhanced Morphological System Test Starting...\n');
    
    // Test 1: Dynamic lexicon
    console.log('1. 📚 Dynamic Lexicon Test:');
    dynamicLexicon.addDynamicWord('subjects', 'rüya', 0.8);
    dynamicLexicon.addDynamicWord('verbs', 'büyüleniyor', 0.9);
    dynamicLexicon.addDynamicWord('objects', 'sihir', 0.7);
    
    console.log(`  Added dynamic words. Current subjects count: ${dynamicLexicon.getWords('subjects').length}`);
    
    // Test 2: Enhanced sentence generation
    console.log('\n2. 🎭 Enhanced Sentence Generation:');
    const sentenceTypes = ['simple', 'complex', 'emotional', 'compound', 'temporal', 'modal', 'intensive'];
    
    for (const type of sentenceTypes) {
        const sentence = await generateEnhancedMorphSentence(null, type, {
            emotionalTone: 'heyecanlı',
            complexity: 'complex',
            enableStyle: true,
            enableComposition: true
        });
        console.log(`  ${type}: ${sentence}`);
    }
    
    // Test 3: Enhanced dialogue
    console.log('\n3. 💬 Enhanced Dialogue Generation:');
    const dialogue = await generateEnhancedMorphDialogue(4, null, {
        emotionalProgression: true,
        narrativeCoherence: true,
        styleDiversity: true
    });
    console.log(`  ${dialogue}`);
    
    // Test 4: Performance metrics
    console.log('\n4. ⚡ Performance Test:');
    const startTime = performance.now();
    
    for (let i = 0; i < 50; i++) {
        await generateEnhancedMorphSentence(null, 'simple');
    }
    
    const endTime = performance.now();
    console.log(`  Generated 50 sentences in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`  Average: ${((endTime - startTime) / 50).toFixed(2)}ms per sentence`);
    
    console.log('\n✅ Enhanced Morphological System Test Completed!');
}

// ——————————————
// 10. Expanded Module Exports
// ——————————————
export { 
  // Original functions (backward compatibility)
  generateMorphSentence, 
  generateMorphDialogue, 
  testMorphologicalGenerator,
  addCase,
  LEXICON,
  
  // Enhanced functions
  generateEnhancedMorphSentence,
  generateEnhancedMorphDialogue,
  testEnhancedMorphologicalSystem,
  
  // Classes and engines
  DynamicLexicon,
  OptimizedScoringEngine,
  AdvancedSentenceComposer,
  
  // Instances
  dynamicLexicon,
  optimizedScoring,
  sentenceComposer
}; 