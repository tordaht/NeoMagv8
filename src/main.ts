/**
 * Browser entry point.
 *
 * The whole app is reachable from here: one `Simulation`, one render loop, one
 * set of DOM bindings. There is no second code path and no dynamically
 * imported "advanced system" that can fail to load while the UI reports that
 * everything is ready.
 */

import './ui/app.css';
import { Simulation } from './sim/simulation.js';
import type { Bacterium, Utterance, WorldEvent } from './core/types.js';
import { ColonyView } from './ui/colony.js';
import { createTimeSeries, type ChartHandle } from './ui/charts.js';

const FIXED_DT = 1 / 30;
/** Guards against a huge catch-up burst after the tab has been backgrounded. */
const MAX_STEPS_PER_FRAME = 240;
const SAMPLE_INTERVAL = 2;

/** A muted helper paragraph, built as a node so nothing goes through innerHTML. */
function hint(text: string): HTMLParagraphElement {
  const node = document.createElement('p');
  node.className = 'hint';
  node.textContent = text;
  return node;
}

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

class App {
  private simulation!: Simulation;
  private view!: ColonyView;
  private unsubscribe: (() => void) | null = null;

  private running = false;
  private speed = 1;
  private lastFrame = 0;
  private accumulator = 0;
  private nextSample = 0;

  private readonly charts: Record<string, ChartHandle> = {};
  private readonly transcript = element('transcript');
  private readonly events = element('events');
  private readonly inspector = element('inspector');
  private readonly status = element('status');
  private readonly chatInput = element<HTMLInputElement>('chat-input');
  private readonly chatSend = element<HTMLButtonElement>('chat-send');

  start(): void {
    this.buildCharts();
    this.bindControls();
    this.boot(element<HTMLInputElement>('seed').value || 'neomag');
    requestAnimationFrame((time) => this.frame(time));
  }

  // ------------------------------------------------------------- lifecycle --

  private boot(seed: string): void {
    this.unsubscribe?.();
    this.simulation = new Simulation({ world: { seed } });
    this.view = new ColonyView(element<HTMLCanvasElement>('colony'), this.simulation.world);
    this.unsubscribe = this.simulation.subscribe((event) => this.onEvent(event));

    this.transcript.replaceChildren();
    this.events.replaceChildren();
    this.nextSample = 0;
    this.select(null);
    this.view.render();
    this.refreshTiles();
  }

  private bindControls(): void {
    element('toggle').addEventListener('click', () => {
      this.running = !this.running;
      element('toggle').textContent = this.running ? 'Duraklat' : 'Başlat';
      this.lastFrame = performance.now();
      this.refreshStatus();
    });

    element<HTMLSelectElement>('speed').addEventListener('change', (event) => {
      this.speed = Number((event.target as HTMLSelectElement).value);
    });

    element('reset').addEventListener('click', () => {
      this.boot(element<HTMLInputElement>('seed').value || 'neomag');
      for (const chart of Object.values(this.charts)) chart.retheme();
    });

    element('theme').addEventListener('click', () => {
      const root = document.documentElement;
      const dark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', dark ? 'light' : 'dark');
      for (const chart of Object.values(this.charts)) chart.retheme();
    });

    element('colony').addEventListener('click', (event) => {
      const mouse = event as MouseEvent;
      this.select(this.view.pick(mouse.clientX, mouse.clientY));
    });

    this.chatSend.addEventListener('click', () => this.sendChat());
    this.chatInput.addEventListener('keydown', (event) => {
      if ((event as KeyboardEvent).key === 'Enter') this.sendChat();
    });
  }

  private buildCharts(): void {
    this.charts.population = createTimeSeries({
      canvas: element<HTMLCanvasElement>('chart-population'),
      series: [{ label: 'Popülasyon', colorToken: '--series-1' }],
      min: 0,
      format: (value) => value.toFixed(0),
    });
    this.charts.comprehension = createTimeSeries({
      canvas: element<HTMLCanvasElement>('chart-comprehension'),
      series: [{ label: 'Anlaşılma', colorToken: '--series-2' }],
      min: 0,
      max: 100,
      format: (value) => `${value.toFixed(0)}%`,
    });
    this.charts.vocabulary = createTimeSeries({
      canvas: element<HTMLCanvasElement>('chart-vocabulary'),
      series: [{ label: 'Sözcük', colorToken: '--series-3' }],
      min: 0,
      format: (value) => value.toFixed(0),
    });
    this.charts.model = createTimeSeries({
      canvas: element<HTMLCanvasElement>('chart-model'),
      series: [
        { label: 'AUC', colorToken: '--series-1' },
        { label: 'Şans', colorToken: '--text-muted', reference: true },
      ],
      min: 0.35,
      max: 0.85,
      format: (value) => value.toFixed(2),
    });
  }

