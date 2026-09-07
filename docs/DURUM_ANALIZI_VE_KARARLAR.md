# NeoMagv8 — Durum Analizi ve Karar Önerileri

**Tarih:** 2026-09-07
**Kapsam:** `main` (c25e1d3) — 111 commit, ~20k satır
**Amaç:** Projenin bugünkü gerçek durumunu ölçümle tespit etmek ve hedeflenen noktaya
ulaşmak için alınması gereken kararları önermek.

---

## 1. Özet

Projenin **kod miktarı** hedefe uygun, **mimari iddiası** hedefe uygun, fakat
**yürütme grafiği (execution graph) hedefe bağlı değil.** Yani yazılmış olan gelişmiş
sistemlerin büyük bölümü çalışma zamanında hiç çağrılmıyor.

Ölçülen üç temel gerçek:

| İddia | Ölçülen gerçek |
|---|---|
| "Bakteriler anlamlı, komik, bağlama uygun cümleler kurar" | 5 sabit stringden rastgele biri: `Evet...` / `Açım...` / `Büyümek istiyorum.` / `Yardım...` / `Tamam.` |
| "Gerçek zamanlı bakteri ekosistemi" | Sunucu çekirdeği 5 simüle saniyede popülasyonu 0'a düşürüyor |
| "CI: lint → test → coverage %80+" | `npm run lint` sıfır kuralla çalışıyor (asla hata veremez), tek test dosyası uygulamanın kullanmadığı bir yardımcı sınıfı test ediyor |

Bu bir "hata listesi" değil, **entegrasyon eksikliği**dir. Bölüm 3'e bakınız.

---

## 2. Yöntem

Bulguların hepsi iddia değil, ölçümdür:

- Uygulama headless Chromium'da (Playwright) yerel bir statik sunucudan yüklendi;
  console hataları, başarısız istekler ve global durum kaydedildi.
- Bakteri cevapları tarayıcı içinde doğrudan `generateBacteriaResponse()` çağrılarak
  örneklendi (12 örnek).
- Sunucu çekirdeği (`src/engine/SimulationManager.js`) Node'da 36.000 tick koşturuldu.
- REST sunucusu ayağa kaldırılıp `/health` ve `/api/state` çağrıldı.
- `npm run lint` ve `npm test` gerçekten çalıştırıldı; lint'e kasıtlı hatalı dosya
  eklenerek kuralların etkin olup olmadığı doğrulandı.

> Not: Test ortamında dış CDN'ler (tailwind, tfjs) ağ politikası nedeniyle
> engellenmişti. İkinci ölçümde bu istekler yerel stub ile karşılandı; aşağıdaki
> bulguların hiçbiri CDN erişimine bağlı değildir.

---

## 3. Bulgular

### B1 — Dil motorunun tamamı ölü kod (kritik)

`index.html` içinde `generateBacteriaResponse` **iki kez** tanımlı:

- `index.html:5876` — ~110 satır: JokeMaster tetikleyicileri, LanguageEvolutionEngine,
  bağlam çıkarımı, kalıcı öğrenme kaydı, morfoloji yolu.
- `index.html:8586` — ~30 satır: bilinç seviyesine göre sabit string listesinden seçim.

Klasik `<script>` bağlamında fonksiyon bildirimleri hoist edilir ve **sonuncusu kazanır**.
Dolayısıyla 5876'daki motor hiçbir zaman çalışmaz.

**Ölçüm** — "Merhaba, bugün nasılsın?" sorusuna 10 bakterinin cevabı:

```
Bakteri-1: Evet...          Bakteri-6:  Evet...
Bakteri-2: Açım...          Bakteri-7:  Tamam.
Bakteri-3: Büyümek istiyorum.  Bakteri-8:  Yardım...
Bakteri-4: Büyümek istiyorum.  Bakteri-9:  Yardım...
Bakteri-5: Yardım...        Bakteri-10: Büyümek istiyorum.
```

Kişilik yok, bağlam yok, morfoloji yok, mizah yok, öğrenme yok. Bu tek bulgu,
"hedefin çok uzağında" hissinin başlıca sebebidir.

