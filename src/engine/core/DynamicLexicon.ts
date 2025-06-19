// @ts-nocheck
/**
 * 🧬 mnBac v9.5.0 - Dynamic Lexicon Core Module
 * Ultra-Aggressive Anti-Monotony Language Evolution System
 * Production-Ready Modular Architecture
 * 
 * Extracted from MorphologicalDialogueGenerator.js for better modularity
 * Date: December 19, 2024
 */

export class DynamicLexicon {
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

// Global instance for backward compatibility
export const dynamicLexicon = new DynamicLexicon();

// Backward compatibility
export const LEXICON = {
    subjects: dynamicLexicon.getWords('subjects'),
    verbs: dynamicLexicon.getWords('verbs'),
    objects: dynamicLexicon.getWords('objects'),
    emotions: dynamicLexicon.getWords('emotions'),
    locations: dynamicLexicon.getWords('locations')
}; 