  // ----------------------------------------------------------------- loop --

  private frame(now: number): void {
    if (this.running) {
      const elapsed = Math.min(0.25, (now - this.lastFrame) / 1000);
      this.accumulator += elapsed * this.speed;
      let steps = 0;
      while (this.accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
        this.simulation.tick(FIXED_DT);
        this.accumulator -= FIXED_DT;
        steps++;
      }
      if (steps === MAX_STEPS_PER_FRAME) this.accumulator = 0;

      if (this.simulation.world.time >= this.nextSample) {
        this.nextSample = this.simulation.world.time + SAMPLE_INTERVAL;
        this.sample();
        // Tiles and the inspector are DOM rebuilds; at 60fps they would
        // dominate the frame budget, so they follow the sampling cadence.
        this.refreshTiles();
        this.refreshInspector();
      }
    }
    this.lastFrame = now;
    this.view.render();
    requestAnimationFrame((time) => this.frame(time));
  }

  private sample(): void {
    const stats = this.simulation.stats();
    const t = stats.time;
    this.charts.population.push([stats.population], t);
    this.charts.comprehension.push([stats.comprehensionRate * 100], t);
    this.charts.vocabulary.push([stats.meanVocabulary], t);
    // Skipped until the held-out set is populated. AUC rather than accuracy:
    // the model's job is to rank a speaker's candidates, and on a near-balanced
    // problem thresholded accuracy tracks the majority baseline too closely to
    // show whether it is learning anything.
    if (stats.model.validationAccuracy > 0) {
      this.charts.model.push([stats.model.validationAuc, 0.5], t);
    }
  }

  // ------------------------------------------------------------------ DOM --

  private onEvent(event: WorldEvent): void {
    if (event.type === 'utterance') {
      this.view.say(event.utterance);
      this.appendUtterance(event.utterance);
      return;
    }
    if (event.type === 'coined') {
      const lexeme = this.simulation.lexicon.get(event.lexemeId);
      const suffix = lexeme ? ` · ${lexeme.gloss}` : '';
      this.appendEvent(`${event.byName} türetti${suffix}`, event.form);
      return;
    }
    if (event.type === 'death' && event.cause === 'starvation') {
      this.appendEvent(`${event.name} açlıktan öldü.`);
    }
  }