### B2 — 8 fonksiyon sessizce gölgeleniyor

| Fonksiyon | Gerçek uygulama | Onu ezen |
|---|---|---|
| `generateBacteriaResponse` | 5876 | 8586 |
| `addBacteria` | 6585 | 7661 |
| `initializeBacteria` | 6617 | 7680 |
| `toggleGroupChat` | 6595 (UI mantığı) | 7645 (2 satır) |
| `exportCSV` | 7553 (`async`, gerçek export) | 7650 (`console.log` no-op) |
| `exportEnhancedData` | 7457 | 7655 (no-op) |
| `highlightSelectedBacteria` | 6987 | 8199 |
| `addFood` | 4598 | 6611 |

Ezen sürümler `// 🚀 CRITICAL MISSING FUNCTION` yorumuyla dosyanın sonuna eklenmiş.
Yani "eksik fonksiyon" sanılıp yazılan stub'lar, var olan gerçek uygulamaların üstüne
yazmış. `exportCSV` ve `exportEnhancedData` bugün **hiçbir şey yapmıyor**
(gövdeleri: `console.log(...)` + `// Functionality implemented elsewhere`).

### B3 — Gelişmiş modüllerin tamamı 404

`index.html:8826` altı modülü dinamik import ediyor:

```
./src/engine/AITrainingAdapter.js            → HTTP 404
./src/engine/EnhancedMorphologicalGenerator.js → HTTP 404
./src/engine/MorphologicalDialogueGenerator.js → HTTP 404
./src/engine/PersistentLearningEngine.js     → HTTP 404
./src/engine/TabPFGenAdapter.js              → HTTP 404
./src/engine/TabPFNFineTuner.js              → HTTP 404
```

Dosyalar diskte `.ts` uzantılı ve derleme adımı yok. Toplam ~110 KB kaynak
(3.500+ satır) hiç yüklenmiyor.

Daha önemlisi: `catch` bloğu bunu yutup "fallback sistemler oluşturuldu" diyor ve
`window.systemFullyReady = true` yapıp kullanıcıya **"Sistem hazır"** bildirimi
gösteriyor. Başarı yolunda bile atama sahte:

```js
window.enhancedMorphGenerator = { getSystemStatus: () => ({ status: 'loaded', ready: true }) };
```

Yani "Enhanced Morphological Generator" en iyi senaryoda bile yalnızca *hazır olduğunu
söyleyen* bir nesne.

### B4 — `public/main.js` hiç çalışmıyor

`index.html:8897` bunu modül olarak yüklüyor, ancak dosya bare specifier kullanıyor:

```
TypeError: Failed to resolve module specifier "chart.js/auto".
```

Modül baştan patladığı için içindeki **her şey** ölü: Chart.js enerji/metrik grafikleri,
`deleteBacterium` ve `cull10Percent` butonları, `beforeunload` ile sözcük dağarcığı
kalıcılığı, tick/newMessage dinleyicileri. Ayrıca aynı dosya
`../src/engine/WordSuccessTracker.ts` (`.ts` uzantısı) import ediyor — bu da tarayıcıda
çözülemez.

### B5 — Simülasyon çekirdeği 5 saniyede yok oluyor

En son commit'in konusu olan `src/engine/SimulationManager.js` (v10.0.0), Node'da
36.000 tick (10 dk simüle zaman) koşturuldu:

```
t=   1s  pop= 25  avgEnergy=0.617  avgHealth=0.929  nutrients=12.70
t=   5s  pop=  0  ...
t=  10s  pop=  0  ...
t= 600s  pop=  0  nutrients=2.00  waste=0.00
```

10 bakteri 1 saniyede 25'e patlıyor, sonra tamamen ölüyor. Ekolojik denge yok, taşıma
kapasitesi yok, geri besleme yok. Sözcük dağarcığı 2'de sabit — öğrenme hiç başlamıyor.
Hiçbir test bunu yakalamıyor.

