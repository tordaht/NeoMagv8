import { summarize } from '../src/engine/ContextSummarizer.js';
import { CharacterProfile } from '../src/engine/CharacterProfile.js';
import { generateAnswer } from '../src/engine/LanguageEngine.js';

const chatHistory = [];

const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendMessageBtn');
const messagesDiv = document.getElementById('chatMessages');
const indicator = document.getElementById('chatLoadingIndicator');

function addMessage(sender, text, type) {
  setTimeout(() => {
    const div = document.createElement('div');
    div.className = `chat-message ${type}`;
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 0);
}

async function onUserMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  chatInput.value = '';
  addMessage('Sen', msg, 'user');
  chatHistory.push({ sender: 'user', text: msg });

  indicator.classList.remove('hidden');
  const summary = await summarize(chatHistory);
  const profile = new CharacterProfile('Bakteri-2', 'curious');
  const reply = await generateAnswer(msg, summary, profile);
  indicator.classList.add('hidden');

  chatHistory.push({ sender: 'bacteria', text: reply });
  addMessage('Bakteri', reply, 'bacteria');
}

sendBtn?.addEventListener('click', onUserMessage);
chatInput?.addEventListener('keypress', e => {
  if (e.key === 'Enter') onUserMessage();
});

export { summarize, CharacterProfile, generateAnswer };

// Example usage
// import { summarize } from './engine/ContextSummarizer';
// import { CharacterProfile } from './engine/CharacterProfile';
// import { generateAnswer } from './engine/LanguageEngine';
//
// async function onUserMessage(userMsg) {
//   const summary = await summarize(chatHistory);
//   const profile = new CharacterProfile('Bakteri-2', 'curious');
//   const reply = await generateAnswer(userMsg, summary, profile);
//   displayBotReply(reply);
// }