  private appendUtterance(utterance: Utterance): void {
    const heard = utterance.audience.filter((entry) => entry.understood).length;
    const line = document.createElement('div');
    line.className = 'line';
    line.dataset.comedy = String(utterance.incongruity > 0.5);

    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = utterance.speakerName;
    who.addEventListener('click', () => {
      this.select(this.simulation.world.find(utterance.speakerId) ?? null);
    });

    const said = document.createElement('span');
    said.className = 'said';
    said.textContent = utterance.text;

    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${utterance.act} · ${heard}/${utterance.audience.length}`;

    line.append(who, said, meta);
    // Column-reverse layout: prepending puts the newest line at the top.
    this.transcript.prepend(line);
    while (this.transcript.childElementCount > 60) this.transcript.lastElementChild?.remove();
  }

  /**
   * Built with text nodes rather than innerHTML: `word` can originate in player
   * input, and nothing the player types should be able to become markup.
   */
  private appendEvent(text: string, word?: string): void {
    const row = document.createElement('div');
    if (word !== undefined) {
      const strong = document.createElement('b');
      strong.textContent = word;
      row.append(strong, ` — ${text}`);
    } else {
      row.textContent = text;
    }
    this.events.prepend(row);
    while (this.events.childElementCount > 40) this.events.lastElementChild?.remove();
  }

  private refreshStatus(): void {
    const metrics = this.simulation.stats().model;
    if (!this.running) {
      this.status.dataset.state = 'paused';
      this.status.textContent = 'duraklatıldı';
      return;
    }
    if (!metrics.ready) {
      this.status.dataset.state = 'warming';
      this.status.textContent = `model ısınıyor (${metrics.observed}/${this.simulation.model.options.warmupSamples})`;
      return;
    }
    this.status.dataset.state = 'running';
    this.status.textContent = `çalışıyor · model etkin (${metrics.updates} güncelleme)`;
  }

  private refreshTiles(): void {
    const stats = this.simulation.stats();
    element('t-pop').textContent = String(stats.population);
    element('t-comp').textContent = `${(stats.comprehensionRate * 100).toFixed(0)}%`;
    element('t-cohesion').firstChild!.textContent = stats.cohesion.toFixed(2);
    element('t-cohesion-sub').textContent = ' ortak sözcük oranı';
    element('t-lexicon').firstChild!.textContent = String(stats.lexiconSize);
    element('t-coined').textContent = ` +${stats.coinedWords} türetilmiş`;
    element('t-vocab').textContent = stats.meanVocabulary.toFixed(1);

    const model = stats.model;
    element('t-model').firstChild!.textContent = model.ready
      ? model.validationAuc.toFixed(3)
      : '—';
    element('t-model-sub').textContent = model.ready
      ? ` AUC · doğruluk ${(model.validationAccuracy * 100).toFixed(0)}% / temel ${(
          model.baselineAccuracy * 100
        ).toFixed(0)}%`
      : ' henüz eğitilmedi';

    this.refreshStatus();
  }

  // ------------------------------------------------------------ inspector --

  private select(agent: Bacterium | null): void {
    this.view.selectedId = agent?.id ?? null;
    this.chatInput.disabled = agent === null;
    this.chatSend.disabled = agent === null;
    this.chatInput.placeholder = agent
      ? `${agent.name} ile konuşun…`
      : 'Seçili bakteriye bir şey söyleyin…';
    this.refreshInspector();
  }

  private refreshInspector(): void {
    const agent = this.view.selectedId
      ? this.simulation.world.find(this.view.selectedId)
      : undefined;
    if (!agent) {
      if (this.view.selectedId) this.select(null);
      else this.inspector.replaceChildren(hint("Canvas üzerinde bir bakteri seçin."));
      return;
    }

    const traits: [string, number][] = [
      ['Meraklılık', agent.traits.curiosity],
      ['Sosyallik', agent.traits.sociability],
      ['İyimserlik', agent.traits.optimism],
      ['Konuşkanlık', agent.traits.verbosity],
      ['Mizah', agent.traits.humor],
    ];

    const hitRate =
      agent.understood + agent.misunderstood === 0
        ? null
        : agent.understood / (agent.understood + agent.misunderstood);

    // Strongest words first: this is the agent's idiolect, and the visible
    // difference between two agents' panels is the dialect the run produced.
    const words = agent.vocabulary
      .entries()
      .map(([id, memory]) => ({ lexeme: this.simulation.lexicon.get(id), memory }))
      .filter((entry) => entry.lexeme !== undefined)
      .sort((a, b) => b.memory.strength - a.memory.strength)
      .slice(0, 18);

    this.inspector.replaceChildren();

    const facts = document.createElement('dl');
    const addFact = (label: string, value: string): void => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      facts.append(dt, dd);
    };
    addFact('Ad', agent.name);
    addFact('Nesil', String(agent.generation));
    addFact('Yaş', `${agent.age.toFixed(0)} sn`);
    addFact('Enerji', agent.energy.toFixed(2));
    addFact('Dağarcık', String(agent.vocabulary.size()));
    addFact('Söylediği', String(agent.spoken));
    addFact('Anlaşılma', hitRate === null ? '—' : `${(hitRate * 100).toFixed(0)}%`);
    this.inspector.append(facts);

    const bars = document.createElement('div');
    bars.className = 'bars';
    for (const [label, value] of traits) {
      const row = document.createElement('div');
      row.className = 'bar';
      const name = document.createElement('span');
      name.textContent = label;
      const track = document.createElement('div');
      track.className = 'track';
      const fill = document.createElement('div');
      fill.className = 'fill';
      fill.style.width = `${(value * 100).toFixed(0)}%`;
      track.append(fill);
      const number = document.createElement('span');
      number.className = 'value';
      number.textContent = value.toFixed(2);
      row.append(name, track, number);
      bars.append(row);
    }
    this.inspector.append(bars);

    const cloud = document.createElement('div');
    cloud.className = 'words';
    for (const { lexeme, memory } of words) {
      const chip = document.createElement('span');
      chip.className = 'word';
      chip.dataset.coined = String(lexeme!.coined);
      chip.textContent = lexeme!.form;
      chip.title = `${lexeme!.gloss} · güç ${memory.strength.toFixed(2)}${
        lexeme!.coined ? ' · türetilmiş' : ''
      }`;
      cloud.append(chip);
    }
    this.inspector.append(cloud);

    if (agent.lastUtterance) {
      const last = document.createElement('p');
      last.className = 'hint';
      last.textContent = `Son sözü: ${agent.lastUtterance}`;
      this.inspector.append(last);
    }
  }

  private sendChat(): void {
    const agentId = this.view.selectedId;
    const text = this.chatInput.value.trim();
    if (!agentId || !text) return;

    const line = document.createElement('div');
    line.className = 'line';
    const you = document.createElement('span');
    you.className = 'who';
    you.textContent = 'Sen';
    const said = document.createElement('span');
    said.className = 'said';
    said.textContent = text;
    line.append(you, said);
    this.transcript.prepend(line);

    const reply = this.simulation.talkTo(agentId, text);
    if (!reply) {
      this.appendEvent('Seçili bakterinin cevap verecek kelimesi yok.');
    }
    this.chatInput.value = '';
    this.refreshInspector();
  }
}

new App().start();