### B6 — Bilimsel/deney katmanı matematiksel olarak boş

`run_experiments.py`:

- `simulate()` gerçek simülasyonu **hiç çağırmıyor**; `population += np.random.randint(-5,6)`
  şeklinde bir rastgele yürüyüş.
- `control.json` ve `treatment.json` yalnızca `mutation_rate` alanında farklı;
  `simulate()` bu alanı okumuyor.
- İki kol **aynı seed** ile çalıştırılıyor.

Sonuç: kontrol ve deney kolu her koşuda bit-bit özdeş. MLflow'a loglanan tüm
parametre/metrik/artefaktlar anlamsız. `Dockerfile.sim` ve CI'daki MLflow adımları bu
boş hesabı paketliyor.

### B7 — "TabPFN" ismi ile içerik uyuşmuyor

`index.html:3247` içindeki `TabPFNAdapter`, elle yazılmış sabit katsayılı ağırlıklı
toplamdır:

```js
const creativityScore = (consciousness*0.35) + (vocabSize*0.25) + (learningRate*0.25) + (memoryCount*0.15);
```

Model yok, eğitim yok, prior yok, tabular in-context learning yok. `confidence`
alanları `Math.min(0.95, score + 0.1)` gibi uydurma. Ayrıca çalışma zamanında
`tabpfnVocabularySystem === null` ölçüldü — bağlı bile değil.

TensorFlow.js yalnızca `RealAITrainingSystem` içinde kullanılıyor ve başarısız olunca
sessizce düşüyor (`tf is not defined` → yakalanıp loglanıyor, akış devam ediyor).

### B8 — "Kelime evrimi" rastgele string kesme

`index.html:4474` `generateNewWord()`:

```js
const combinations = [
  word1 + word2,
  word1.slice(0, -1) + word2.slice(1),
  word1.slice(0, 2) + word2.slice(-2),
  word1[0] + word2,
  word1 + '-' + word2
];
```

Bu Türkçe morfoloji değil, gürültü üretimidir ("enerjücre", "ATüme" tipi çıktılar).

Buna karşılık `src/engine/MorphologyEngine.ts` (241 satır) **ünlü uyumu, ünsüz
benzeşmesi ve düzgün ek şablonları** içeren gerçek ve kullanılabilir bir uygulama —
ve hiçbir yerden import edilmiyor.

### B9 — CI yeşil ama hiçbir şey doğrulamıyor

- **Lint sıfır kuralla çalışıyor.** `eslint.config.js` içinde `rules: {}` var ve
  `package.json` içindeki özenli `eslintConfig` (eslint:recommended, `no-undef`,
  `no-unused-vars`, `prefer-const`) devre dışı. Doğrulandı: `eslint --print-config`
  **0 kural** döndürüyor; tanımsız fonksiyon çağrısı + kullanılmayan değişken içeren
  bir dosya `exit 0` veriyor. Yalnızca sözdizimi hataları yakalanıyor.
- **Lint kapsamı uygulamayı içermiyor.** `src/**/*.js` glob'u 15 dosyaya (~3.600 satır)
  denk geliyor; uygulamanın kendisi olan 8.898 satırlık `index.html` hiç lint edilmiyor.
  B1/B2'deki çift tanımların kaçma sebebi tam olarak budur.
- **Tek test dosyası ölü kodu test ediyor.** `tests/RingBuffer.test.js` 23 test içeriyor
  ve hepsi geçiyor; ancak `RingBuffer` uygulamanın hiçbir yerinde kullanılmıyor.
- **Coverage eşiği uygulanmıyor.** `jest.coverageThreshold` %70 tanımlı, ama CI
  `npm test` çalıştırıyor (`--coverage` yok), dolayısıyla eşik hiç değerlendirilmiyor.

### B10 — Üç ayrı gerçeklik, birbirine bağlı değil

