````markdown
# NeoMagv8 Agents & Code Guidelines

Bu doküman, NeoMagv8 projesindeki tüm “agent” bileşenlerinin ne işe yaradığını, hangi dosyalarda yer aldıklarını ve nasıl kodlanmaları gerektiğine dair **ayrıntılı kod yönergeleri** içerir. Kod parçacıkları, JSDoc açıklamaları, dosya yolları ve en iyi uygulama önerileriyle her agent’ın implementasyonu adım adım anlatılmaktadır.

---

## İçindekiler

1. [Genel Kod Standartları](#genel-kod-standartları)  
2. [Bacterium Agent](#1-bacterium-agent)  
3. [Simulation Manager Agent](#2-simulation-manager-agent)  
4. [Background Simulation Service Agent](#3-background-simulation-service-agent)  
5. [API Agent](#4-api-agent)  
6. [WebSocket Agent](#5-websocket-agent)  
7. [Language Engine Agent](#6-language-engine-agent)  
8. [Character Profile Agent](#7-character-profile-agent)  
9. [Context Summarizer Agent](#8-context-summarizer-agent)  
10. [Word Success Tracker Agent](#9-word-success-tracker-agent)  
11. [Charting Agent (UI)](#10-charting-agent-ui)  
12. [Test & CI Guidelines](#11-test--ci-guidelines)  
13. [Versiyon ve Katkı Süreci](#12-versiyon-ve-katkı-süreci)  

---

## Genel Kod Standartları

- **Modülerlik:** Her agent, tek bir sorumluluk (Single Responsibility Principle) ilkesiyle `src/agentName/` veya `src/server/` altında kendi klasöründe toplanmalı.
- **ES6 Modules:** Tüm dosyalarda `import`/`export` kullanın.  
- **JSDoc:** Her fonksiyon, sınıf ve önemli değişken için mutlaka açıklayıcı JSDoc ekleyin.  
- **Adlandırma:**  
  - Dosya ve klasörler `camelCase` değil, `kebab-case` (örn. `simulation-manager.js`).  
  - Sınıflar `PascalCase` (örn. `SimulationManager`).  
  - Fonksiyonlar ve değişkenler `camelCase` (örn. `startBackgroundSimulation`).  
- **Error Handling:** Asenkron I/O işlemlerini `try/catch` ile sarın, hataları loglayın veya kullanıcıya iletin.  
- **Performans:** Ağır işler (özetleme, regex parsing) Web Worker veya Worker Thread’da çalışmalı.  
- **Test Edilebilirlik:** Her modülün bağımsız fonksiyonları için birim test yazın (`tests/`).

---

## 1. Bacterium Agent

**Dosya:** `src/agents/bacterium.js`  
**Sorumluluk:** Tek bir bakteri davranışını simüle eder.

```js
/**
 * @class Bacterium
 * @description
 * Bakterinin hareket, enerji tüketimi, öğrenme ve diyalog yeteneklerini yönetir.
 */
export default class Bacterium {
  /**
   * @param {string} id  Unique ID
   * @param {{x: number, y: number}} position  Başlangıç koordinatları
   * @param {number} initialEnergy  Başlangıç enerjisi
   */
  constructor(id, position, initialEnergy) {
    this.id = id;
    this.position = { ...position };
    this.energy = initialEnergy;
    this.wordMemory = new Set();
  }

  /**
   * @description Canvas üzerinde hareket sağlar ve enerji tüketir.
   * @returns {void}
   */
  tick() {
    this.move();
    this.consumeEnergy(1);
  }

  /**
   * @description Yeni bir kelime öğrenir ve kaydeder.
   * @param {string} word
   */
  learnWord(word) {
    this.wordMemory.add(word);
    // WordSuccessTracker.recordUsage(word, true);
  }

  // Diğer yöntemler: move(), consumeEnergy(), speak(), receive()...
}
````

> **Kod Yönergesi:**
>
> * `tick()` içinde yalnızca simülasyon mantığınızı çalıştırın, DOM güncellemesini ayırın.
> * Kelime öğrenme, `WordSuccessTracker` aracılığıyla asenkron bir şekilde loglanmalı.

---

## 2. Simulation Manager Agent

**Dosya:** `src/managers/SimulationManager.js`
**Sorumluluk:** Popülasyonu yönetir, saat döngüsünü çalıştırır, diyalogları tetikler.

```js
import Bacterium from '../agents/bacterium.js';

/**
 * @class SimulationManager
 * @description
 * Bakteri ekosistemini kontrol eder: döngü, popülasyon, diyalog.
 */
export default class SimulationManager {
  constructor() {
    /** @type {Bacterium[]} */
    this.bacteria = [];
    this.tickInterval = null;
  }

  /**
   * @description Başlangıç popülasyonu yüklenir.
   * @param {{id: string, position: object, energy: number}[]} configs
   */
  initialize(configs) {
    this.bacteria = configs.map(cfg =>
      new Bacterium(cfg.id, cfg.position, cfg.energy)
    );
  }

  /**
   * @description Tek bir simülasyon adımı.
   */
  tick() {
    this.bacteria.forEach(b => b.tick());
  }

  /**
   * @description İki rastgele bakteri seçer.
   * @returns {[Bacterium, Bacterium]}
   */
  pickRandomPair() {
    const a = this.bacteria[Math.floor(Math.random() * this.bacteria.length)];
    let b;
    do {
      b = this.bacteria[Math.floor(Math.random() * this.bacteria.length)];
    } while (b.id === a.id);
    return [a, b];
  }

  /**
   * @description ID’ye göre bakteriyi siler.
   * @param {string} id
   */
  removeBacterium(id) {
    this.bacteria = this.bacteria.filter(b => b.id !== id);
  }

  /**
   * @description Popülasyonun %percent kadarını rastgele temizler.
   * @param {number} percent  // Örn. 10 → %10
   */
  cullPercentage(percent) {
    const count = Math.floor(this.bacteria.length * percent / 100);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * this.bacteria.length);
      this.bacteria.splice(idx, 1);
    }
  }
}
```

> **Kod Yönergesi:**
>
> * `initialize()` ve `tick()` saf iş mantığı, UI güncellemesini dışarıda tutun.
> * Silme ve cull metodları, `bacteria` dizisini doğrudan değiştiriyor; thread-safety gerekirse Worker Thread kullanın.

---

## 3. Background Simulation Service Agent

**Dosya:** `src/server/simulation-service.js`
**Sorumluluk:** Node.js üzerinde arka planda 60FPS döngü ve otonom diyalog.

```js
import { EventEmitter } from 'events';
import SimulationManager from '../managers/SimulationManager.js';

const simulationEvents = new EventEmitter();

/**
 * @function startBackgroundSimulation
 * @description
 * 60 FPS döngü ve her 4s’de otonom diyalog başlatır.
 * @returns {EventEmitter}
 */
export function startBackgroundSimulation() {
  const manager = new SimulationManager();

  // 60 FPS tick
  const tickId = setInterval(() => {
    manager.tick();
    simulationEvents.emit('tick', manager.getState());
  }, 1000 / 60);

  // 4s diyalog
  const dialogId = setInterval(() => {
    const [a,b] = manager.pickRandomPair();
    const msg = a.speak(b);
    b.receive(msg, a.id);
    simulationEvents.emit('dialogue', { from: a.id, to: b.id, message: msg });
  }, 4000);

  simulationEvents.once('stop', () => {
    clearInterval(tickId);
    clearInterval(dialogId);
  });

  return simulationEvents;
}
export default simulationEvents;
```

> **Kod Yönergesi:**
>
> * Manager içinde `getState()` metodu, minimal JSON serileştirmesi döndürecek şekilde optimize edilmeli.
> * EventEmitter üzerinden yayınlanan veriler, `api` veya `websocket` modüllerine kolayca yönlendirilebilir.

---

## 4. API Agent

**Dosya:** `src/server/api.js`
**Sorumluluk:** REST endpoint’leriyle durum ve log verilerini sunar.

```js
import express from 'express';
import simulationEvents from './simulation-service.js';
import { getAllLogs } from './logger.js';

const router = express.Router();

/**
 * GET /state
 * @returns {object} Simülasyon durumu
 */
router.get('/state', (req, res, next) => {
  // Basit cache için 100ms throttle uygulanabilir
  simulationEvents.once('tick', state => res.json(state));
});

/**
 * GET /logs
 * @returns {object[]} Kayıtlı deneyler
 */
router.get('/logs', async (req, res, next) => {
  try {
    const logs = await getAllLogs();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
```

> **Kod Yönergesi:**
>
> * Error handling middleware kurmayı unutmayın.
> * `/state` endpoint’i yoğun isteklerde cache katmanı veya throttle ile korunmalı.

---

## 5. WebSocket Agent

**Dosya:** `src/server/websocket.js`
**Sorumluluk:** Gerçek zamanlı mesajları yayınlar.

```js
import { Server } from 'socket.io';
import simulationEvents from './simulation-service.js';

/**
 * @function attachWebsocket
 * @param {http.Server} httpServer
 */
export function attachWebsocket(httpServer) {
  const io = new Server(httpServer);
  io.on('connection', socket => {
    console.log(`Client connected: ${socket.id}`);
  });
  simulationEvents.on('tick', state => io.emit('simulationTick', state));
  simulationEvents.on('dialogue', msg => io.emit('bacteriaMessage', msg));
}
```

> **Kod Yönergesi:**
>
> * Sadece değişen alanları (diff) yayınlamak, bant genişliği tasarrufu sağlar.

---

## 6. Language Engine Agent

**Dosya:** `src/engine/language-engine.js`
**Sorumluluk:** Cevapları intent, context ve profile’a göre üretir.

```js
import { summarize } from './context-summarizer.js';
import { regexExtract, selectTemplate } from '../utils/engine-utils.js';

/**
 * @async
 * @function generateAnswer
 * @param {string} userMsg
 * @param {string} contextSummary
 * @param {CharacterProfile} profile
 * @returns {Promise<string>}
 */
export async function generateAnswer(userMsg, contextSummary, profile) {
  // 1. Paralel intent & şablon seçimi
  const [intent, template] = await Promise.all([
    regexExtract(userMsg),
    selectTemplate(userMsg)
  ]);

  // 2. Yanıt cümleleri
  const s1 = `Anlıyorum, ${intent.topic} hakkında konuşuyorsun.`;
  const s2 = `Önceki konuşmada: "${contextSummary}" gördüm.`;
  const raw = `${s1} ${s2} ${template}`;
  // 3. Profile enjeksiyonu
  return profile.applyTone(raw);
}
```

> **Kod Yönergesi:**
>
> * `regexExtract` içinde karmaşık regex’ler worker’a taşınmalı.
> * `Promise.all` ile yanıt üretim adımları eş zamanlı çalıştırılır.

---

## 7. Character Profile Agent

**Dosya:** `src/engine/character-profile.js`
**Sorumluluk:** Cevaplara tonalite ekler.

```js
/**
 * @class CharacterProfile
 */
export class CharacterProfile {
  static phrases = {
    curious: ['Hmm, ilginç!', 'Merak ettim doğrusu.'],
    playful: ['Hoho, ne eğlenceli!', 'Buna bayıldım!'],
    scientific: ['Veriler gösteriyor ki…', 'Bilimsel açıdan bakacak olursak…']
  };

  /**
   * @param {string} id
   * @param {'curious'|'playful'|'scientific'} tone
   */
  constructor(id, tone) {
    this.id = id;
    this.tone = tone;
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  applyTone(text) {
    const p = CharacterProfile.phrases[this.tone];
    const phrase = p[Math.floor(Math.random() * p.length)];
    return `${phrase} ${text}`;
  }
}
```

> **Kod Yönergesi:**
>
> * `phrases` haritasını JSON olarak dışarıda tutabilirsiniz.
> * Ton’u test etmek için birim testler yazın.

---

## 8. Context Summarizer Agent

**Dosya:** `src/engine/context-summarizer.js` & `src/engine/workers/summarizer-worker.js`
**Sorumluluk:** Sohbet geçmişini özetler.

```js
// context-summarizer.js
export async function summarize(messages) {
  const window = messages.slice(-5);
  const key = JSON.stringify(window);
  if (cache.has(key)) return cache.get(key);

  const worker = new Worker(new URL('./workers/summarizer-worker.js', import.meta.url));
  const summary = await new Promise(res => {
    worker.onmessage = e => res(e.data);
    worker.postMessage(window);
  });
  cache.set(key, summary);
  return summary;
}
```

```js
// workers/summarizer-worker.js
onmessage = e => {
  const msgs = e.data;
  const summary = msgs.map(m => m.text).join(' ').slice(0, 100) + '…';
  postMessage(summary);
};
```

> **Kod Yönergesi:**
>
> * Worker işi 20 ms altında tamamlanmalı.
> * Cache boyutu kontrolü ekleyin (örn. LRU cache).

---

## 9. Word Success Tracker Agent

**Dosya:** `src/server/logger.js`
**Sorumluluk:** Öğrenme metriklerini JSONL olarak yazar.

```js
import { promises as fs } from 'fs';
import path from 'path';

const logFile = path.resolve('analytics_data/logs.jsonl');

/**
 * @param {object} entry  // { word, success, timestamp }
 */
export async function recordExperiment(entry) {
  const line = JSON.stringify(entry) + '\n';
  await fs.mkdir(path.dirname(logFile), { recursive: true });
  await fs.appendFile(logFile, line);
}
```

> **Kod Yönergesi:**
>
> * Batching: 1 saniyede bir flush yapan bir queue tasarlayın.

---

## 10. Charting Agent (UI)

**Dosya:** `public/main.js`, `public/index.html`
**Sorumluluk:** Simülasyon verilerini grafikle sunar.

```html
<!-- index.html -->
<div id="toolbar">… <canvas id="energyChart"></canvas> …</div>
```

```js
// main.js
import Chart from 'chart.js/auto';

const ctx = document.getElementById('energyChart');
const energyChart = new Chart(ctx, {
  type: 'pie',
  data: { datasets: [{ data: [], backgroundColor: [] }], labels: [] }
});

simulationEvents.on('tick', state => {
  energyChart.data.datasets[0].data = state.bacteria.map(b => b.energy);
  energyChart.data.labels = state.bacteria.map(b => b.id);
  energyChart.update();
});
```

> **Kod Yönergesi:**
>
> * Chart.js kurulumunu `npm install chart.js` ile yapın.
> * `update()` çağrısını throttle’layın (örn. 200ms).

---

## 11. Test & CI Guidelines

* **Birim Test:** Jest veya Mocha kullanın.
* **Test Edilecekler:**

  * `SimulationManager.tick()`, `pickRandomPair()`, `removeBacterium()`.
  * `generateAnswer()` farklı ton ve context kombinasyonlarıyla.
  * `summarize()` gerçek vs. cache’ten dönen sonuçlar.
* **CI:**

  * `.github/workflows/ci.yml`: lint → test → coverage (%80+).
  * `deploy.yml`: Docker build → push → deploy.

---

## 12. Versiyon ve Katkı Süreci

* **Version:** 1.1.0
* **Last Updated:** 2025-06-27
* **Katkı Adımları:**

  1. Fork 👉 `feature/your-agent`
  2. `agents.md`’ye yeni agent bölümünü ekle
  3. Kod modülünü `src/…` altına oluştur
  4. Birim test ve dokümantasyon ekle
  5. PR aç ve review iste

---

Bu `agents.md`, NeoMagv8’deki tüm autonomous ve yarı‐autonomous bileşenlere dair **hem konsept hem de kod seviyesi** ayrıntılı kılavuzlar içermektedir. Her agent bölümünde dosya yolu, örnek kod ve en iyi uygulama notları mevcuttur—yaklaşımı hızlıca hayata geçirebilirsiniz.
