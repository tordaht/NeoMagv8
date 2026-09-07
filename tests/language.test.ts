import { describe, expect, it } from 'vitest';
import { createRng } from '../src/core/rng.js';
import { World } from '../src/core/world.js';
import { FRAMES, realizeFrame, type PickRequest } from '../src/lang/grammar.js';
import { chooseIntent, incongruityOf, urgencyOf } from '../src/lang/intent.js';
import { Lexicon, Vocabulary, lexicalOverlap } from '../src/lang/lexicon.js';
import { coinWord, drawCoreLexicon, seedVocabulary } from '../src/lang/evolution.js';
import { generateCandidates, chooseCandidate } from '../src/lang/speaker.js';
import type { Bacterium, SpeechAct } from '../src/core/types.js';

function colony(seed = 'lang-test', population = 8) {
  const world = new World({ seed, initialPopulation: population });
  const lexicon = new Lexicon();
  const rng = createRng(`${seed}::lang`);
  const core = drawCoreLexicon(lexicon, rng, 34);
  for (const agent of world.bacteria) seedVocabulary(agent, core, lexicon, rng);
  return { world, lexicon, rng, core };
}

describe('lexicon', () => {
  it('assigns stable ids and refuses to shadow an existing surface form', () => {
    const lexicon = new Lexicon();
    const before = lexicon.size;
    const besin = lexicon.find('besin');
    expect(besin?.pos).toBe('noun');
    expect(lexicon.get(besin!.id)).toBe(besin);

    const duplicate = lexicon.define(
      { form: 'besin', pos: 'verb', field: 'need', gloss: 'clash' },
      { coined: true, bornAt: 5 },
    );
    expect(duplicate).toBe(besin);
    expect(lexicon.size).toBe(before);
  });

  it('records verb valency', () => {
    const lexicon = new Lexicon();
    expect(lexicon.find('ver')?.valency).toBe('ditransitive');
    expect(lexicon.find('kork')?.valency).toBe('intransitive');
    expect(lexicon.find('gel')?.valency).toBe('dative');
    expect(lexicon.find('ye')?.valency).toBe('transitive');
  });
});

describe('vocabulary', () => {
  it('strengthens on success far faster than it weakens on failure', () => {
    // The asymmetry is what stopped an early run of failures from erasing the
    // whole language.
    const win = new Vocabulary();
    const lose = new Vocabulary();
    win.learn('noun:besin', 0, 0.5);
    lose.learn('noun:besin', 0, 0.5);
    win.reinforce('noun:besin', true);
    lose.reinforce('noun:besin', false);
    expect(win.strengthOf('noun:besin') - 0.5).toBeGreaterThan(
      (0.5 - lose.strengthOf('noun:besin')) * 2,
    );
  });

  it('forgets words that fall below the threshold', () => {
    const vocabulary = new Vocabulary();
    vocabulary.learn('noun:besin', 0, 0.1);
    vocabulary.learn('noun:enerji', 0, 0.9);
    vocabulary.decay(0.2);
    expect(vocabulary.knows('noun:besin')).toBe(false);
    expect(vocabulary.knows('noun:enerji')).toBe(true);
  });

  it('passes a weakened copy to offspring', () => {
    const parent = new Vocabulary();
    parent.learn('noun:besin', 0, 0.8);
    const child = parent.inherit(10);
    expect(child.knows('noun:besin')).toBe(true);
    expect(child.strengthOf('noun:besin')).toBeLessThan(parent.strengthOf('noun:besin'));
  });

  it('measures overlap for the dialect metric', () => {
    const a = new Vocabulary();
    const b = new Vocabulary();
    a.learn('x', 0);
    a.learn('y', 0);
    b.learn('y', 0);
    b.learn('z', 0);
    expect(lexicalOverlap(a, b)).toBeCloseTo(1 / 3, 6);
    expect(lexicalOverlap(a, a)).toBe(1);
  });
});