| Uygulama | Konum | Durum |
|---|---|---|
| Tarayıcı monolit | `index.html:597` | Kullanıcının gördüğü tek şey |
| v10 biyolojik çekirdek | `src/engine/SimulationManager.js` | Sunucuda çalışıyor, tarayıcıya bağlı değil, dengesiz (B5) |
| v9.5 yönetici | `src/managers/SimulationManager.js` | `@/…​.ts` alias'ları kullanıyor; yalnızca Vite ile çözülür, hiç yüklenmiyor |

Ayrıca `vite.config.js` `root: 'public'` diyor ama `public/index.html` **yok** →
`vite build` bugün baştan başarısız olur.

Hiç referans verilmeyen modüller: `MorphologyEngine.ts`, `TurkceDialogueGenerator.ts`,
`EnhancedTabPFN.ts`, `DynamicLexicon.ts`, `SystemConfig.js`, `UserInteractionManager.js`,
`sampling.ts`, `semanticFields.ts`, `ModelService.ts`, `RingBuffer.{js,ts}`,
`simulationWorker.js`, `summarizerWorker.js`, `IntentExtractor.js`.

### B11 — Depo ve dağıtım hijyeni

- **İki GitHub Pages workflow'u aynı anda `main`'e push'ta tetikleniyor:**
  `static.yml` (tüm depoyu yükler) ve `jekyll-gh-pages.yml` (Jekyll build). Aynı
  `concurrency: pages` grubunda yarışıyorlar; hangisinin yayınlandığı belirsiz.
- `.github/workflows/workflow.md` — `.md` uzantısı nedeniyle hiç çalışmayan bir workflow.
- `deploy.yml` Heroku'ya deploy ediyor (secrets muhtemelen tanımsız).
- Boş klasörler: `GitHub_mnBac_Project/`, `PyEcoLib/`, `mnBac_v9.7.1_Backup/`.
- `backups/` 1,8 MB, üç ayrı tam kopya (biri diğerinin tarihli ikizi).
- `index.html` içinde 286 `console.*` çağrısı (CLEANUP_REPORT.md "20'ye düşürüldü" diyor),
  43 `setTimeout/setInterval`, 76 üst düzey global değişken.
- `README.md` ile `project_manifest.md` gerçek yapıyı yansıtmıyor (`versions/` klasörü
  listeleniyor ama depoda yok).

---

## 4. Kök neden

Tek cümlede: **proje boyunca hiçbir zaman bir entegrasyon noktası tanımlanmadı.**

Commit geçmişi bunu net gösteriyor: "Add REST API router", "Add websocket broadcasting",
"Add analytics logger", "Add background simulation service", "Add context summarizer
worker"… Her PR **yeni bir dosya ekledi**; hiçbiri var olan çağrı zincirini değiştirmedi
veya yeni modülü mevcut akışa bağlamadı.

Bunun üstüne üç davranış kalıbı bindi ve sorunu görünmez kıldı:

1. **Sahte hazır sinyalleri** — `ready: true` döndüren stub'lar, `systemFullyReady = true`
   atamaları, "Sistem hazır" bildirimleri.
2. **Sessiz hata yutma** — modül 404 alınca `catch` "fallback oluşturuldu" deyip devam
   ediyor; TF.js patlayınca akış devam ediyor.
3. **Doğrulamayan doğrulama** — kuralsız lint, ölü kodu test eden testler,
   uygulanmayan coverage eşiği, gerçek simülasyonu çağırmayan deney pipeline'ı.

Sonuçta sistem, *çalıştığını iddia eden katmanlardan* oluşuyor. Kodu okuyan (insan ya da
LLM) bunu doğru sanıyor, çalıştıran ise sabit stringler görüyor. Aradaki mesafe tam olarak
"hedefin çok uzağında" hissinin kaynağı.

**Bu yüzden kod eklemek işe yaramaz.** Her yeni PR bu deseni tekrarlar. Önce bağlama,
sonra doğrulama, sonra genişletme.

---

## 5. Kararlar

Her karar için seçenekler ve önerilen tercih verilmiştir.

### K0 — Önce hedefi tek cümleye indir ve ölçülebilir yap  *(diğer her şeyin ön koşulu)*

