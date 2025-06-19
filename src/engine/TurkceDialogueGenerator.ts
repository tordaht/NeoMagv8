// @ts-nocheck
/**
 * Turkish Dialogue Generator
 * Gelişmiş Türkçe cümle üretimi: template sistem + morfoloji motoru
 */

import { morphologyEngine } from '@/engine/MorphologyEngine.ts';
import { SEMANTIC_FIELDS } from '@/utils/semanticFields.ts';
import { wordSuccessTracker } from './WordSuccessTracker.ts';
import type { Bacteria } from '../types';

export class TurkceDialogueGenerator {
    constructor() {
        this.morphologyEngine = morphologyEngine;
        
        // Kelime başarı oranları (WordSuccessTracker entegrasyonu için)
        this.wordSuccessRates = new Map();
        
        // Gelişmiş semantik alanlar ve template'ler
        this.semanticFields = {
            biological: {
                subjects: ['bakteri', 'hücre', 'enzim', 'organizma', 'virüs', 'protein', 'molekül'],
                verbs: ['sentezlemek', 'üretmek', 'taşımak', 'bölünmek', 'çoğalmak', 'gelişmek', 'evrilmek'],
                objects: ['enerji', 'protein', 'DNA', 'besin', 'molekül', 'oksijen', 'karbonhidrat'],
                adverbs: ['hızlıca', 'verimli bir şekilde', 'sürekli', 'organik olarak', 'kimyasal yolla'],
                templates: [
                    "{subj} {obj_acc} {verb_yor}.",                    // Bakteri proteini sentezliyor.
                    "{subj} {adv} {verb_yor}.",                       // Hücre hızlıca bölünüyor.
                    "{subj} {obj_dat} doğru {verb_er}.",              // Enzim besine doğru hareket eder.
                    "{subj} {obj_gen} {verb_se}, ne olur?",          // Bakteri DNA'nın evrilse, ne olur?
                    "Bence {subj} {obj_acc} {verb_meli}."            // Bence organizma enerjiyi üretmeli.
                ]
            },
            social: {
                subjects: ['topluluk', 'arkadaş', 'grup', 'birey', 'komşu', 'aile', 'dostluk'],
                verbs: ['paylaşmak', 'birleşmek', 'konuşmak', 'yardım etmek', 'anlamak', 'desteklemek', 'sevmek'],
                objects: ['bilgi', 'deneyim', 'sevinç', 'sır', 'duygu', 'hikaye', 'anı'],
                adverbs: ['samimiyetle', 'açıkça', 'birlikte', 'gönüllü olarak', 'sessizce'],
                templates: [
                    "{subj} {obj_acc} {target_dat} {verb_er}.",       // Arkadaş bilgiyi komşuya paylaşır.
                    "{subj} {adv} {verb_yor}.",                     // Topluluk birlikte konuşuyor.
                    "Acaba {subj} {obj_acc} {verb_se_mi}?",         // Acaba birey sırrı paylaşsa mı?
                    "{subj}, {obj_gen} {verb_mek_istiyor}.",        // Dostluk, sevincin paylaşmak istiyor.
                    "Keşke {subj} {obj_loc} {verb_se}..."           // Keşke grup hikayede birleşse...
                ]
            },
            creative: {
                subjects: ['hayal', 'fikir', 'sanat', 'yaratıcılık', 'ilham', 'düş', 'vizyon'],
                verbs: ['geliştirmek', 'yaratmak', 'keşfetmek', 'tasarlamak', 'hayal etmek', 'çizmek', 'üretmek'],
                objects: ['düşünce', 'dünya', 'evren', 'proje', 'eser', 'konsept', 'model'],
                adverbs: ['yaratıcı bir şekilde', 'ilham alarak', 'özgürce', 'cesurca', 'spontane olarak'],
                templates: [
                    "{subj} {obj_acc} {verb_yor}.",                  // Hayal dünyayı yaratıyor.
                    "{subj} {adv} {verb_er}.",                       // Sanat ilham alarak gelişir.
                    "Belki {subj} {obj_loc} {verb_bilir}?",         // Belki fikir projede gelişebilir?
                    "{subj} sanki {obj_acc} {verb_yormuş}.",        // Yaratıcılık sanki evreni keşfediyormuş.
                    "Eğer {subj} {obj_gen} {verb_se}..."            // Eğer ilham düşüncenin yaratsa...
                ]
            },
            philosophical: {
                subjects: ['bilinç', 'varoluş', 'gerçek', 'hakikat', 'anlam', 'düşünce', 'felsefe'],
                verbs: ['sorgulamak', 'düşünmek', 'anlamak', 'keşfetmek', 'araştırmak', 'tartışmak'],
                objects: ['hayat', 'evren', 'zaman', 'kimlik', 'amaç', 'değer', 'özgürlük'],
                adverbs: ['derin bir şekilde', 'felsefi olarak', 'sorgulayarak', 'düşünerek'],
                templates: [
                    "{subj} {obj_acc} {verb_yor}.",                  // Bilinç hayatı sorguluyor.
                    "Acaba {subj} {obj_gen} {verb_bilir_mi}?",      // Acaba varoluş zamanın anlayabilir mi?
                    "{subj} {adv} {verb_mekte}.",                   // Düşünce derin bir şekilde araştırmakta.
                    "Belki {subj} {obj_loc} {verb_dır}?",           // Belki hakikat evrende vardır?
                    "Eğer {subj} {obj_acc} {verb_se}..."            // Eğer felsefe özgürlüğü keşfetse...
                ]
            },
            absurd: {
                subjects: ['uzaylı', 'hipopotam', 'çaydanlık', 'bulut', 'robot', 'balık', 'ejder'],
                verbs: ['dans etmek', 'uçmak', 'hayal etmek', 'şarkı söylemek', 'düşlemek', 'ziplamak'],
                objects: ['gözyaşı', 'gökkuşağı', 'mantık', 'çikolata', 'mıknatıs', 'müzik', 'sanat'],
                adverbs: ['aniden', 'sessizce', 'komik bir şekilde', 'garip biçimde', 'sürreal olarak'],
                templates: [
                    "{subj} {obj_acc} {adv} {verb_er}.",             // Dinozor pizzayı aniden dans eder.
                    "Neden {subj} {obj_acc} {verb_yor}?",          // Neden uzaylı mikrofonu hayal ediyor?
                    "{subj} sanki {obj_loc} {verb_yormuş}!",        // Hipopotam sanki gökkuşağında uçuyormuş!
                    "Keşke {subj} {obj_gen} {verb_se}...",          // Keşke çaydanlık mantığın dans etse...
                    "{subj} {obj_acc} hiç {verb_mez}."              // Robot çikolatayı hiç söylemez.
                ]
            },
            emotional: {
                subjects: ['sevgi', 'üzüntü', 'neşe', 'korku', 'öfke', 'mutluluk', 'heyecan'],
                verbs: ['hissetmek', 'yaşamak', 'paylaşmak', 'anlamak', 'büyümek', 'azalmak'],
                objects: ['kalp', 'ruh', 'duygu', 'anı', 'yaşam', 'umut', 'hayal'],
                adverbs: ['derinden', 'samimiyetle', 'yoğun biçimde', 'sakinçe', 'tutkuyla'],
                templates: [
                    "{subj} {obj_loc} {verb_yor}.",                  // Sevgi kalpte yaşıyor.
                    "{subj} {adv} {verb_er}.",                       // Mutluluk derinden hissedilir.
                    "Acaba {subj} {obj_acc} {verb_bilir_mi}?",      // Acaba korku ruhu anlayabilir mi?
                    "{subj} {obj_gen} {verb_se_ne_olur}?",          // Öfke duygunun büyüse ne olur?
                    "Sanki {subj} {obj_dat} {verb_yormuş}."         // Sanki neşe umuda paylaşıyormuş.
                ]
            }
        };
    }

