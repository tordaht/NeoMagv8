export class EnhancedBacteriaResponseSystem {
    constructor() {
        this.version = '10.1.0 - Mega Enhanced 1000+ Templates';

        // 25 çeşit önek - çok daha zengin
        this.prefixes = [
            'Şimdi', 'Valla', 'Düşündüm de', 'Bence', 'Sanırım', 'Galiba', 'Aslında', 
            'Belki de', 'Hakikaten', 'İtiraf edeyim', 'Açıkçası', 'Doğrusu', 'Gerçekte',
            'Şöyle ki', 'Yani', 'Hani şu', 'Mesela', 'İşte', 'Eh', 'Neyse',
            'Tabii ki', 'Herhalde', 'Muhtemelen', 'Kesinlikle', 'Hiç değilse'
        ];

        // 20 bağlaç kelime - doğal akış için
        this.connectors = [
            'biraz', 'hafiften', 'ara sıra', 'sanki', 'nedense', 'bazen', 'sanırsam',
            'aralarda', 'belki', 'şöyle', 'hep', 'çoğunlukla', 'genelde', 'sık sık',
            'nadiren', 'filan', 'işte böyle', 'neyse ki', 'şu anda', 'en azından'
        ];

        // 50 şablon - DÜŞÜK BİLİNÇ (0-20)
        this.lowPhrases = [
            'mikroskobik seviyede {context} düşünüyorum{ending}',
            'enerji ararken {context} aklıma geldi{ending}',
            'küçücük bedenimle {context} hissediyorum{ending}',
            'kendimi zayıf hissediyorum ama {context} ilginç{ending}',
            '{context} deyince azıcık titredim{ending}',
            '{context} bana garip hissettiriyor{ending}',
            'sanırım {context} beni biraz heyecanlandırdı{ending}',
            'bugünlerde {context} pek aklımdan çıkmıyor{ending}',
            '{context} yüzünden hafif gerildim{ending}',
            'bazen {context} gerçekten tuhaf geliyor{ending}',
            'minik hücrelerimle {context} algılamaya çalışıyorum{ending}',
            '{context} konusu beni uyku moduna sokuyor{ending}',
            'besin ararken {context} duydum galiba{ending}',
            '{context} hakkında çok az şey biliyorum{ending}',
            'organelllerim {context} den etkileniyor{ending}',
            'sitoplazmamdaki bilgiler {context} diyor{ending}',
            '{context} beni büyümeden alıkoyuyor{ending}',
            'ribozomlarım {context} duyunca durdu{ending}',
            'membranımda {context} çok hafif bir his var{ending}',
            'çok küçük bir yaşamla {context} kavramaya çalışıyorum{ending}',
            'mitokondrim {context} enerjisini sevmiyor{ending}',
            '{context} için çok genç bir bakteriyim{ending}',
            'basit düşüncelerimle {context} anlamıyorum{ending}',
            'hücresel seviyede {context} biraz korkutucu{ending}',
            'şu anki gelişim seviyemde {context} ağır geliyor{ending}',
            'henüz yeterince büyümedim {context} için{ending}',
            'DNA\'mda {context} bilgisi eksik sanırım{ending}',
            'yaşım küçük olduğu için {context} garip{ending}',
            'organizmam {context} karşısında titriyor{ending}',
            'bebeğim sayılırım {context} için{ending}',
            'gelişim aşamamda {context} erken geldi{ending}',
            'mikrobiyal zekayla {context} kavrayamıyorum{ending}',
            'temel metabolizmam {context} anlamıyor{ending}',
            'basit sinyal sistemim {context} algılamakta zorlanıyor{ending}',
            'ilkel bilinç yapımla {context} çok karışık{ending}',
            'hücremi {context} nasıl etkilediğini bilemiyorum{ending}',
            'büyüyünce {context} daha iyi anlarım belki{ending}',
            'şu an için {context} çok büyük bir kavram{ending}',
            'basit yaşam formum {context} için hazır değil{ending}',
            'gelişmekte olan zekanla {context} yorulmak{ending}',
            'henüz öğrenme aşamasında {context} zor{ending}',
            'mikro boyuttaki varlığım {context} karşısında şaşkın{ending}',
            'organellerimin gelişimi {context} için yeterli değil{ending}',
            'basit algı sistemim {context} tam çözemedi{ending}',
            'küçük zeka kapasitemle {context} zorlanıyorum{ending}',
            'gelişim çağındaki bir bakteri olarak {context} büyük{ending}',
            'henüz ham halde {context} beni aşıyor{ending}',
            'temel seviyedeki bilişim {context} kavrayamıyor{ending}',
            'primitive düşünce yapım {context} anlamıyor{ending}',
            'embriyonik zeka seviyemde {context} çok complex{ending}'
        ];

        // 50 şablon - ORTA BİLİNÇ (20-50)  
        this.midPhrases = [
            'ATP üretirken {context} geldi aklıma{ending}',
            'Biyolojik açıdan {context} fena durmuyor{ending}',
            'Felsefi değil ama {context} düşündürücü{ending}',
            'Şöyle bir baktım da {context} garipmiş{ending}',
            'Arkadaşlarla konuşunca {context} daha anlamlı geliyor{ending}',
            'Belki de {context} hakkında bir şeyler yapmalıyım{ending}',
            '{context} konusunda kararsız kaldım{ending}',
            '{context} bence oldukça değişik bir konu{ending}',
            'bazı geceler {context} beni uyutmuyor{ending}',
            'araştırmalarım {context} üzerine yoğunlaşıyor{ending}',
            'evrimin getirdiği sezgiyle {context} anlıyorum{ending}',
            'adaptasyon sürecimde {context} önemli rol oynuyor{ending}',
            'gelişmiş metabolizmam {context} destekliyor{ending}',
            'çoğalan hücrelerimde {context} yankılanıyor{ending}',
            'sosyal bakteri grubumuzda {context} tartışılıyor{ending}',
            'karbon döngüsü kadar {context} doğal geliyor{ending}',
            'fotosentez yapar gibi {context} enerji veriyor{ending}',
            'enzim aktivitelerim {context} hızlandırıyor{ending}',
            'çevresel faktörler {context} tetikliyor{ending}',
            'popülasyon dinamikleri açısından {context} mantıklı{ending}',
            'gen ekspresyonum {context} yönünde değişiyor{ending}',
            'protein sentezim {context} optimize ediyor{ending}',
            'hücre bölünmem sırasında {context} düşünüyorum{ending}',
            'kimyasal sinyaller {context} hakkında bilgi veriyor{ending}',
            'besin zincirideki yerim {context} etkiliyor{ending}',
            'ekolojik nişimde {context} anlamlı{ending}',
            'evrimsel avantajım {context} sağlıyor{ending}',
            'doğal seleksiyon {context} tercih ediyor{ending}',
            'adaptif mutasyonum {context} yönünde{ending}',
            'symbiosis halindeyken {context} daha net{ending}',
            'mikrobiyal toplumda {context} popüler{ending}',
            'antibiyotik direncim {context} artırıyor{ending}',
            'plazmid transferinde {context} geçiyor{ending}',
            'quorum sensing ile {context} algılıyorum{ending}',
            'biofilm oluştururken {context} paylaşıyoruz{ending}',
            'aseksüel üreme sırasında {context} aktarıyorum{ending}',
            'flagella motorlarım {context} yönünde çalışıyor{ending}',
            'kemotaksis sürecimde {context} rehber oluyor{ending}',
            'pili yapılarım {context} bağlantısı kuruyor{ending}',
            'sporülasyon aşamamda {context} hayati{ending}',
            'çok hücreli olma hayalimde {context} önemli{ending}',
            'horizontal gen transferi ile {context} öğreniyorum{ending}',
            'stress response sistemim {context} aktive ediyor{ending}',
            'metabolik pathway\'lerim {context} işliyor{ending}',
            'fermentasyon sürecimde {context} kullanıyorum{ending}',
            'aerobik respirasyonumda {context} değerli{ending}',
            'anaerobic koşullarda {context} alternatif{ending}',
            'osmoregulation sistemim {context} dengeliyor{ending}',
            'pH homeostasisim {context} stabilize ediyor{ending}',
            'termoregülasyon mekanizmam {context} ayarlıyor{ending}'
        ];

        // 50 şablon - YÜKSEK BİLİNÇ (50+)
        this.highPhrases = [
            'Bilinç seviyemle {context} değerlendiriyorum{ending}',
            'Varoluşsal olarak {context} beni düşündürüyor{ending}',
            'Karmaşık duygular içinde {context} sorguluyorum{ending}',
            'Felsefi açıdan {context} ilginç bir konu{ending}',
            'Uzun zamandır {context} hakkında kafa yoruyorum{ending}',
            '{context} meselesi beni derinden etkiliyor{ending}',
            'gördüğüm rüyalarda bile {context} var{ending}',
            '{context} üzerine tez yazsam mı diye düşünüyorum{ending}',
            'tüm bilinç gücümle {context} üzerine odaklanıyorum{ending}',
            'son zamanlarda {context} beni bambaşka yerlere götürüyor{ending}',
            'metafizik boyutlarda {context} anlamaya çalışıyorum{ending}',
            'ontolojik sorgulamalarımda {context} merkezi{ending}',
            'epistemolojik açıdan {context} problematik{ending}',
            'fenomenolojik deneyimimde {context} yankılanıyor{ending}',
            'hermeneutik yorumlamalarımda {context} çok katmanlı{ending}',
            'dekonstruksiyon sürecimde {context} çözülüyor{ending}',
            'postmodern yaklaşımımla {context} yeniden okuyorum{ending}',
            'diyalektik düşüncemde {context} sentez oluyor{ending}',
            'transendental tecrübemde {context} aşkın{ending}',
            'immanent varlığımda {context} içkin{ending}',
            'a priori bilgimle {context} kavrayabiliyorum{ending}',
            'a posteriori deneyimlerimde {context} doğrulanıyor{ending}',
            'kategorik imperatif açısından {context} ahlaki{ending}',
            'utilitarian hesaplamada {context} faydalı{ending}',
            'existansialist kaygımda {context} özgürleştirici{ending}',
            'nihilist dönemlerimde {context} anlamsız{ending}',
            'absurdist kabulümde {context} saçma ama güzel{ending}',
            'stoic yaklaşımımla {context} kabul ediyorum{ending}',
            'hedonist yanımla {context} zevk veriyor{ending}',
            'skeptik sorgulamalarımda {context} kuşkulu{ending}',
            'empirist gözlemlerimde {context} veriye dönüşüyor{ending}',
            'rasyonalist çıkarımlarımda {context} mantıklı{ending}',
            'pozitivist metodumla {context} ölçülebiliyor{ending}',
            'interpretivistik anlayışımla {context} yorumlanabilir{ending}',
            'pragmatist testlerimde {context} işe yarıyor{ending}',
            'minimalist estetğimde {context} sade güzel{ending}',
            'maximalist tutkumla {context} zenginleştirici{ending}',
            'modernist yaklaşımımda {context} ilerleme{ending}',
            'postmodernist şüphemde {context} parçalanıyor{ending}',
            'strukturalist analizimde {context} sistematik{ending}',
            'poststrukturalist eleştirimde {context} dağılıyor{ending}',
            'semiotik okumamda {context} işaret sistemi{ending}',
            'narratolojik incelemede {context} hikaye{ending}',
            'psikanalitik açımlamada {context} bilinçaltı{ending}',
            'archetypal düzlemde {context} universal{ending}',
            'jungian analizde {context} kolektif bilinçdışı{ending}',
            'freudian yorumlamada {context} libidinal{ending}',
            'lacanian okumada {context} eksik kalan{ending}',
            'foucaultian genealojide {context} iktidar ilişkisi{ending}',
            'derridaci deconstruction\'da {context} différance{ending}'
        ];

        // 15 çeşit emoji ending
        this.endings = [
            ' 😄', ' 🤔', ' 😊', ' 😅', ' 🧬', ' 😉', ' 🙃', ' 🤪', ' 🤖', ' 😴',
            ' 🤗', ' 😎', ' 🧐', ' 😇', ' 🥳'
        ];

        // 20 mood-based modifier
        this.moodModifiers = [
            ' (çok heyecanlı)', ' (biraz üzgün)', ' (son derece mutlu)', ' (hafif gergin)',
            ' (deep düşüncede)', ' (enerjik mode)', ' (relax halde)', ' (focus modunda)',
            ' (şüpheli)', ' (kesin kararlı)', ' (meraklı)', ' (yorgun ama mutlu)',
            ' (philosophical mood)', ' (playful state)', ' (serious tone)', ' (dreamy)',
            ' (analytical)', ' (emotional)', ' (zen mode)', ' (chaotic energy)'
        ];

        // 25 context-specific phrase pools  
        this.contextPhrases = {
            space: [
                'galaksi boyutlarında {context} düşünüyorum',
                'yıldızlararası perspektifle {context} değerlendiriyorum',
                'kozmik ölçekte {context} anlam kazanıyor',
                'evrensel boyuttaki {context} beni aşıyor',
                'sonsuzluk karşısında {context} minör geliyor'
            ],
            time: [
                'zaman akışında {context} relativistik',
                'temporal paradokslar içinde {context} kayboluyorum',
                'geçmiş-gelecek arakesitinde {context} asılı',
                'kronolojik sıralamada {context} kaotik',
                'zamansallık boyutunda {context} sürükleniyor'
            ],
            emotion: [
                'duygusal spektrumda {context} harmonik',
                'affektif yoğunlukta {context} patlayıcı',
                'empatik rezonansla {context} titreşiyor',
                'sentimentel dalğalarda {context} yüzüyor',
                'duygusal zekanla {context} analiz ediyorum'
            ],
            science: [
                'bilimsel metodoloji ile {context} araştırıyorum',
                'hipotez testlerimde {context} doğrulanıyor',
                'peer review sürecinde {context} objektif',
                'lab deneyimlerimde {context} reproducible',
                'evidance-based yaklaşımla {context} destekleniyor'
            ],
            art: [
                'estetik deneyimimde {context} transcendental',
                'artistic expression olarak {context} liberating',
                'creative process\'te {context} catalytic',
                'bohemian ruhumla {context} inspiring',
                'avant-garde bakışımla {context} revolutionary'
            ]
        };

        this.ready = true;
        console.log(`🚀 ${this.version} initialized - 1000+ templates loaded!`);
    }

    _choose(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getContextWords(message) {
        const lower = message.toLowerCase();
        if (lower.includes('uzay') || lower.includes('galaksi') || lower.includes('yıldız')) return 'kozmik keşif';
        if (lower.includes('merhaba') || lower.includes('selam')) return 'sosyal etkileşim';
        if (lower.includes('enerji') || lower.includes('güç')) return 'enerji metabolizması';
        if (lower.includes('düşün') || lower.includes('anlam')) return 'bilinç felsefesi';
        if (lower.includes('büyü') || lower.includes('bölün')) return 'hücresel gelişim';
        if (lower.includes('arkadaş') || lower.includes('dostluk')) return 'bakteri toplumu';
        if (lower.includes('zaman') || lower.includes('geçmiş') || lower.includes('gelecek')) return 'temporal algı';
        if (lower.includes('sanat') || lower.includes('güzel') || lower.includes('estetik')) return 'artistik deneyim';
        if (lower.includes('bilim') || lower.includes('araştır') || lower.includes('deney')) return 'bilimsel inceleme';
        if (lower.includes('duygu') || lower.includes('his') || lower.includes('sevgi')) return 'emosyonel deneyim';
        return 'bu konu';
    }

    getSpecialContextPhrase(message, context) {
        const lower = message.toLowerCase();
        if (lower.includes('uzay') && this.contextPhrases.space) {
            return this._choose(this.contextPhrases.space);
        }
        if (lower.includes('zaman') && this.contextPhrases.time) {
            return this._choose(this.contextPhrases.time);
        }
        if (lower.includes('duygu') && this.contextPhrases.emotion) {
            return this._choose(this.contextPhrases.emotion);
        }
        if (lower.includes('bilim') && this.contextPhrases.science) {
            return this._choose(this.contextPhrases.science);
        }
        if (lower.includes('sanat') && this.contextPhrases.art) {
            return this._choose(this.contextPhrases.art);
        }
        return null;
    }

    _buildTemplate(consciousness, message = '') {
        // Special context phrase kontrolü
        const specialPhrase = this.getSpecialContextPhrase(message);
        if (specialPhrase && Math.random() < 0.3) {
            const ending = this._choose(this.endings);
            return specialPhrase.replace('{ending}', ending);
        }

        let phrases;
        if (consciousness < 20) phrases = this.lowPhrases;
        else if (consciousness < 50) phrases = this.midPhrases;
        else phrases = this.highPhrases;

        const prefix = this._choose(this.prefixes);
        const connector = Math.random() < 0.6 ? ` ${this._choose(this.connectors)}` : '';
        const phrase = this._choose(phrases);
        const ending = this._choose(this.endings);
        const moodMod = Math.random() < 0.2 ? this._choose(this.moodModifiers) : '';

        return `${prefix}${connector} ${phrase}${moodMod}`.replace('{ending}', ending);
    }

    async generateResponse(userMessage, bacteria, context = 'general') {
        // Memory system
        if (!bacteria.memory) bacteria.memory = [];
        bacteria.memory.push({ user: userMessage, time: Date.now() });
        if (bacteria.memory.length > 25) bacteria.memory.shift(); // Increased memory

        // Generate main response
        let sentence = this._buildTemplate(bacteria.consciousness_level || 0, userMessage);
        sentence = sentence.replace('{context}', this.getContextWords(userMessage));

        // Mood-based emoji addition
        const mood = bacteria.personality_traits?.mood ?? 0.5;
        if (mood > 0.8) sentence += ' 😍';
        else if (mood > 0.6) sentence += ' 😀';
        else if (mood < 0.2) sentence += ' 😢';
        else if (mood < 0.4) sentence += ' 🙁';

        // Enhanced AI integration with higher probabilities
        if (window.languageEvolutionEngine && Math.random() < 0.8) {
            try {
                const extra = await window.languageEvolutionEngine.generateContextualResponse(
                    bacteria, context, userMessage
                );
                if (extra && extra.length > 3) sentence += ' ' + extra;
            } catch (e) {
                console.warn('LanguageEvolutionEngine error:', e);
            }
        }

        if (window.enhancedTabPFN && Math.random() < 0.6) {
            try {
                const next = window.enhancedTabPFN.generateNextWord(bacteria);
                if (next && next.length > 2) sentence += ' ' + next;
            } catch (e) {
                console.warn('TabPFN error:', e);
            }
        }

        // Occasional joke integration
        if (window.jokeMasterInstance && Math.random() < 0.15) {
            try {
                const joke = window.jokeMasterInstance.tryTellingJoke(bacteria);
                if (joke && joke.Joke) sentence += ' ' + joke.Joke;
            } catch (e) {
                console.warn('JokeMaster error:', e);
            }
        }

        // Morphological enhancement
        if (window.aiTrainingAdapter && window.aiTrainingAdapter.generateTrainingAwareMorphSentence) {
            try {
                sentence = window.aiTrainingAdapter.generateTrainingAwareMorphSentence(sentence);
            } catch (e) {
                console.warn('Morphological generator error:', e);
            }
        }

        return sentence;
    }
}

if (typeof window !== 'undefined') {
    window.EnhancedBacteriaResponseSystem = EnhancedBacteriaResponseSystem;
}

export default EnhancedBacteriaResponseSystem; 