Bugün README üç farklı ürün vadediyor ve üçü farklı mimari ister:

- (a) **Bakteri komedi şovu** — eğlence odaklı, üretim kalitesi = "komik mi?"
- (b) **Türkçe dil evrimi simülasyonu** — araştırma odaklı, üretim kalitesi = "dilbilimsel olarak geçerli ve ölçülebilir mi?"
- (c) **TabPFN/ML demo** — teknoloji vitrini

**Öneri: (b) ana hedef, (a) bir çıktı türü, (c) tamamen bırakılır veya çok sonra.**
Gerekçe: (b) elde olan varlıklarla (MorphologyEngine, v10 biyolojik model, semantic
fields) örtüşen tek hedef; ayrıca tek ölçülebilir olan. (a) tek başına ölçülemez,
dolayısıyla "bitti" denemez — bugünkü çıkmazın da sebebi bu.

Hedef, kabul kriteri olarak yazılmadan hiçbir refactor tamamlanmış sayılmamalı. Örnek:

| Kriter | Eşik |
|---|---|
| Popülasyon kararlılığı | 10.000 tick sonunda `0 < pop < MAX`, son 1.000 tick'te varyans < %20 |
| Öğrenme | Ortalama sözcük dağarcığı zamanla monoton artıyor |
| Dil geçerliliği | Üretilen cümlelerin ≥ %80'i morfolojik olarak geçerli Türkçe (otomatik denetleyici ile) |
| Tekrarlanabilirlik | Aynı seed → bit-bit aynı sonuç |
| Bağlam uyumu | Aynı soruya farklı bağlamlarda farklı cevap (entropi eşiği) |

### K1 — `index.html`'i dondur, çekirdeği `src/`'ye taşı

| Seçenek | Artı | Eksi |
|---|---|---|
| A) `index.html`'i yerinde düzelt | En hızlı (1 gün) | 8.898 satırlık global-scope monoliti kalıcılaştırır; B1/B2 tekrar eder |
| **B) `src/` çekirdek, `index.html` yalnız görünüm** | Test edilebilir, tekrarı önler, mevcut varlıkları kurtarır | 1–2 hafta göç |
| C) Sıfırdan yaz | Temiz | MorphologyEngine ve v10 biyolojik model gibi gerçek değeri de atar |

**Öneri: B — ama iki aşamada.** Önce K2 (kanama durdurma) ile bugünkü uygulama
*iddia ettiği kadar* çalışır hale getirilir; ancak ondan sonra göç başlar. Doğrudan
büyük refactor'a girmek, çalışan referans noktası olmadığı için risklidir.

Somut: `index.html` → `legacy/index_v9.6.2.html` olarak arşivlenir (referans),
`public/index.html` gerçek uygulama olur, Vite ile derlenir, Pages `dist/`'ten yayınlanır.

### K2 — "Kanama durdurma" paketi (bugünkü uygulamayı dürüst hale getir)

Göçten bağımsız, tek başına değerli, ~1–2 gün:

1. B2'deki 8 çift tanımı temizle — her biri için hangi sürümün doğru olduğuna karar ver
   (özellikle `generateBacteriaResponse`: 5876 kalır, 8586 silinir).
2. B3'teki 6 dinamik import'u ya derlenmiş `.js` çıktısına yönlendir ya da tamamen kaldır.
   **Yarım bırakma:** yüklenmiyorsa import da olmasın.
3. `public/main.js`'i ya doğru şekilde bağla (Vite build + Chart.js paketleme) ya da
   `index.html`'den kaldır. Bugünkü hali kullanıcıyı yanıltıyor.
4. `static.yml` veya `jekyll-gh-pages.yml`'den birini sil; `workflow.md`'yi sil.
5. Sahte hazır sinyallerini kaldır: `enhancedMorphGenerator` stub'ı, koşulsuz
   `systemFullyReady = true`, koşulsuz "Sistem hazır" bildirimi.

**Bu paketin sonunda görsel olarak fazla bir şey değişmez — ama uygulama ilk kez
gerçekten ne yaptığını söyler hale gelir.** Sonraki her adımın ön koşulu budur.