describe('grammar', () => {
  const lexicon = new Lexicon();

  /** A picker that honours every constraint, backed by the whole lexicon. */
  function omniscientPick(request: PickRequest) {
    const options = lexicon.all().filter((lexeme) => {
      if (lexeme.pos !== request.pos) return false;
      if (request.exclude.has(lexeme.id)) return false;
      if (request.valency && !request.valency.includes(lexeme.valency)) return false;
      if (request.field && lexeme.field !== request.field) return false;
      return true;
    });
    return options[0] ?? null;
  }

  it('never lets an intransitive verb into a slot that supplies an object', () => {
    const violations: string[] = [];
    for (const frames of Object.values(FRAMES)) {
      for (const frame of frames) {
        const suppliesObject = frame.parts.some(
          (part) =>
            (part.kind === 'noun' && (part.case === 'acc' || part.case === 'dat')) ||
            (part.kind === 'pronoun' && (part.case === 'acc' || part.case === 'dat')),
        );
        const verb = frame.parts.find((part) => part.kind === 'verb');
        if (!suppliesObject || !verb || verb.kind !== 'verb') continue;
        if (!verb.valency || verb.valency.includes('intransitive')) {
          violations.push(JSON.stringify(frame.parts));
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('builds the question particle as a harmonised separate word', () => {
    const built = realizeFrame(
      {
        register: 0.3,
        parts: [
          { kind: 'name', comma: true },
          { kind: 'fixed', text: 'yorgun' },
          { kind: 'question', person: '2sg' },
        ],
        end: '?',
      },
      { pick: omniscientPick, addresseeName: 'Mira' },
    );
    expect(built?.text).toBe('Mira, yorgun musun?');
  });

  it('never repeats a lexeme inside one clause', () => {
    const built = realizeFrame(
      {
        register: 0.4,
        parts: [
          { kind: 'noun', field: 'space' },
          { kind: 'noun', field: 'space' },
          { kind: 'fixed', text: 'var' },
        ],
      },
      { pick: omniscientPick, addresseeName: null },
    );
    // Guards `Kuzeyde kuzey var.`
    const words = built!.text.replace(/[.!?]/g, '').split(' ');
    expect(new Set(words).size).toBe(words.length);
    expect(new Set(built!.lexemeIds).size).toBe(built!.lexemeIds.length);
  });

  it('fails rather than inventing a word it was not given', () => {
    const built = realizeFrame(
      { register: 0.2, parts: [{ kind: 'noun', field: 'need' }] },
      { pick: () => null, addresseeName: null },
    );
    expect(built).toBeNull();
  });

  it('requires an addressee for vocative frames', () => {
    const built = realizeFrame(
      { register: 0.2, parts: [{ kind: 'name' }] },
      { pick: omniscientPick, addresseeName: null },
    );
    expect(built).toBeNull();
  });
});

describe('intent', () => {
  it('scales urgency with how depleted the agent is', () => {
    const { world } = colony('urgency');
    const agent = world.bacteria[0];
    agent.energy = 0.05;
    expect(urgencyOf(agent)).toBeGreaterThan(0.9);
    agent.energy = 2;
    expect(urgencyOf(agent)).toBe(0);
  });

  it('picks distress acts when starving and reflective ones when comfortable', () => {
    const { world, rng } = colony('acts');
    const listeners = world.bacteria.slice(1, 3);

    const tally = (energy: number, humor: number): Record<string, number> => {
      const counts: Record<string, number> = {};
      for (let i = 0; i < 400; i++) {
        const agent = { ...world.bacteria[0], energy, traits: { ...world.bacteria[0].traits, humor } };
        const intent = chooseIntent(agent as Bacterium, { listeners, wasteStress: 0, time: 100 }, rng);
        if (intent) counts[intent.act] = (counts[intent.act] ?? 0) + 1;
      }
      return counts;
    };

    const starving = tally(0.05, 0.05);
    const fed = tally(2, 0.05);
    const distress = (counts: Record<string, number>): number =>
      (counts.complain ?? 0) + (counts.request ?? 0);

    expect(distress(starving)).toBeGreaterThan(distress(fed) * 3);
    expect(fed.offer ?? 0).toBeGreaterThan(starving.offer ?? 0);
  });

  it('lets the humour trait break the coupling between urgency and register', () => {
    const { world, rng } = colony('humour');
    const base = world.bacteria[0];
    const reflectShare = (humor: number): number => {
      let reflect = 0;
      let total = 0;
      for (let i = 0; i < 600; i++) {
        const agent = { ...base, energy: 0.1, traits: { ...base.traits, humor, curiosity: 0.5 } };
        const intent = chooseIntent(
          agent as Bacterium,
          { listeners: world.bacteria.slice(1, 3), wasteStress: 0, time: 100 },
          rng,
        );
        if (!intent) continue;
        total++;
        if (intent.act === 'reflect') reflect++;
      }
      return reflect / total;
    };
    expect(reflectShare(0.9)).toBeGreaterThan(reflectShare(0.02) * 1.5);
  });

  it('scores incongruity one-sidedly', () => {
    // Philosophising while starving is the comedy …
    expect(incongruityOf(0.95, 1)).toBeCloseTo(0.95, 6);
    // … being blunt while comfortable is not.
    expect(incongruityOf(0.1, 0)).toBe(0);
    expect(incongruityOf(0.95, 0)).toBe(0);
  });
});

describe('speaker', () => {
  it('produces grammatical, varied Turkish rather than a fixed string set', () => {
    const { world, lexicon, rng } = colony('speaker');
    const texts = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const agent = world.bacteria[i % world.bacteria.length];
      const intent = chooseIntent(
        agent,
        { listeners: world.bacteria.filter((peer) => peer.id !== agent.id), wasteStress: 0.2, time: 50 },
        rng,
      );
      if (!intent) continue;
      for (const candidate of generateCandidates(agent, intent, { lexicon, rng })) {
        texts.add(candidate.clause.text);
      }
    }
    // The system this replaced had five possible replies in total.
    expect(texts.size).toBeGreaterThan(60);
    for (const text of texts) {
      expect(text).toMatch(/^[A-ZÇĞİÖŞÜ]/);
      expect(text).toMatch(/[.!?]$/);
      expect(text).not.toMatch(/\{|\}|undefined|NaN/);
    }
  });

  it('only offers candidates the speaker has the words for', () => {
    const { world, lexicon, rng } = colony('poverty');
    const agent = world.bacteria[0];
    // Strip the agent down to a single noun: it should mostly fall silent.
    const only = lexicon.find('besin')!;
    (agent as Bacterium).vocabulary = new Vocabulary();
    agent.vocabulary.learn(only.id, 0, 0.9);

    let produced = 0;
    for (const act of Object.keys(FRAMES) as SpeechAct[]) {
      const candidates = generateCandidates(
        agent,
        { act, field: 'need', urgency: 0.5, addressee: null, addresseeName: 'X' },
        { lexicon, rng },
      );
      produced += candidates.length;
      for (const candidate of candidates) {
        for (const id of candidate.clause.lexemeIds) expect(agent.vocabulary.knows(id)).toBe(true);
      }
    }
    expect(produced).toBeLessThan(6);
  });

  it('returns the highest-scoring candidate', () => {
    const { world, lexicon, rng } = colony('choose');
    const agent = world.bacteria[0];
    const candidates = generateCandidates(
      agent,
      { act: 'inform', field: 'space', urgency: 0.2, addressee: null, addresseeName: null },
      { lexicon, rng },
      3,
    );
    if (candidates.length < 2) return;
    const target = candidates[candidates.length - 1];
    expect(chooseCandidate(candidates, (c) => (c === target ? 10 : 0))).toBe(target);
    expect(chooseCandidate([], () => 1)).toBeNull();
  });
});

describe('lexical innovation', () => {
  it('coins words by derivation, and the result inflects correctly', () => {
    const { world, lexicon, rng } = colony('coin');
    const agent = world.bacteria[0];
    for (const [id] of agent.vocabulary.entries()) agent.vocabulary.learn(id, 0, 0.9);

    const coinages = [];
    for (let i = 0; i < 60; i++) {
      const coinage = coinWord(agent, lexicon, rng, 100);
      if (coinage) coinages.push(coinage);
    }
    expect(coinages.length).toBeGreaterThan(5);

    for (const coinage of coinages) {
      // A derived word is a real Turkish string built from a parent it knows …
      expect(coinage.lexeme.form).toMatch(/^[a-zçğıöşü]+$/);
      expect(coinage.lexeme.form.startsWith(coinage.parent.form.slice(0, 2))).toBe(true);
      expect(coinage.lexeme.form).not.toBe(coinage.parent.form);
      // … not a splice of two unrelated stems, and the coiner knows it.
      expect(agent.vocabulary.knows(coinage.lexeme.id)).toBe(true);
      expect(coinage.lexeme.coined).toBe(true);
      expect(coinage.lexeme.origin).toContain(coinage.parent.id);
    }
  });

  it('gives the founding population a shared language to start from', () => {
    const { world, lexicon, rng } = colony('core', 12);
    const core = drawCoreLexicon(lexicon, rng, 34);
    expect(core.filter((l) => l.pos === 'verb').length).toBeGreaterThan(4);
    for (const valency of ['intransitive', 'transitive', 'dative', 'ditransitive']) {
      expect(core.some((l) => l.pos === 'verb' && l.valency === valency)).toBe(true);
    }

    // Independent per-agent seeding gave a pairwise overlap around 0.06 and the
    // language died; a shared core is what makes it a language.
    let total = 0;
    let pairs = 0;
    for (let i = 0; i < world.bacteria.length; i++) {
      for (let j = i + 1; j < world.bacteria.length; j++) {
        total += lexicalOverlap(world.bacteria[i].vocabulary, world.bacteria[j].vocabulary);
        pairs++;
      }
    }
    expect(total / pairs).toBeGreaterThan(0.5);
  });
});
