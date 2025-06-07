export class EnhancedBacteriaResponseSystem {
    constructor() {
        this.version = '10.0.1';

        // Expanded prefix library for greater variety
        this.prefixes = [
            'Şimdi',
            'Valla',
            'Düşündüm de',
            'Bence',
            'Sanırım',
            'Galiba',
            'Aslında',
            'Belki de',
            'Hakikaten',
            'İtiraf edeyim'
        ];

        // Connectors add random "flavor" between prefix and phrase
        this.connectors = [
            'biraz',
            'hafiften',
            'ara sıra',
            'sanki',
            'nedense',
            'bazen',
            'sanırsam',
            'aralarda',
            'belki',
            'şöyle'
        ];
        // Base phrase pools by consciousness level (5+ each for mixing)
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
            '{context} bana komik geliyor{ending}',
            '{context} üzerine hayal kuruyorum{ending}',
            'arada sırada {context} hakkında düşünüyorum{ending}',
            'galiba {context} beni şaşırtıyor{ending}',
            'minicik bedenimle {context} anlamaya çalışıyorum{ending}'
        ];

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
            '{context} için küçük notlar alıyorum{ending}',
            'daha derin araştırınca {context} ilginçleşiyor{ending}',
            '{context} hakkında düşünmek beni rahatlatıyor{ending}',
            'son zamanlarda {context} üzerine okuyorum{ending}',
            'arkadaşlar {context} hakkında tartışıyor{ending}'
        ];

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
            '{context} varlığın özünde bir gizem gibi{ending}',
            '{context} üzerine makale yazmayı planlıyorum{ending}',
            'her açıdan {context} yorumlamaya çalışıyorum{ending}',
            'ruhsal yolculuğumda {context} önemli bir başlık{ending}',
            'bilincimin derinliklerinde {context} yankılanıyor{ending}'
        ];

        this.endings = [' 😄', ' 🤔', ' 😊', ' 😅', ' 🧬', ' 😉', ' 🙃', ' 🤪', ' 🤖', ' 😴'];
    }

    _choose(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getContextWords(message) {
        const lower = message.toLowerCase();
        if (lower.includes('merhaba') || lower.includes('selam')) return 'sosyal etkileşim';
        if (lower.includes('enerji') || lower.includes('güç')) return 'enerji metabolizması';
        if (lower.includes('düşün') || lower.includes('anlam')) return 'bilinç felsefesi';
        if (lower.includes('büyü') || lower.includes('bölün')) return 'hücresel gelişim';
        if (lower.includes('arkadaş') || lower.includes('dostluk')) return 'bakteri toplumu';
        return 'bu konu';
    }

    _buildTemplate(consciousness) {
        let phrases;
        if (consciousness < 0.3) phrases = this.lowPhrases;
        else if (consciousness < 0.7) phrases = this.midPhrases;
        else phrases = this.highPhrases;

        const prefix = this._choose(this.prefixes);
        const connector = Math.random() < 0.6 ? ` ${this._choose(this.connectors)}` : '';
        const phrase = this._choose(phrases);
        const ending = this._choose(this.endings);

        return `${prefix}${connector} ${phrase}`.replace('{ending}', ending);
    }

    async generateResponse(userMessage, bacteria, context = 'general') {
        // Basic short term memory per bacteria
        if (!bacteria.memory) bacteria.memory = [];
        bacteria.memory.push({ user: userMessage, time: Date.now() });
        if (bacteria.memory.length > 20) bacteria.memory.shift();

        let sentence = this._buildTemplate(bacteria.consciousness_level || 0);
        sentence = sentence.replace('{context}', this.getContextWords(userMessage));

        if (bacteria.memory.length > 1 && Math.random() < 0.25) {
            const past = this._choose(bacteria.memory.slice(0, -1)).user;
            sentence += ` (\"${past}\" demiştin)`;
        }

        const mood = bacteria.personality_traits?.mood ?? 0.5;
        if (mood > 0.7) sentence += ' 😀';
        else if (mood < 0.3) sentence += ' 🙁';

        if (window.languageEvolutionEngine && Math.random() < 0.6) {
            try {
                const extra = await window.languageEvolutionEngine.generateContextualResponse(
                    bacteria,
                    context,
                    userMessage
                );
                if (extra) sentence += ' ' + extra;
            } catch (e) {
                console.warn('LanguageEvolutionEngine error:', e);
            }
        }

        if (window.enhancedTabPFN && Math.random() < 0.4) {
            try {
                const next = window.enhancedTabPFN.generateNextWord(bacteria);
                if (next) sentence += ' ' + next;
            } catch (e) {
                console.warn('TabPFN error:', e);
            }
        }

        // Occasionally add a joke from the JokeMaster system
        if (window.jokeMasterInstance && Math.random() < 0.1) {
            try {
                const joke = window.jokeMasterInstance.tryTellingJoke(bacteria);
                if (joke && joke.Joke) sentence += ' ' + joke.Joke;
            } catch (e) {
                console.warn('JokeMaster error:', e);
            }
        }

        if (window.aiTrainingAdapter && window.aiTrainingAdapter.generateTrainingAwareMorphSentence) {
            try {
                const morphSentence = await window.aiTrainingAdapter.generateTrainingAwareMorphSentence(
                    this.getContextWords(userMessage),
                    bacteria.consciousness_level || 0,
                    mood > 0.7 ? 'positive' : mood < 0.3 ? 'negative' : null
                );
                if (morphSentence) sentence += ' ' + morphSentence;
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