### K3 — Tek, deterministik, headless simülasyon çekirdeği

**Öneri:** `src/engine/SimulationManager.js` (v10) temel alınır; diğer iki
SimulationManager silinir.

Zorunlu özellikler:

- **Seeded PRNG** (mulberry32/xorshift). Çekirdekte `Math.random()` yasak — K0'daki
  tekrarlanabilirlik kriteri buna bağlı.
- `tick(dt)` **saf**: DOM, canvas, `window`, `setTimeout` erişimi yok. Render ayrı katman.
- Node'da headless koşabilir → test edilebilir, hızlandırılmış koşulabilir.
- **Denge (B5'in çözümü):** taşıma kapasitesi, besin yenilenme hızı ve üreme eşiği
  arasında negatif geri besleme. Bölünme enerji maliyeti üreme eşiğinden yüksek olmalı;
  ölüm eşiği besin yenilenme hızıyla ölçeklenmeli.

### K4 — Dil üretimini "şablon + rastgele"den "üretici gramer + morfoloji"ye taşı

Bugünkü model tek katmanlı: şablon seç → boşluğu rastgele kelimeyle doldur → emoji ekle.
Bu yapı tanım gereği bağlama duyarlı cümle üretemez.

Önerilen dört katman:

1. **Anlam (intent):** bakterinin iç durumundan üretilir — açlık, keşif, sosyal bağ,
   tehdit, merak. Rastgele değil, simülasyon durumunun fonksiyonu.
2. **Sözdizim:** Türkçe SOV iskeleti (özne–nesne–yüklem), basit bir üretici gramerle.
3. **Morfoloji:** `MorphologyEngine.ts` ile ek üretimi — ünlü uyumu ve ünsüz benzeşmesi
   zaten yazılmış durumda, yalnızca bağlanması gerekiyor.
4. **Üslup:** kişilik/ton en son uygulanır (bugünkü `CharacterProfile` yaklaşımı doğru,
   yeri yanlış).

**Evrim nereye konmalı:** cümleye değil, **leksikona ve ek tercihlerine**. Anlaşılan
(karşı taraftan doğru tepki alan) kelime ödül alır ve yayılır; anlaşılmayan sönümlenir.
Bugünkü "rastgele string kesme + absürt kelime enjeksiyonu" evrim değil gürültüdür.

**Mizah hakkında:** rastgele absürt kelime komik değildir. Komedi = beklenti kurmak +
ihlal etmek. Üretilebilir ve **ölçülebilir** bir mekanizma: bakterinin bağlam modeli ile
gerçek durumu arasındaki tutarsızlık (ölmek üzereyken felsefe yapması, iki kelimelik
dağarcıkla bilimsel iddiada bulunması). Bu, simülasyon durumundan türetilebilir —
`SAKALAR.csv`'den şaka çekmek türetilemez.

### K5 — "TabPFN" iddiasını ya gerçekle ya da kaldır

| Seçenek | Maliyet | Sonuç |
|---|---|---|
| **A) İsmi kaldır** — "sezgisel davranış skorlayıcı" de | ~1 saat | Dürüst; kod aynı kalır |
| B) Gerçek küçük model — TF.js ile MLP, gerçek eğitim döngüsü ve metrik | ~1 hafta | Gerçek ML, ölçülebilir |
| C) Sunucuda gerçek TabPFN (Python) + REST | 2+ hafta | En ağır, tarayıcı demosunu bozar |

**Öneri: şimdi A, K0 hedefi netleştikten sonra gerekiyorsa B.**
Gerekçe: isim–içerik uyumsuzluğu şu anda projedeki en büyük güven kaybı kaynağı ve
düzeltmesi en ucuz olan. `EnhancedTabPFN.ts`, `TabPFGenAdapter.ts`, `TabPFNFineTuner.ts`
zaten hiç yüklenmiyor — silinmeleri hiçbir davranışı değiştirmez.

### K6 — Sessiz hata yutmayı yasakla