    /**
     * Bakteri kelime haznesini al
     */
    getBacteriaVocabulary(bacteria: Bacteria, context: string) {
        if (!bacteria || !bacteria.vocabulary) {
            return { subjects: [], verbs: [], objects: [], adverbs: [] };
        }
        
        const words = Array.from(bacteria.vocabulary);
        
        // Basit heuristik ile kelime türlerini kategorize et
        const subjects = words.filter(w => w.length >= 3 && !w.includes('mak') && !w.includes('mek'));
        const verbs = words.filter(w => w.includes('mak') || w.includes('mek') || w.includes('etmek'));
        const objects = words.filter(w => w.length >= 3 && !verbs.includes(w));
        const adverbs = words.filter(w => w.includes('ce') || w.includes('ça') || w.includes('olarak'));
        
        return { subjects, verbs, objects, adverbs };
    }

    /**
     * Ağırlıklı kelime seçimi
     */
    weightedPick(arr, contextKey, wordType) {
        if (!arr || arr.length === 0) return null;

        // WordSuccessTracker ile ağırlıklı seçim yap (template hariç)
        if (wordType !== 'template' && typeof wordSuccessTracker?.getWeightedRandomWord === 'function') {
            const weighted = wordSuccessTracker.getWeightedRandomWord(contextKey, arr);
            if (weighted) return weighted;
        }

        // Fallback: rastgele seçim
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * String'in ilk harfini büyük yap
     */
    capitalize(str) {
        return str ? str[0].toUpperCase() + str.slice(1) : "";
    }

    /**
     * Template'deki slotları doldur
     */
    fillTemplate(template: string, field: string, bacteria: Bacteria, weightedSelection: boolean) {
        let sentence = template;
        const replacements = {};
        
        // Kelime havuzlarını birleştir (base + bacteria vocabulary)
        const externalVocab = this.getBacteriaVocabulary(bacteria, field);
        const combinedField = {
            subjects: [...new Set([...field.subjects, ...externalVocab.subjects])],
            verbs: [...new Set([...field.verbs, ...externalVocab.verbs])],
            objects: [...new Set([...field.objects, ...externalVocab.objects])],
            adverbs: [...new Set([...(field.adverbs || []), ...(externalVocab.adverbs || [])])]
        };
        
        // Özne
        if (template.includes("{subj}")) {
            const subject = weightedSelection(combinedField.subjects);
            if (subject) {
                replacements.subj = this.capitalize(subject);
            }
        }
        
        // Fiil çekimleri
        if (template.includes("{verb")) {
            const verbRoot = weightedSelection(combinedField.verbs);
            if (verbRoot) {
                if (template.includes("{verb_yor}")) {
                    replacements.verb_yor = this.morphologyEngine.conjugateVerb(verbRoot, 'present_continuous');
                } else if (template.includes("{verb_er}")) {
                    replacements.verb_er = this.morphologyEngine.conjugateVerb(verbRoot, 'aorist');
                } else if (template.includes("{verb_di}")) {
                    replacements.verb_di = this.morphologyEngine.conjugateVerb(verbRoot, 'past_definite');
                } else if (template.includes("{verb_se}")) {
                    replacements.verb_se = this.morphologyEngine.conjugateVerb(verbRoot, 'conditional');
                } else if (template.includes("{verb_meli}")) {
                    replacements.verb_meli = this.morphologyEngine.conjugateVerb(verbRoot, 'necessity');
                } else if (template.includes("{verb_mek_istiyor}")) {
                    replacements.verb_mek_istiyor = verbRoot + " istiyor";
                } else if (template.includes("{verb_bilir}")) {
                    replacements.verb_bilir = this.morphologyEngine.conjugateVerb(verbRoot, 'ability');
                } else if (template.includes("{verb_mekte}")) {
                    replacements.verb_mekte = this.morphologyEngine.conjugateVerb(verbRoot, 'progressive');
                }
            }
        }
        
        // Nesne halleri
        if (template.includes("{obj")) {
            const objectRoot = weightedSelection(combinedField.objects);
            if (objectRoot) {
                if (template.includes("{obj_acc}")) {
                    replacements.obj_acc = this.morphologyEngine.applyAdvancedSuffix(objectRoot, 'accusative');
                } else if (template.includes("{obj_dat}")) {
                    replacements.obj_dat = this.morphologyEngine.applyAdvancedSuffix(objectRoot, 'dative');
                } else if (template.includes("{obj_loc}")) {
                    replacements.obj_loc = this.morphologyEngine.applyAdvancedSuffix(objectRoot, 'locative');
                } else if (template.includes("{obj_gen}")) {
                    replacements.obj_gen = this.morphologyEngine.applyAdvancedSuffix(objectRoot, 'genitive');
                } else if (template.includes("{obj_naked}")) {
                    replacements.obj_naked = objectRoot;
                }
            }
        }
        
        // Zarf
        if (template.includes("{adv}") && combinedField.adverbs.length > 0) {
            const adverb = weightedSelection(combinedField.adverbs);
            if (adverb) {
                replacements.adv = adverb;
            }
        }
        
        // Hedef (başka bir özne)
        if (template.includes("{target_dat}") && combinedField.subjects.length > 1) {
            const target = this.weightedPick(
                combinedField.subjects.filter(s => s !== replacements.subj?.toLowerCase())
            );
            if (target) {
                replacements.target_dat = this.morphologyEngine.applyAdvancedSuffix(target, 'dative');
            }
        }
        
        // Template'deki slotları doldur
        for (const [slot, value] of Object.entries(replacements)) {
            if (value) {
                sentence = sentence.replace(new RegExp(`{${slot}}`, 'g'), value);
            }
        }
        
        // Eksik slotları temizle
        sentence = sentence.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();
        
        return sentence;
    }

    /**
     * Ana cümle üretim fonksiyonu
     */
    generateSentence(bacteria: Bacteria, contextKey: string = 'creative', triggerInfo: any = null) {
        const field = this.semanticFields[contextKey] || this.semanticFields.creative;

        // Template seç
        const templates = field.templates || ["{subj} {obj_acc} {verb_yor}."];
        const template = this.weightedPick(templates, contextKey, 'template');

        if (!template) {
            return `${bacteria?.name || 'Birisi'} bir şeyler düşünüyor...`;
        }

        // Template'i doldur - ağırlıklı seçim fonksiyonunu ilet
        const weightedSelection = (arr) => this.weightedPick(arr, contextKey);
        let sentence = this.fillTemplate(template, field, bacteria, weightedSelection);
        
        // Noktalama kontrol
        if (!sentence.match(/[.!?]$/)) {
            sentence += '.';
        }
        
        // Çok kısa cümleleri zenginleştir
        if (sentence.split(' ').length < 3) {
            const fallbackTemplates = [
                `${bacteria?.name || 'Bakteri'} ${sentence}`,
                `Sanki ${sentence}`,
                `Belki ${sentence}`
            ];
            sentence = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
        }
        
        return sentence;
    }

    /**
     * Bağlama özel cümle üretimi
     */
    generateContextualSentence(bacteria, context, additionalInfo = {}) {
        console.log(`🎭 TurkceDialogueGenerator: ${context} bağlamında cümle üretiliyor...`);
        
        const sentence = this.generateSentence(bacteria, context);
        
        // Ek bilgilere göre modifikasyon
        if (additionalInfo.mood === 'sad' && Math.random() < 0.3) {
            return `Üzgünüm ama... ${sentence}`;
        } else if (additionalInfo.mood === 'happy' && Math.random() < 0.3) {
            return `Harika! ${sentence}`;
        } else if (additionalInfo.energy === 'low' && Math.random() < 0.3) {
            return `Yorgunum, yine de... ${sentence}`;
        }
        
        return sentence;
    }

    /**
     * Test fonksiyonu
     */
    test() {
        console.log('🧪 TurkceDialogueGenerator Test:');
        
        const testBacteria = {
            name: 'TestBacteria',
            vocabulary: new Set(['yaşam', 'enerji', 'hayal', 'arkadaş', 'uçmak'])
        };
        
        const contexts = ['biological', 'social', 'creative', 'philosophical', 'absurd', 'emotional'];
        
        contexts.forEach(context => {
            const sentence = this.generateSentence(testBacteria, context);
            console.log(`${context}: ${sentence}`);
        });
    }
}

// Global instance
export const turkceDialogueGenerator = new TurkceDialogueGenerator(); 