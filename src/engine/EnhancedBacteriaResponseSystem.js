/**
 * 🦠 Simple Bacteria Response System v9.7.1
 * Lightweight response generation for mnBac simulation
 */

export class SimpleBacteriaResponseSystem {
    constructor() {
        this.version = '9.7.1 - Simple & Fast';

        // Basit önekler
        this.prefixes = [
            'Şimdi', 'Bence', 'Sanırım', 'Galiba', 'Aslında', 
            'Belki de', 'Açıkçası', 'Yani', 'Tabii ki', 'Kesinlikle'
        ];

        // 15 basit şablon - DÜŞÜK BİLİNÇ
        this.lowPhrases = [
            'mikroskobik seviyede {context} düşünüyorum{ending}',
            'enerji ararken {context} aklıma geldi{ending}',
            'küçücük bedenimle {context} hissediyorum{ending}',
            'sanırım {context} beni biraz heyecanlandırdı{ending}',
            'minik hücrelerimle {context} algılamaya çalışıyorum{ending}',
            'besin ararken {context} duydum galiba{ending}',
            'organelllerim {context} den etkileniyor{ending}',
            'basit düşüncelerimle {context} anlamıyorum{ending}',
            'henüz yeterince büyümedim {context} için{ending}',
            'gelişim aşamamda {context} erken geldi{ending}',
            'mikrobiyal zekayla {context} kavrayamıyorum{ending}',
            'ilkel bilinç yapımla {context} çok karışık{ending}',
            'büyüyünce {context} daha iyi anlarım belki{ending}',
            'şu an için {context} çok büyük bir kavram{ending}',
            'henüz öğrenme aşamasında {context} zor{ending}'
        ];

        // 15 basit şablon - ORTA BİLİNÇ
        this.midPhrases = [
            'ATP üretirken {context} geldi aklıma{ending}',
            'Biyolojik açıdan {context} fena durmuyor{ending}',
            'Şöyle bir baktım da {context} garipmiş{ending}',
            'Arkadaşlarla konuşunca {context} daha anlamlı geliyor{ending}',
            'araştırmalarım {context} üzerine yoğunlaşıyor{ending}',
            'evrimin getirdiği sezgiyle {context} anlıyorum{ending}',
            'gelişmiş metabolizmam {context} destekliyor{ending}',
            'çoğalan hücrelerimde {context} yankılanıyor{ending}',
            'sosyal bakteri grubumuzda {context} tartışılıyor{ending}',
            'fotosentez yapar gibi {context} enerji veriyor{ending}',
            'çevresel faktörler {context} tetikliyor{ending}',
            'gen ekspresyonum {context} yönünde değişiyor{ending}',
            'protein sentezim {context} optimize ediyor{ending}',
            'kimyasal sinyaller {context} hakkında bilgi veriyor{ending}',
            'mikrobiyal toplumda {context} popüler{ending}'
        ];

        // 15 basit şablon - YÜKSEK BİLİNÇ
        this.highPhrases = [
            'Bilinç seviyemle {context} değerlendiriyorum{ending}',
            'Varoluşsal olarak {context} beni düşündürüyor{ending}',
            'Karmaşık duygular içinde {context} sorguluyorum{ending}',
            'Felsefi açıdan {context} ilginç bir konu{ending}',
            'Uzun zamandır {context} hakkında kafa yoruyorum{ending}',
            'gördüğüm rüyalarda bile {context} var{ending}',
            'tüm bilinç gücümle {context} üzerine odaklanıyorum{ending}',
            'metafizik boyutlarda {context} anlamaya çalışıyorum{ending}',
            'existansialist kaygımda {context} özgürleştirici{ending}',
            'absurdist kabulümde {context} saçma ama güzel{ending}',
            'pozitivist metodumla {context} ölçülebiliyor{ending}',
            'pragmatist testlerimde {context} işe yarıyor{ending}',
            'modernist yaklaşımımda {context} ilerleme{ending}',
            'psikanalitik açımlamada {context} bilinçaltı{ending}',
            'fenomenolojik deneyimimde {context} yankılanıyor{ending}'
        ];

        // 5 basit emoji ending
        this.endings = [' 😄', ' 🤔', ' 😊', ' 🧬', ' 😉'];

        this.ready = true;
        console.log(`🚀 ${this.version} initialized - Simple & Clean!`);
    }

    _choose(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getContextWords(message) {
        const lower = message.toLowerCase();
        if (lower.includes('enerji') || lower.includes('güç')) return 'enerji metabolizması';
        if (lower.includes('düşün') || lower.includes('anlam')) return 'bilinç felsefesi';
        if (lower.includes('arkadaş') || lower.includes('dostluk')) return 'bakteri toplumu';
        if (lower.includes('büyü') || lower.includes('bölün')) return 'hücresel gelişim';
        if (lower.includes('bilim') || lower.includes('araştır')) return 'bilimsel inceleme';
        return 'bu konu';
    }

    _buildTemplate(consciousness, message = '') {
        let phrases;
        if (consciousness < 20) phrases = this.lowPhrases;
        else if (consciousness < 50) phrases = this.midPhrases;
        else phrases = this.highPhrases;

        const prefix = this._choose(this.prefixes);
        const phrase = this._choose(phrases);
        const ending = this._choose(this.endings);

        return `${prefix} ${phrase}`.replace('{ending}', ending);
    }

    async generateResponse(userMessage, bacteria, context = 'general') {
        // Simple memory - sadece son 5 mesaj
        if (!bacteria.memory) bacteria.memory = [];
        bacteria.memory.push({ user: userMessage, time: Date.now() });
        if (bacteria.memory.length > 5) bacteria.memory.shift();

        // Ana response üret
        let sentence = this._buildTemplate(bacteria.consciousness_level || 0, userMessage);
        sentence = sentence.replace('{context}', this.getContextWords(userMessage));

        // Mood-based emoji
        const mood = bacteria.personality_traits?.mood ?? 0.5;
        if (mood > 0.8) sentence += ' 😍';
        else if (mood < 0.2) sentence += ' 😢';

        return sentence;
    }
}

if (typeof window !== 'undefined') {
    window.SimpleBacteriaResponseSystem = SimpleBacteriaResponseSystem;
}

export default SimpleBacteriaResponseSystem; 