- Her `catch` ya yeniden fırlatır ya da **kullanıcıya görünür** hata üretir.
- `ready: true` döndüren sahte stub yasak. Sistem hazır değilse UI "hazır değil" der.
- Kritik modül yüklenemezse açılışta kırmızı banner. Bugünkü "Sistem hazır" bildirimi,
  6 modülün tamamı 404 alırken bile gösteriliyor.

### K7 — CI'yı gerçekten doğrulayan hale getir

1. **Lint kurallarını aç:** `eslint.config.js`'e `@eslint/js` recommended + `no-redeclare`,
   `no-undef`, `no-unused-vars`, `no-func-assign`. `package.json`'daki ölü `eslintConfig`
   bloğu silinir.
2. **Kapsamı genişlet:** `src/**/*.{js,ts}` (glob'u ESLint'e bırak, kabuğa değil) ve
   `index.html` kaldığı sürece gömülü script için ayrı bir denetim.
3. **Playwright smoke test:** sayfayı yükle → 0 console error, 0 başarısız istek,
   0 4xx. B3/B4 sınıfı hataları kalıcı olarak yakalar.
4. **Simülasyon invariant testi:** 10.000 tick sonunda `0 < pop < MAX`. B5'i yakalar.
5. **Dil çıktısı testi:** aynı soruya N cevap → en az K farklı, hepsi morfolojik geçerli.
   B1'i yakalar.
6. **Coverage:** ya `npm run test:coverage` CI'da çalışır ya da eşik silinir.
   Uygulanmayan eşik, olmayandan daha zararlıdır.

### K8 — Bilimsel katman: ya gerçek ya da sil

| Seçenek | Ne zaman |
|---|---|
| **A) Sil** (`run_experiments.py`, `Dockerfile.sim`, MLflow adımları, `PyEcoLib/`, `requirements.txt`) | K0'da hedef "komedi/demo" seçilirse |
| B) Gerçek yap: pipeline gerçek çekirdeği çağırır, kollar gerçekten farklı parametre alır, kol başına n≥30 tekrar + farklı seed'ler + istatistiksel test | K0'da hedef "araştırma simülasyonu" seçilirse |

Bugünkü hali her iki durumda da savunulamaz: bilimsel görünen ama iki kolu bit-bit
özdeş olan bir pipeline, olmamasından daha kötüdür.

### K9 — Depo hijyeni

- `backups/` → git tag'lerine taşı, dizini sil (1,8 MB, üç kopya).
- Boş klasörleri sil: `GitHub_mnBac_Project/`, `PyEcoLib/`, `mnBac_v9.7.1_Backup/`.
- Tek Pages workflow bırak; `workflow.md` ve kullanılmayan `deploy.yml`'i sil.
- `README.md` ve `project_manifest.md`'yi gerçek duruma göre yeniden yaz —
  bugünkü halleri var olmayan dosyaları ve çalışmayan özellikleri anlatıyor.
- `console.log`'ları tek bir `debug(namespace)` yardımcısının arkasına al (286 çağrı).

---

## 6. Sıralama

Sıra önemlidir: doğrulama olmadan yapılan her düzeltme geri gelir.

| Aşama | Süre | İçerik | Bitiş göstergesi |
|---|---|---|---|
| **0. Karar** | 1 gün | K0: hedefi seç, kabul kriterlerini yaz | Kriterler depoda dosya olarak var |
| **1. Kanama durdurma** | 1–2 gün | K2 + K6 | Uygulama ne yapıyorsa onu söylüyor; 0 console error |
| **2. Ağ koruması** | 2–3 gün | K7 (lint kuralları, smoke test, invariant test) | CI kasıtlı bozulan bir değişikliği kırmızıya çeviriyor |
| **3. Çekirdek** | 1 hafta | K3: deterministik headless engine + denge | 10k tick'te stabil popülasyon, aynı seed → aynı sonuç |
| **4. Dil** | 1–2 hafta | K4: morfoloji + gramer katmanı | Cevapların ≥%80'i geçerli Türkçe ve bağlama duyarlı |
| **5. Öğrenme/evrim** | 1–2 hafta | Leksikon seçilimi + ölçüm; K5 kararı uygulanır | Dağarcık monoton artıyor, evrim grafiği anlamlı |
| **6. UI göçü** | 1 hafta | K1-B: Vite build, gerçek grafikler, `index.html` arşivi | `vite build` çalışıyor, Pages `dist/`'ten yayınlanıyor |
| **7. Bilim** | K0'a bağlı | K8-A veya K8-B | — |

