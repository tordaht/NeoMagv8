# Mimari

Bu belge *neden* böyle kurulduğunu anlatır. Ne olduğu README'de, önceki
durumun ölçümlü teşhisi `DURUM_ANALIZI_VE_KARARLAR.md` içinde.

---

## Temel kural: tek çağrı zinciri

Önceki sürümün asıl sorunu eksik kod değil, **bağlanmamış kod**du: 57 PR yeni
dosyalar ekledi, hiçbiri onları var olan akışa bağlamadı. Sonuçta üç ayrı
`SimulationManager`, hiç yüklenmeyen altı modül ve hiçbir zaman çağrılmayan
2.700 satırlık bir dil motoru vardı.

Buradaki karşı önlem yapısal:

```
                         src/sim/simulation.ts
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        src/core/world      src/lang/*           src/ml/*
        (ekoloji)           (dil)                (öğrenme)
```

- `core` dili **import etmez**. Konuşma anına geldiğinde `onSpeak` geri
  çağrısını çağırır. Böylece ekoloji tek başına test edilebilir ve
  ayarlanabilir (`tools/balance.ts`).
- `lang` modeli **import etmez**. Aday cümleleri üretir ve puanlama işini
  çağırana bırakır. Böylece aynı üretim yolu deneyin iki kolunda da kullanılır.
- `ml` ne dünyayı ne dili bilir; yalnızca vektör alır, olasılık döndürür.
- Üçünü tanıyan **tek** dosya `simulation.ts`. Bir alt sistem bağlantısız
  kalırsa `tests/simulation.test.ts` düşer.

Ayrıca: `src/core`, `src/lang` ve `src/ml` içinde `Math.random()` yasaktır.
Her rastgelelik dünyanın kendi tohumlu üretecinden gelir; tekrarlanabilirlik
deney hattının ön koşuludur.

---

## Ekoloji neden bu denklemler

Önceki motorun popülasyonu 1 saniyede 25'e fırlayıp 5. saniyede sıfırlanıyordu.
Sebep, üremenin ve tüketimin yoğunluktan bağımsız olmasıydı: hiçbir negatif
geri besleme yoktu.

Şimdi iki klasik mekanizma var:

- **Lojistik besin yenilenmesi**: `dR = r·(1 − R/Rmax)·dt`. Havuz boşken hızlı,
  doluyken yavaş yenilenir.
- **Michaelis–Menten alım**: `u = umax·R/(R + Ks)`. Alım doygunluğa ulaşır, yani
  kalabalık havuzu yenilenme hızından daha hızlı boşaltamaz.

Buna atık birikimi (`1/(1 + W/Wh)` çarpanı) ve yoğunluğa bağlı üreme
(`1 − N/softCap`) eklenince sistemin gerçek bir denge noktası olur. Ölçülen
denge ≈ 46 birey, CV ≈ 0.13, 90 simüle dakikada kayma yok.

Parametreler tahmin değil: `tools/balance.ts` ile tarandı ve
`tests/world.test.ts` içindeki değişmezle korunuyor.

---

## Dil neden şablon değil

Eski sistem şablon seçip boşlukları rastgele sözcükle dolduruyordu. Bu yapı
tanım gereği bağlama duyarlı cümle üretemez: şablon durumdan bağımsız seçilir,
sözcük anlamdan bağımsız seçilir.

### Çerçeveler özellik taşır

```ts
{ kind: 'noun', field: 'need', possessive: '1sg' }        // enerjim
{ kind: 'verb', field: 'need', tense: 'present',
  person: '3sg', valency: ['intransitive'] }              // azalıyor
```

Yüzey biçimi morfolojiden çıkar, çerçevede yazılı değildir. Aynı çerçeve farklı
sözcüklerle farklı ama her zaman **dilbilgisel** cümleler verir.

### Değerlik zorunlu

İlk çalışan sürüm `*Enerjimi korkalım` gibi cümleler üretiyordu: geçişsiz fiile
belirtme durumunda nesne. Fiil değerliği (`intransitive` / `transitive` /
`dative` / `ditransitive`) leksikonda tutulur ve nesne veren çerçeveler bunu
şart koşar. Bu kısıt gevşetilemez — alanı (`field`) gevşetmek imprecise bir
cümle verir, değerliği gevşetmek bozuk bir cümle verir.

### Değerlik yetmiyordu: duygusal ton

`Seni unutuyorum.` dilbilgisel olarak kusursuz ama kötü bir selamlamadır.
Fiiller ayrıca `valence` (olumlu / nötr / olumsuz) taşır; iyi niyet bildiren
çerçeveler olumsuz fiil kabul etmez.

### Sözcük seçimi konuşanın kendi dağarcığından

Seçim ağırlığı `güç² × güvenilirlik`. Yani:

