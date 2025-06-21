// Lightweight chat loop used on the demo page.
// Each step is kept asynchronous so the UI feels instant
// even when underlying functions do heavy work.
import { summarize } from '../src/engine/ContextSummarizer.js';
import { CharacterProfile } from '../src/engine/CharacterProfile.js';
import { generateAnswer } from '../src/engine/LanguageEngine.js';
import SimulationManager from '../src/engine/SimulationManager.js';
import { wordSuccessTracker } from '../src/engine/WordSuccessTracker.ts';
import Chart from 'chart.js/auto';

let chatHistory = [];
let counter = 1;

// Setup simulation manager
const manager = new SimulationManager(5, 1);
manager.startBackground();

// Move start button into header toolbar and hook listener
const startBtn = document.getElementById('startSimulationBtn');
const toolbar = document.querySelector('header .flex.gap-2');
if (startBtn && toolbar) {
  toolbar.appendChild(startBtn);
  startBtn.addEventListener('click', () => {
    if (manager.running) {
      manager.stopBackground();
      startBtn.textContent = '▶️ Simülasyonu Başlat';
    } else {
      manager.startBackground();
      startBtn.textContent = '⏹️ Durdur';
    }
  });
}

document.getElementById('deleteBacterium').addEventListener('click', () => {
  const selectedId = getSelectedBacteriumId();
  manager.removeBacterium(selectedId);
  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof updateCharts === 'function') updateCharts();
});

document.getElementById('cull10Percent').addEventListener('click', () => {
  manager.cullPercentage(10);
  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof updateCharts === 'function') updateCharts();
});

// Load persisted vocabulary
const savedWords = wordSuccessTracker.loadBacteriaWords();
manager.bacteria.forEach(b => {
  if (savedWords[b.id]) {
    savedWords[b.id].forEach(w => b.vocabulary.add(w));
  }
});

window.addEventListener('beforeunload', () => {
  wordSuccessTracker.saveBacteriaWords(manager.bacteria);
});

// Chart.js metrics setup
const energyCtx = document.getElementById('energyChart').getContext('2d');
const energyChart = new Chart(energyCtx, {
  type: 'pie',
  data: {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#16a34a', '#facc15', '#dc2626']
    }]
  },
  options: { responsive: true }
});

const metricsCtx = document.getElementById('metricsChart').getContext('2d');
const metricsChart = new Chart(metricsCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Learned Words',
        data: [],
        backgroundColor: '#3b82f6',
        borderWidth: 1
      },
      {
        label: 'Avg Response (ms)',
        data: [],
        type: 'line',
        borderColor: '#f97316',
        fill: false,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    scales: { y1: { position: 'right', beginAtZero: true } }
  }
});

let wordCountData = [];
let responseTimeData = [];
let lastDialogue = performance.now();

function updateCharts() {
  const state = manager.getState();
  const energies = state.population.map(p => p.energy);
  const high = energies.filter(e => e > 0.66).length;
  const mid = energies.filter(e => e <= 0.66 && e >= 0.33).length;
  const low = energies.filter(e => e < 0.33).length;
  energyChart.data.datasets[0].data = [high, mid, low];
  energyChart.update();

  const totalWords = state.population.reduce((s, p) => s + p.vocabularySize, 0);
  const avgResp = responseTimeData.length
    ? responseTimeData.reduce((a, b) => a + b, 0) / responseTimeData.length
    : 0;
  metricsChart.data.labels.push('');
  metricsChart.data.datasets[0].data.push(totalWords);
  metricsChart.data.datasets[1].data.push(avgResp.toFixed(2));
  if (metricsChart.data.labels.length > 20) {
    metricsChart.data.labels.shift();
    metricsChart.data.datasets.forEach(d => d.data.shift());
  }
  metricsChart.update();
}

manager.events.on('tick', updateCharts);
manager.events.on('newMessage', () => {
  const now = performance.now();
  responseTimeData.push(now - lastDialogue);
  if (responseTimeData.length > 20) responseTimeData.shift();
  lastDialogue = now;
  wordSuccessTracker.saveBacteriaWords(manager.bacteria);
});

const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendMessageBtn');
const indicator = document.getElementById('thinkingIndicator');
const serial = document.getElementById('serial-number');

// Default persona
let selectedId = 'Bakteri-2';
let selectedTone = 'curious';

function getSelectedBacteriumId() {
  return selectedId;
}

function idle(cb) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(cb);
  } else {
    setTimeout(cb, 0);
  }
}

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
  idle(() => {
    serial.textContent = `#${++counter}`;
  });

  // 2. UI: thinking göstergesi
  idle(() => {
    indicator.style.display = 'inline-block';
  });

  // 3. Context özetle
  const summary = await summarize(chatHistory);

  // 4. Karakter profili oluştur
  const profile = new CharacterProfile(selectedId, selectedTone);

  // 5. Cevabı üret
  const reply = await generateAnswer(userMsg, summary, profile);

  // 6. UI: thinking kapat, cevap göster
  idle(() => {
    indicator.style.display = 'none';
    renderBotReply(reply);
  });

  // 7. Sohbet geçmişine ekle
  chatHistory.push({ sender: selectedId, text: reply });

  chatInput.value = '';
});