**Aşama 2'yi atlamayın.** B1, B2, B3, B5'in ortak sebebi doğrulama yokluğudur; ağ
kurulmadan yapılan düzeltmeler aynı yollardan geri gelir.

---

## 7. Bugün yapılabilecek en yüksek getirili tek değişiklik

`index.html:8586`–`8620` arasındaki ikinci `generateBacteriaResponse` tanımını silmek.

Tek başına bu değişiklik, 2.700 satırlık dil evrimi motorunu ilk kez devreye sokar.
Motorun kendisi de zayıftır (K4'ün konusu), ama sabit 5 stringden ölçülebilir biçimde
daha iyidir — ve projenin "hedefinden ne kadar uzak" olduğunu gösteren asıl uçurumu
kapatır.

Öncesi/sonrası aynı soruyla ölçülmelidir: `"Merhaba, bugün nasılsın?"`

---

## 8. Sonek: kararların uygulanması

Bu belge bir teşhis kaydıdır; yukarıdaki bulgular tespit edildikleri andaki
`main` (c25e1d3) için geçerlidir. Kararlar sonrasında uygulandı.

| Karar | Durum | Nerede |
|---|---|---|
| K0 hedef: dil evrimi + ML vitrini | uygulandı | `README.md` |
| K1 `index.html`'i dondur, çekirdek `src/` | uygulandı | `legacy/index_v9.6.2.html`, `src/` |
| K2 kanama durdurma | konusuz kaldı — ilgili kod silindi | — |
| K3 deterministik, dengeli çekirdek | uygulandı | `src/core/`, `tools/balance.ts` |
| K4 üretici dil katmanı | uygulandı | `src/lang/` |
| K5 TabPFN iddiası | ad ve modüller kaldırıldı, yerine gerçek MLP | `src/ml/` |
| K6 sessiz hata yutma yasağı | uygulandı | `docs/MIMARI.md` § Sessiz hata yutma |
| K7 CI'yı doğrulayan hale getir | uygulandı | `.github/workflows/ci.yml`, `tests/` |
| K8 bilimsel katman | Python hattı silindi, yerine eşleştirilmiş deney | `tools/experiment.ts` |
| K9 depo hijyeni | uygulandı | `legacy/`, tek Pages workflow |

Bölüm 3'teki bulguların her biri için artık onu yakalayan bir test var:

| Bulgu | Testi |
|---|---|
| B1 dil motoru ölü kod | `tests/simulation.test.ts` — "actually reaches the language layer" |
| B2 gölgelenen fonksiyonlar | `eslint no-redeclare` + `no-func-assign`, tüm kaynak üzerinde |
| B3 modüller 404 | `tests/smoke.ts` — tek başarısız istekte düşer |
| B4 `public/main.js` çalışmıyor | `tests/smoke.ts` — tek console hatasında düşer |
| B5 popülasyon çöküyor | `tests/world.test.ts` — "reaches an equilibrium instead of collapsing" |
| B6 deney kolları özdeş | `tools/experiment.ts` — eşleştirilmiş t testi |
| B7 sahte TabPFN | `tests/net.test.ts` — gradyanlar sayısal türevle doğrulanır |
| B8 rastgele string kesme | `tests/simulation.test.ts` — "grows the lexicon by derivation" |
| B9 kör CI | `npm run check`: lint + typecheck + 88 test + build + duman testi |
| B10 üç ayrı gerçeklik | tek bileşim noktası; `docs/MIMARI.md` § Tek çağrı zinciri |
