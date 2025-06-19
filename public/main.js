import { summarize } from '../src/engine/ContextSummarizer.js';
import { CharacterProfile } from '../src/engine/CharacterProfile.js';
import { generateAnswer } from '../src/engine/LanguageEngine.js';

let chatHistory = [];
let counter = 1;

const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendMessageBtn');
const indicator = document.getElementById('thinkingIndicator');
const serial = document.getElementById('serial-number');

// Default persona
let selectedId = 'Bakteri-2';
let selectedTone = 'curious';

function renderBotReply(text) {
  const div = document.createElement('div');
  div.className = 'bot-reply';
  div.textContent = text;
  document.getElementById('chatMessages').appendChild(div);
}

sendBtn.addEventListener('click', async () => {
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  // 1. Kullanıcı mesajını kaydet ve serial numarayı güncelle
  chatHistory.push({ sender: 'user', text: userMsg });
  serial.textContent = `#${++counter}`;

  // 2. UI: thinking göstergesi
  indicator.style.display = 'inline-block';

  // 3. Context özetle
  const context = await summarize(chatHistory);

  // 4. Karakter profili oluştur
  const profile = new CharacterProfile(selectedId, selectedTone);

  // 5. Cevabı üret
  const reply = await generateAnswer(userMsg, context, profile);

  // 6. UI: thinking kapat, cevap göster
  indicator.style.display = 'none';
  renderBotReply(reply);

  // 7. Sohbet geçmişine ekle
  chatHistory.push({ sender: selectedId, text: reply });

  chatInput.value = '';
});