- iyi bilinen sözcükler baskın çıkar,
- daha önce işe yaramış sözcükler tercih edilir,
- **bilinmeyen sözcük kullanılamaz** — dağarcığı iki sözcük olan bir birey
  gerçekten susar.

Bu son madde dili "evrimleşen" yapan şeydir: söylenebilir olan, bilinenle
sınırlıdır.

---

## Dilin çökmesini önleyen iki ayar

İlk çalışan sürümde anlaşılma oranı %4.5'e düşüyor ve dil ölüyordu. İki neden
vardı; ikisi de ölçülerek bulundu.

**1. Kurucuların ortak dili yoktu.** Her birey 123 sözcüklük havuzdan bağımsız
olarak 14 sözcük çekiyordu; ikili örtüşme 0.06. Kimse kimseyi anlamıyor →
her sözcük başarısız → güçler sıfıra iniyor → unutuluyor.

Çözüm: önce koloninin **ortak çekirdek sözlüğü** çekilir (34 sözcük, sözcük
türü ve fiil değerliği kotalı), sonra her kurucu bunun ~%85'ini artı birkaç
kendine özgü sözcüğü öğrenir. Örtüşme 0.06 → 0.64.

**2. Pekiştirme simetrikti.** Başarı ve başarısızlık aynı hızda uygulanıyordu,
bu yüzden erken bir başarısızlık serisi dağarcığı siliyordu. Artık asimetrik:
başarı 0.12, başarısızlık 0.03. Bir kez anlaşılmayan sözcük unutulmaz, ama
sürekli anlaşılmayan unutulur.

Üçüncü bir ayar anlaşılma denge noktasını ~0.23'ten ~0.50'ye taşıdı: dikkat
terimi enerji tavanına değil rahat enerji düzeyine göre normalleştirildi ve
bağlamdan gelen küçük bir taban eklendi. Bu yalnızca "daha canlı koloni" için
değil — %23'te modelin çoğunluk temel çizgisi %81'di ve öğrenecek şey yoktu.

---

## Model neden bu kadar mütevazı

Model, konuşanın **göremeyeceği** şeyleri girdi olarak almaz. Yer gerçeği
(`groundTruthScore`) dinleyicinin dağarcığını okur; özellik vektörü okumaz.
Dolayısıyla problem kısmi bilgilidir ve tavan düşüktür.

Ölçülen: ayrılmış kümede %64.7 doğruluk, çoğunluk temel çizgisi %61.9.
Küçük ama gerçek. Kolonideki etkisi eşleştirilmiş deneyde 2.53 puan
(t = 3.92, n = 8).

Bu bilinçli bir tercih. Dinleyicinin dağarcığını girdiye koymak doğruluğu
kolayca %85'e çıkarırdı ve hiçbir şey ölçmezdi.

Sosyal bağın da bir düzeltmesi var: additif (+0.06 / −0.02) sürüm bir dakikada
neredeyse tüm çiftlerde 1'e doyuyordu, yani konuşanın gözleyebildiği en güçlü
sinyal bilgi taşımayı bırakıyordu. Şimdi çift başına başarı oranının üstel
hareketli ortalaması.

---

## Sessiz hata yutma yasağı

Önceki sürümün en zararlı deseni, hazır *olduğunu söyleyen* ama olmayan
katmanlardı: `getSystemStatus: () => ({ ready: true })` döndüren saplamalar,
404'ü yutup "fallback oluşturuldu" diyen `catch` blokları, altı modül birden
yüklenemezken gösterilen "Sistem hazır" bildirimi.

Karşılığı:

- Arayüzdeki durum rozeti gerçek durumu söyler: `duraklatıldı` → `model ısınıyor
  (n/200)` → `çalışıyor · model etkin`.
- `ComprehensionModel.ready` yeterli gözlem birikene kadar `false`'tur ve o
  zamana kadar tahminleri kullanılmaz.
- Duman testi tek bir console hatasında düşer, yani bir modül sessizce
  yüklenemezse commit kırmızıya döner.

---

## Bilinen sınırlar

- **Uzamsal lehçeler zayıf.** İşitme yarıçapı ve sosyal çekim küme oluşturuyor
  ama ayrık lehçeler için popülasyonun daha büyük ve daha az hareketli olması
  gerekir. `cohesion` metriği ölçüyor; ayrık lehçe henüz güvenilir biçimde
  ortaya çıkmıyor.
- **Anlambilim sığ.** Sözcükler anlamsal alanlara aittir ama bileşimsel bir
  anlam temsili yok; "uygunsuz alan" kullanımı cezalandırılır, yanlış anlam
  modellenmez.
- **Model küçük.** 13 girdi → 16 gizli → 1. Daha zengin özellikler (konuşanın
  o alandaki geçmiş başarısı, dinleyicinin gözlenebilir yaşı) muhtemelen birkaç
  puan daha verir.
- **Söz dizimi tek yan tümceli.** Bağlaç, yan cümle, zamir gönderimi yok.
