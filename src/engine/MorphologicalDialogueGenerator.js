// morphologicalDialogueGenerator.js

// ——————————————
// 1. Gelişmiş Dinamik Kelime Havuzları 🚀
// ——————————————
class DynamicLexicon {
    constructor() {
        this.baseWords = {
            subjects: ['bakteri', 'hücre', 'gezgin', 'hayal', 'karınca', 'atom', 'çiçek', 'balık', 'ruh', 'zihin', 'kalp', 'nefes', 'yıldız', 
                      'elektron', 'proton', 'molekül', 'organizma', 'sistem', 'nesne', 'varlık', 'bilim', 'sanat', 'müzik', 'renk', 'ışık', 'ses', 'hareket',
                      'doğa', 'evren', 'galaksi', 'gezegen', 'uydu', 'güneş', 'ay', 'toprak', 'deniz', 'nehir', 'dağ', 'orman', 'ağaç', 'yaprak', 'meyve',
                      'hayvan', 'kuş', 'kedi', 'köpek', 'fil', 'kaplan', 'aslan', 'kartal', 'balina', 'yunus', 'kelebek', 'arı', 'böcek', 'solucan'],
            verbs: ['sentezliyor', 'keşfediyor', 'dans ediyor', 'paylaşıyor', 'yıldızı görüyor', 'müzik yapıyor', 'rüya kuruyor', 'titreşiyor', 'parıldıyor', 'evrimleşiyor', 'fısıldıyor', 'büyülüyor', 'uyanıyor', 'hissediyor', 'anlıyor',
                   'koşuyor', 'uçuyor', 'yüzüyor', 'zıplıyor', 'döküyor', 'yakıyor', 'soğutuyor', 'ısıtıyor', 'büyüyor', 'küçülüyor', 'değişiyor', 'dönüşüyor',
                   'öğreniyor', 'öğretiyor', 'araştırıyor', 'buluyor', 'yaratıyor', 'üretiyor', 'tasarlıyor', 'kurguluyor', 'hayali kuruyor', 'düşünüyor',
                   'seviyoг', 'nefret ediyor', 'kızıyor', 'gülüyor', 'ağlıyor', 'şarkı söylüyor', 'dans ediyor', 'oyunlar oynuyor', 'hikayeler anlatıyor',
                   'keşfediyor', 'geziyoг', 'maceralara atılıyor', 'savaşıyor', 'barış yapıyor', 'arkadaşlık kuruyor', 'işbirliği yapıyor', 'yarışıyor'],
            objects: ['enerji', 'dna', 'düşünce', 'vitamin', 'mineral', 'şarkı', 'renk', 'koku', 'anı', 'gizem', 'umut', 'korku', 'sevgi',
                     'protein', 'karbohidrat', 'yağ', 'vitamin', 'enzim', 'hormon', 'antikor', 'gen', 'kromozom', 'ribozom', 'mitokondri', 'çekirdek',
                     'çikolata', 'dondurma', 'kek', 'kurabiye', 'meyve', 'sebze', 'et', 'balık', 'tavuk', 'süt', 'peynir', 'ekmek', 'pasta', 'şeker',
                     'kitap', 'film', 'oyun', 'müzik', 'resim', 'heykel', 'dans', 'tiyatro', 'şiir', 'hikaye', 'masal', 'efsane', 'rüya', 'hayal',
                     'aşk', 'dostluk', 'mutluluk', 'hüzün', 'öfke', 'korku', 'heyecan', 'merak', 'şaşkınlık', 'gurur', 'utanç', 'pişmanlık', 'özlem'],
            emotions: ['mutlu', 'meraklı', 'şaşkın', 'kararlı', 'hüzünlü', 'heyecanlı', 'sakin', 'endişeli', 'umutlu', 'korkmuş', 'şefkatli', 'gururlu', 'utangaç', 'cesur', 'nazik',
                      'neşeli', 'keyifli', 'rahat', 'huzurlu', 'memnun', 'tatmin olmuş', 'şanslı', 'başarılı', 'güvenli', 'özgür', 'yaratıcı', 'ilhamlı',
                      'üzgün', 'melankoli', 'kırık', 'yalnız', 'kayıp', 'çaresiz', 'umutsuz', 'bitkin', 'yorgun', 'stresli', 'gergin', 'sinirli',
                      'şaşırmış', 'hayret', 'dehşet', 'panik', 'kaygılı', 'tedirgin', 'kuşkulu', 'kararsız', 'şüpheli', 'endişeli', 'korkutucu'],
            locations: ['laboratuvar', 'okyanús', 'gökyüzü', 'yaprak', 'toprak', 'hava', 'su', 'ışık', 'gölge', 'rüzgar', 'kalp', 'zihin', 'ev', 'yol', 'köprü',
                       'şehir', 'kasaba', 'köy', 'park', 'bahçe', 'orman', 'dağ', 'vadi', 'göl', 'nehir', 'deniz', 'okyanús', 'ada', 'yarımada', 'kıta',
                       'okul', 'hastane', 'kütüphane', 'müze', 'tiyatro', 'sinema', 'restoran', 'kafe', 'market', 'dükkan', 'fabrika', 'ofis', 'bina',
                       'uzay', 'galaksi', 'yıldız', 'gezegen', 'ay', 'güneş', 'dünya', 'mars', 'venüs', 'jüpiter', 'satürn', 'uranüs', 'neptün'],
            conjunctions: ['ancak', 'ama', 'fakat', 'lakin', 'oysa', 've', 'ile', 'hem', 'ya da', 'veya', 'ki', 'çünkü', 'zira', 'hatta', 'ayrıca',
                          'böylece', 'bundan dolayı', 'bu nedenle', 'bu yüzden', 'sonuç olarak', 'özetle', 'kısacası', 'diğer taraftan', 'öte yandan',
                          'benzer şekilde', 'aynı zamanda', 'bunun yanında', 'buna ek olarak', 'dahası', 'üstelik', 'hatta', 'bile', 'dahi'],
            intensifiers: ['çok', 'epey', 'oldukça', 'fazlasıyla', 'son derece', 'büyük ölçüde', 'hayli', 'bir hayli', 'gayet', 'pek',
                          'aşırı', 'müthiş', 'inanılmaz', 'dehşet', 'korkunç', 'berbat', 'mükemmel', 'harika', 'fantastik', 'olağanüstü',
                          'biraz', 'az', 'hafif', 'ufak', 'minimal', 'sınırlı', 'kısmen', 'kısa', 'uzun', 'devasa', 'mini', 'maksi'],
            temporal: ['şimdi', 'sonra', 'önce', 'hemen', 'yavaşça', 'birden', 'aniden', 'derhal', 'zamanla', 'sonunda',
                      'başlangıçta', 'ilk önce', 'ilk başta', 'öncelikle', 'daha sonra', 'arkasından', 'peşinden', 'devamında',
                      'arada sırada', 'bazen', 'ara ara', 'zaman zaman', 'sürekli', 'sürekli olarak', 'devamlı', 'hiç durmadan',
                      'dün', 'bugün', 'yarın', 'geçmişte', 'gelecekte', 'şu anda', 'o sırada', 'o zaman', 'şimdiye kadar']
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

// ——————————————
// 🎲 ÇEŞITLILIK ENJİNİ - Anti-Monoton Kelime Seçimi
// ——————————————
class DiversityEngine {
    constructor() {
        this.recentWords = []; // Son kullanılan kelimeler
        this.maxHistory = 15; // Tekrar cezası için hafıza (biraz azalttım)
        this.diversityBoost = 1.2; // Çeşitlilik faktörü (artırdım)
        this.contextRotation = ['biological', 'creative', 'social', 'philosophical', 'emotional'];
        this.currentContextIndex = 0;
        this.sentenceCount = 0;
        this.bannedWords = new Set(); // Geçici olarak yasaklanan kelimeler
        this.wordUsageCount = new Map(); // Kelime kullanım sayacı
    }
    
    // Top-K + Softmax Sampling - Greedy'nin alternatifi - GÜÇLENDİRİLMİŞ!
    pickDiverse(candidates, contextEmbed, prevWords = [], role = 'nom', K = 4, temp = 1.8) {
        if (!candidates || candidates.length === 0) return 'hücre';
        
        // 🚫 Yasaklı kelimeleri filtrele
        const filteredCandidates = candidates.filter(word => !this.bannedWords.has(word));
        const workingCandidates = filteredCandidates.length > 2 ? filteredCandidates : candidates;
        
        // 1) Her adayı skorla - AGGRESSIVE NOVELTY!
        const scored = workingCandidates.map(word => {
            const coherence = this.coherenceScore(word, contextEmbed, prevWords);
            const info = this.infoScore(word);
            const surprisal = this.surprisalScore(word, prevWords);
            const morph = this.morphCompatibilityScore(role);
            const novelty = this.aggressiveNoveltyScore(word); // YENİ - DAHA AGRESİF!
            const antiMonotony = this.antiMonotonyBonus(word, prevWords); // YENİ!
            
            const totalScore = coherence + info - surprisal + morph + (novelty * 1.5) + antiMonotony;
            return { word, score: totalScore };
        });
        
        // 2) En iyi K adayı al
        scored.sort((a, b) => b.score - a.score);
        const topK = scored.slice(0, Math.min(K, scored.length));
        
        if (topK.length === 0) return workingCandidates[0];
        
        // 3) Softmax ile probabilistic selection - DAHA RASTGELE
        const exps = topK.map(item => Math.exp(item.score / temp));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sumExp);
        
        // 4) Weighted random selection
        let random = Math.random();
        let acc = 0;
        for (let i = 0; i < probs.length; i++) {
            acc += probs[i];
            if (random < acc) {
                this.addToHistory(topK[i].word);
                return topK[i].word;
            }
        }
        
        // Fallback
        const selected = topK[0].word;
        this.addToHistory(selected);
        return selected;
    }
    
    // DAHA AGRESİF yenilik skoru
    aggressiveNoveltyScore(word) {
        const recentUsage = this.recentWords.filter(w => w === word).length;
        const totalUsage = this.wordUsageCount.get(word) || 0;
        
        // Çok kullanılan kelimeler için ağır ceza
        let heavyPenalty = 0;
        if (recentUsage > 2) heavyPenalty = -2.0; // Son 15 kelimede 3+ kez kullanılmışsa
        if (totalUsage > 5) heavyPenalty -= 1.0; // Toplam 5+ kez kullanılmışsa
        
        // Hiç kullanılmamış kelimeler için büyük bonus
        const freshBonus = totalUsage === 0 ? 1.5 : 0;
        const recentBonus = !this.recentWords.includes(word) ? 0.8 : 0;
        
        return freshBonus + recentBonus + heavyPenalty;
    }
    
    // Monotonluk karşıtı bonus - YENI!
    antiMonotonyBonus(word, prevWords) {
        if (prevWords.length < 2) return 0;
        
        const lastTwo = prevWords.slice(-2);
        const category = this.getWordCategory(word);
        const lastCategories = lastTwo.map(w => this.getWordCategory(w));
        
        // Farklı kategoriden kelime seçimi için bonus
        const isDifferentCategory = !lastCategories.includes(category);
        
        // Üçlü tekrarı önleme (ruh-dna-büyülüyor gibi)
        const isBreakingPattern = !lastTwo.some(w => w === word);
        
        return (isDifferentCategory ? 0.7 : 0) + (isBreakingPattern ? 0.5 : -1.0);
    }
    
    addToHistory(word) {
        this.recentWords.push(word);
        if (this.recentWords.length > this.maxHistory) {
            this.recentWords.shift(); // Eski kelimeleri sil
        }
        
        // Kelime kullanım sayacını güncelle
        this.wordUsageCount.set(word, (this.wordUsageCount.get(word) || 0) + 1);
        
        // Çok kullanılan kelimeleri geçici yasak listesine ekle
        if (this.wordUsageCount.get(word) >= 4) {
            this.bannedWords.add(word);
            // 10 cümle sonra yasağı kaldır
            setTimeout(() => {
                this.bannedWords.delete(word);
                this.wordUsageCount.set(word, Math.max(0, (this.wordUsageCount.get(word) || 0) - 2));
            }, 10000);
        }
    }
    
    // Context döndürme - YENI!
    rotateContext() {
        this.sentenceCount++;
        if (this.sentenceCount % 3 === 0) { // Her 3 cümlede bir context değiştir
            this.currentContextIndex = (this.currentContextIndex + 1) % this.contextRotation.length;
            return this.contextRotation[this.currentContextIndex];
        }
        return null; // Context değişmedi
    }
    
    // Kelime havuzunu genişlet - YENI!
    expandWordPool(category) {
        const expansions = {
            'subjects': ['bakteri', 'hücre', 'organizma', 'yaşam', 'doğa', 'evren', 'zaman', 'düşünce', 'his', 'rüya'],
            'objects': ['protein', 'enzim', 'ATP', 'molekül', 'oksijen', 'şeker', 'amino', 'vitamin', 'mineral', 'enerji'],
            'verbs': ['hareket', 'büyüyor', 'gelişiyor', 'öğreniyor', 'keşfediyor', 'hissediyor', 'düşünüyor', 'yaratıyor', 'dönüşüyor', 'evrimleşiyor'],
            'emotions': ['merak', 'sevgi', 'umut', 'korku', 'heyecan', 'huzur', 'şaşkınlık', 'özlem', 'neşe', 'endişe'],
            'locations': ['laboratuvar', 'doğa', 'okul', 'ev', 'şehir', 'orman', 'deniz', 'gökyüzü', 'uzay', 'kalp']
        };
        return expansions[category] || [];
    }
    
    // Basit scoring functions (backward compatibility) - GÜÇLENDİRİLMİŞ
    coherenceScore(word, contextEmbed, prevWords) {
        let score = 1.0;
        if (prevWords.length > 0) {
            const lastWord = prevWords[prevWords.length - 1];
            const wordCat = this.getWordCategory(word);
            const lastCat = this.getWordCategory(lastWord);
            
            // Aynı kategoriden kelime cezası
            if (wordCat === lastCat) {
                score -= 0.3; // Ceza artırdım
            } else {
                score += 0.4; // Farklı kategori bonusu
            }
        }
        return score;
    }
    
    infoScore(word) {
        const allWords = Object.values(dynamicLexicon.baseWords).flat();
        const expanded = this.expandWordPool('subjects').concat(
            this.expandWordPool('objects'),
            this.expandWordPool('verbs')
        );
        const totalWords = [...allWords, ...expanded];
        
        const frequency = totalWords.filter(w => w === word).length;
        return frequency > 0 ? -Math.log(frequency / totalWords.length) : 2.5; // Bilinmeyen kelimeler için bonus
    }
    
    surprisalScore(word, prevWords) {
        if (prevWords.length === 0) return Math.random() * 0.5;
        const lastWord = prevWords[prevWords.length - 1];
        const surprise = this.getWordCategory(word) !== this.getWordCategory(lastWord) ? 0.8 : 0.1;
        
        // Tekrar eden kelimeler için sürpriz cezası
        const repetitionPenalty = prevWords.includes(word) ? -0.5 : 0;
        
        return surprise + repetitionPenalty;
    }
    
    morphCompatibilityScore(role) {
        const scores = { 'nom': 1.0, 'acc': 1.2, 'dat': 0.9, 'loc': 0.8 };
        return scores[role] || 1.0;
    }
    
    getWordCategory(word) {
        for (const [category, words] of Object.entries(dynamicLexicon.baseWords)) {
            if (words.includes(word)) return category;
        }
        
        // Genişletilmiş kelime havuzunda ara
        for (const category of ['subjects', 'objects', 'verbs', 'emotions']) {
            if (this.expandWordPool(category).includes(word)) {
                return category;
            }
        }
        
        return 'unknown';
    }
    
    // Context çeşitliliği için rastgele field seçimi - GÜÇLENDİRİLMİŞ
    diversifyContext() {
        const rotated = this.rotateContext();
        if (rotated) {
            console.log(`🔄 Context rotated to: ${rotated}`);
            return rotated;
        }
        
        // Rastgele değişim (daha sık)
        if (Math.random() < 0.4) { // 20% -> 40%
            const contexts = ['biological', 'creative', 'social', 'philosophical', 'emotional'];
            const newContext = contexts[Math.floor(Math.random() * contexts.length)];
            console.log(`🎲 Context randomized to: ${newContext}`);
            return newContext;
        }
        
        return this.contextRotation[this.currentContextIndex];
    }
    
    // Debugging - GÜÇLENDİRİLMİŞ
    getStats() {
        const wordCounts = {};
        this.recentWords.forEach(w => wordCounts[w] = (wordCounts[w] || 0) + 1);
        return { 
            recentWords: this.recentWords.slice(-10),
            topRepeated: Object.entries(wordCounts).sort((a,b) => b[1] - a[1]).slice(0, 5),
            bannedWords: Array.from(this.bannedWords),
            currentContext: this.contextRotation[this.currentContextIndex],
            sentenceCount: this.sentenceCount,
            totalWordUsage: this.wordUsageCount.size
        };
    }
    
    // Sistem resetleme için
    resetDiversity() {
        this.recentWords = [];
        this.bannedWords.clear();
        this.wordUsageCount.clear();
        this.sentenceCount = 0;
        this.currentContextIndex = 0;
        console.log('🔄 Diversity engine reset!');
    }
}

// Global diversity engine
const diversityEngine = new DiversityEngine();

// Backward compatibility function - ARTIK ÇEŞİTLİLİK KULLANIR!
function pickBest(candidates, contextEmbed, prevWords = [], role = 'nom', position = 'middle') {
    return diversityEngine.pickDiverse(candidates, contextEmbed, prevWords, role, 4, 1.5);
}

// 🔍 DEBUGGING - Diversity Stats'ı göster
function showDiversityStats() {
    const stats = diversityEngine.getStats();
    console.log('🎭 DIVERSITY ENGINE STATS:', stats);
    
    if (typeof window !== 'undefined' && window.console) {
        console.group('🔤 Word Diversity Analysis');
        console.log('📝 Recent words:', stats.recentWords);
        console.log('🔁 Most repeated:', stats.topRepeated);
        console.log('🚫 Banned words:', stats.bannedWords);
        console.log('🎯 Current context:', stats.currentContext);
        console.log('📊 Sentence count:', stats.sentenceCount);
        console.log('📚 Total vocabulary used:', stats.totalWordUsage);
        console.groupEnd();
    }
    
    return stats;
}

// 🔄 Diversity Reset
function resetDiversityEngine() {
    diversityEngine.resetDiversity();
    console.log('🔄 Diversity engine has been reset!');
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
  // SOV: Özne + Nesne + Fiil - GENİŞLETİLMİŞ KELİME HAVUZU İLE!
  
  // 🎲 Context değişimi (daha sık)
  const newContext = diversityEngine.diversifyContext();
  
  // Özne seçimi - GENİŞLETİLMİŞ kategorilerden
  const expandedSubjects = [
    ...LEXICON.subjects, 
    ...diversityEngine.expandWordPool('subjects'),
    ...LEXICON.emotions.slice(0, 3), // Sadece birkaç emotion
    ...diversityEngine.expandWordPool('emotions').slice(0, 3)
  ];
  const subject = pickBest(expandedSubjects, contextEmbed, prevWords, 'nom', 'start');
  prevWords.push(subject);
  
  // Nesne seçimi - GENİŞLETİLMİŞ havuzdan
  let objectPart = '';
  const expandedObjects = [
    ...LEXICON.objects,
    ...diversityEngine.expandWordPool('objects')
  ];
  
  if (Math.random() < 0.4) { // Temporal modifier şansını artırdım
    const temporals = [...LEXICON.temporal, 'aniden', 'sessizce', 'dikkatli bir şekilde'];
    const temporal = pickBest(temporals, contextEmbed, prevWords, 'nom', 'middle');
    const objectBase = pickBest(expandedObjects, contextEmbed, prevWords, 'acc', 'middle');
    const object = addCase(objectBase, 'acc');
    objectPart = `${temporal} ${object}`;
    prevWords.push(temporal, object);
  } else {
    const objectBase = pickBest(expandedObjects, contextEmbed, prevWords, 'acc', 'middle');
    const object = addCase(objectBase, 'acc');
    objectPart = object;
    prevWords.push(object);
  }
  
  // Fiil seçimi - GENİŞLETİLMİŞ havuzdan
  const expandedVerbs = [
    ...LEXICON.verbs,
    ...diversityEngine.expandWordPool('verbs')
  ];
  const verb = pickBest(expandedVerbs, contextEmbed, prevWords, 'nom', 'end');
  prevWords.push(verb);
  
  return `${capitalize(subject)} ${objectPart} ${verb}.`;
}

async function generateComplexSentence(contextEmbed, prevWords) {
  // Özne + Yer + Nesne + Fiil - ULTRA GENİŞLETİLMİŞ ÇEŞİTLİLİK
  
  // Context rotation
  diversityEngine.diversifyContext();
  
  // Özne çeşitliliği - BÜYÜK HAVUZ
  const megaSubjects = [
    ...LEXICON.subjects, 
    ...diversityEngine.expandWordPool('subjects'),
    ...LEXICON.emotions.slice(0, 4),
    ...diversityEngine.expandWordPool('emotions').slice(0, 4)
  ];
  const subject = pickBest(megaSubjects, contextEmbed, prevWords, 'nom', 'start');
  prevWords.push(subject);
  
  // Konum + yoğunluk belirteci (bazen)
  let locationPart = '';
  if (Math.random() < 0.4) {
    const intensifier = pickBest(LEXICON.intensifiers, contextEmbed, prevWords, 'nom', 'middle');
    const locationBase = pickBest(LEXICON.locations, contextEmbed, prevWords, 'loc', 'middle');
    const location = addCase(locationBase, 'loc');
    locationPart = `${intensifier} ${location}`;
    prevWords.push(intensifier, location);
  } else {
    const locationBase = pickBest(LEXICON.locations, contextEmbed, prevWords, 'loc', 'middle');
    const location = addCase(locationBase, 'loc');
    locationPart = location;
    prevWords.push(location);
  }
  
  // Nesne + bağlaç kombinasyonu (bazen)
  let objectPart = '';
  if (Math.random() < 0.25) {
    const objectBase1 = pickBest(LEXICON.objects, contextEmbed, prevWords, 'acc', 'middle');
    const object1 = addCase(objectBase1, 'acc');
    const conjunction = pickBest(LEXICON.conjunctions.slice(5, 9), contextEmbed, prevWords, 'nom', 'middle'); // 've', 'ile', 'hem', 'ya da'
    const objectBase2 = pickBest(LEXICON.objects, contextEmbed, prevWords, 'acc', 'middle');
    const object2 = addCase(objectBase2, 'acc');
    objectPart = `${object1} ${conjunction} ${object2}`;
    prevWords.push(object1, conjunction, object2);
  } else {
    const objectBase = pickBest(LEXICON.objects, contextEmbed, prevWords, 'acc', 'middle');
    const object = addCase(objectBase, 'acc');
    objectPart = object;
    prevWords.push(object);
  }
  
  const verb = pickBest(LEXICON.verbs, contextEmbed, prevWords, 'nom', 'end');
  prevWords.push(verb);
  
  return `${capitalize(subject)} ${locationPart} ${objectPart} ${verb}.`;
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
  return s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
}

// ——————————————
// 8. Çoklu Cümle Üretimi
// ——————————————
async function generateMorphDialogue(sentences = 3, contextEmbed = null) {
  const dialogue = [];
  const types = ['simple', 'complex', 'emotional', 'locative'];
  
  // 🎯 ÇEŞİTLİLİK ENJİNİ - Her cümle farklı tip olsun
  const usedTypes = [];
  
  for (let i = 0; i < sentences; i++) {
    // Mevcut kullanılmamış tipleri al
    const availableTypes = types.filter(type => !usedTypes.includes(type) || usedTypes.length >= types.length);
    
    // Eğer tüm tipler kullanıldıysa, listesini temizle
    if (availableTypes.length === 0) {
      usedTypes.length = 0;
      availableTypes.push(...types);
    }
    
    // Rastgele ama kullanılmamış tip seç
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    usedTypes.push(randomType);
    
    // Diversity engine history'sini kontrol et
    if (i > 0 && diversityEngine.recentWords.length > 10) {
      console.log(`🔄 Diversity stats: ${JSON.stringify(diversityEngine.getStats().topRepeated)}`);
    }
    
    const sentence = await generateMorphSentence(contextEmbed, randomType);
    dialogue.push(sentence);
  }
  
  return dialogue.join(' ');
}

// ——————————————
// 9. Örnek Kullanım ve Test
// ——————————————
// Test function moved to tests/MorphologicalDialogueGenerator.test.js

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
    
    return `${capitalize(temporal)} ${baseSentence.toLocaleLowerCase('tr')}`;
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

// Test function moved to tests/EnhancedMorphologicalSystem.test.js

// ——————————————
// 10. Expanded Module Exports
// ——————————————
export { 
  // Original functions (backward compatibility)
  generateMorphSentence, 
  generateMorphDialogue, 
  // testMorphologicalGenerator, // Moved to tests
  addCase,
  LEXICON,
  
  // Enhanced functions
  generateEnhancedMorphSentence,
  generateEnhancedMorphDialogue,
  // testEnhancedMorphologicalSystem, // Moved to tests
  
  // Classes and engines
  DynamicLexicon,
  OptimizedScoringEngine,
  AdvancedSentenceComposer,
  DiversityEngine, // YENİ!
  
  // Instances
  dynamicLexicon,
  optimizedScoring,
  sentenceComposer,
  diversityEngine, // YENİ!
  
  // Debug functions
  showDiversityStats,
  resetDiversityEngine
}; 