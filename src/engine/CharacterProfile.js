export class CharacterProfile {
  constructor(id, tone) {
    this.id = id;
    this.tone = tone;
  }

  applyTone(answer) {
    const phrases = {
      curious: ['merak ediyorum', 'ilginç değil mi?'],
      playful: ['haha!', 'çok eğlenceli'],
      scientific: ['bilimsel olarak', 'araştırmalara göre']
    }[this.tone] || [];

    const count = 1 + Math.floor(Math.random() * 2);
    let final = answer;
    for (let i = 0; i < count; i++) {
      const phrase = phrases[Math.floor(Math.random() * phrases.length)] || '';
      final += (phrase ? ' ' + phrase : '');
    }
    return final.trim();
  }
}
