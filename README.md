# NeoMag

Bir bakteri kolonisinde **Türkçe dil evrimi** simülasyonu ve üzerine kurulu
**anlaşılabilirlik modeli**.

Bakteriler sabit cümleler seçmez. Ne söyleyecekleri iç durumlarından (açlık,
komşuluk, atık, merak) çıkar; nasıl söyleyecekleri bildikleri sözcüklerden ve
Türkçe morfolojiden. Anlaşılan sözcük güçlenir ve yayılır, anlaşılmayan
zayıflar ve unutulur — dil bu baskı altında değişir.

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + testler + build + tarayıcı duman testi
```

---

## Ne yapıyor

| Katman | Sorumluluk |
|---|---|
| `src/core` | Ekoloji, hareket, doğum/ölüm. Tohumlanmış RNG; aynı tohum → aynı koşu. |
| `src/lang` | Türkçe fonoloji ve morfoloji, üretici gramer, niyet seçimi, leksikon evrimi. |
| `src/ml` | Sıfırdan yazılmış MLP ve çevrimiçi anlaşılabilirlik modeli. |
| `src/sim` | Üçünü birbirine bağlayan tek nokta. |
| `src/ui` | Canvas, grafikler, denetçi, sohbet. |

### Dil üretimi

Dört katman, sırayla:

1. **Niyet** — `src/lang/intent.ts`. Enerji, komşu sayısı, atık ve açık sorular
   konuşma edimini belirler. Aç bir hücre şikâyet eder veya ister; tok ve
   sosyal olan paylaşım önerir.
2. **Sözdizim** — `src/lang/grammar.ts`. Çerçeveler *morfolojik özellik taşıyan
   öğe dizileri*dir, delikli string değil. Fiil değerliği (geçişli / yönelmeli /
   çift geçişli) zorunludur; nesne veren bir çerçeve geçişsiz fiil kabul etmez.
3. **Morfoloji** — `src/lang/morphology.ts`. Ünlü uyumu, ünsüz benzeşmesi,
   sözlüksel koşullu yumuşama ve ünlü düşmesi, altı zaman, soru eki, türetim.
4. **Üslup** — kişilik yalnızca *hangi* çerçeve ve sözcüğün seçildiğini
   etkiler. Rastgele ünlem ve emoji eklenmez.

Yeni sözcükler gerçek türetim ekleriyle üretilir (`-lIk`, `-CI`, `-lI`, `-sIz`,
`-lAn`, `-lAş`, `-mA`, `-Iş`), bu yüzden çekimlenebilirler:

```
aç    + -lIk → açlık   → açlığım
paylaş + -mA → paylaşma
düşün  + -Iş → düşünüş → düşünüşlük
```

### Mizah

Rastgele absürt sözcük komik değildir. Burada mizah **beklenti ihlali** olarak
modellenmiştir: bir cümlenin *registeri* (soyutluk düzeyi) ile konuşanın gerçek
aciliyeti arasındaki fark. Açlıktan ölürken "Varlık nedir?" diye sormak
uyumsuzdur; toksa sormak değildir. Ölçüt tek yönlüdür ve kalıtsal `humor`
özelliği tarafından tetiklenir — yani ölçülebilir ve seçilime açıktır.

### Model

`src/ml/net.ts` elle yazılmış bir MLP: tohumlanmış başlatma, Adam, ikili
çapraz entropi. Gradyanları testte sayısal türevle karşılaştırılır.

`src/ml/model.ts` bunu bir cümlenin anlaşılıp anlaşılmayacağını tahmin etmek
için kullanır. Girdiler **yalnızca konuşanın gözleyebileceği** özelliklerdir —
kendi sözcüklerine güveni, o dinleyiciyle geçmiş başarısı, mesafe, cümlenin
morfolojik karmaşıklığı. Dinleyicinin dağarcığı girdilere dâhil değildir;
olsaydı model hiçbir şey ölçmezdi.

Her beşinci gözlem eğitime hiç girmeyen bir doğrulama kümesine ayrılır, ve
metrikler her zaman çoğunluk sınıfı temel çizgisiyle birlikte raporlanır.

---

## Ölçümler

Sayılar iddia değil, `tools/` altındaki betiklerin çıktısıdır.

**Ekolojik denge** — `npm run balance`

```
seed         peak  final  mean(late)  cv(late)  energy   nutr  waste
balance-0      58     47        46.3     0.136    0.19   22.2    4.8
...
extinctions=0/4  mean population=46.2  mean CV=0.128
```

90 simüle dakika boyunca kayma yok. (Bu deponun önceki motoru popülasyonu
~5 simüle saniyede sıfıra düşürüyordu.)

**Modelin etkisi** — `npm run experiment`

Aynı dünya tohumu iki kolda da kullanılır ve model iki kolda da *eğitilir*;
tek fark tahminlerinin cümle seçimine izin verilip verilmediğidir.

```
control   comprehension: 58.78%
treatment comprehension: 61.31%
difference: 2.53 pp  (sd 1.82 pp, t=3.92, n=8) → significant at 0.05
model held-out accuracy: 64.7% vs majority baseline 61.9%
```

**Konuşma örneği** — `npm run sample`

```
Sana enerji paylaşıyorum.        [offer/need] 3/4
Gölge artıyor.                   [warn/environment] 1/4
Güç nerede?                      [ask/need] 3/4
Neden düşünüyoruz?               [reflect/cognition] 3/4
Ölüm bir iz mi?                  [reflect/existence] 2/4 ✦
```

Sağdaki sayı: cümleyi anlayan dinleyici / duyan dinleyici. `✦` uyumsuzluk
eşiğini aşan (komik) cümleleri işaretler.

---

## Doğrulama

`npm run check` şunları çalıştırır:

- **Lint** — gerçek kurallarla (`no-redeclare`, `no-undef`, `no-unused-vars` …).
- **Typecheck** — `strict`, `noUnusedLocals`, `noUnusedParameters`.
- **88 test** — morfoloji bilinen Türkçe formlara karşı, ağın gradyanları sayısal
  türeve karşı, ekolojinin 10.000+ tick boyunca sabit kalması, ve dilin sabit
  bir cümle listesine çökmediği.
- **Tarayıcı duman testi** — üretim derlemesini gerçek Chromium'da açar; **tek bir
  console hatası veya başarısız istek** testi düşürür.

Kapsam: %95 satır, %88 dal (eşikler %75 / %70).

---

## Betikler

| Komut | İş |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | `dist/` üretimi |
| `npm run check` | Tüm doğrulama zinciri |
| `npm run sample` | Başsız koşu + konuşma dökümü |
| `npm run balance` | Ekolojik denge taraması |
| `npm run experiment` | Eşleştirilmiş A/B deneyi (model açık/kapalı) |

Duman testi yerelde önceden kurulu bir tarayıcı kullanabilir:
`CHROMIUM_PATH=/path/to/chrome npm run smoke`.

---

## Depo geçmişi

`legacy/` altında önceki sürümün tek dosyalık uygulaması (`index_v9.6.2.html`),
eski notlar ve veri dosyaları arşivlenmiştir. Neden değiştirildiği ve hangi
kararların alındığı `docs/DURUM_ANALIZI_VE_KARARLAR.md` içinde ölçümleriyle
birlikte anlatılıyor; yeni mimarinin gerekçeleri `docs/MIMARI.md` içinde.

## Lisans

MIT.
