# Agents Overview for NeoMagv8

This document describes the main "agents" (components that act autonomously or semi-autonomously) in the NeoMagv8 bacterial simulation. Each agent’s responsibilities, interfaces, and typical workflows are defined below.

---

## 1. Bacterium Agent

**Description:**  
A single “bacterium” in the simulation—moves, consumes energy, learns words, and engages in dialogue.

**Properties:**
- `id` (string): Unique identifier  
- `position` ({ x: number, y: number }): Coordinates on canvas  
- `energy` (number): Current energy level  
- `wordMemory` (Set<string>): Learned vocabulary  

**Tools & Interfaces:**
- `move()` → updates `position` based on simple physics  
- `consumeEnergy(amount: number)` → decrements `energy`  
- `learnWord(word: string)` → adds to `wordMemory` and logs via `WordSuccessTracker`  
- `speak(to: Bacterium)` → uses `LanguageEvolutionEngine` to generate a message  

**Workflow:**
1. **Tick**: On each 60 FPS tick, call `move()` and `consumeEnergy()`.  
2. **Interaction**: Every 4 s, two random bacteria call `speak()`/`receive()`.  
3. **Learning**: Successful communications invoke `learnWord()`, tracked by `WordSuccessTracker` :contentReference[oaicite:0]{index=0}.  

---

## 2. Simulation Manager Agent

**Description:**  
Coordinates the entire bacterial ecosystem—drives ticks, manages population, and dispatches dialogue events.

**Properties:**
- `bacteria` (Bacterium[]): Array of active agents  
- `tickRate` (number): Milliseconds per tick (≈16.7 ms for 60 FPS)  

**Tools & Interfaces:**
- `start()` / `stop()` → begin/end the main loop  
- `tick()` → iterate over all bacteria agents  
- `pickRandomPair(): [Bacterium, Bacterium]` → selects two agents for dialogue  
- `removeBacterium(id: string)` → culls an agent from the population  

**Workflow:**
1. **Initialization**: Load initial population (with non-hungry energy levels).  
2. **Main Loop**: Call `tick()` at fixed interval.  
3. **Autonomous Dialogue**: Every 4 s, trigger `pickRandomPair()` → `talk()` → `receive()`.  
4. **Population Control**: Supports manual “Delete” or “Cull 10%” via UI button handlers.  

---

## 3. Language Engine Agent

**Description:**  
Produces context-aware, personality-driven replies using TabPFN and custom templates.

**Properties:**
- `TabPFNAdapter` (module): Wraps `tabpfn-js` classifier  
- `templates` (Map<string, string[]>): Predefined response patterns  

**Tools & Interfaces:**
- `generateAnswer(userMsg: string, context: string, profile: CharacterProfile): Promise<string>`  
- Internally uses:  
  - `regexExtract()` for intent/entity  
  - `ContextSummarizer` for context distillation  
  - `TabPFNAdapter.predict()` for probabilistic scoring  

**Workflow:**
1. **Receive** user or peer message.  
2. **Extract** intent/entities in parallel (`Promise.all`).  
3. **Summarize** last 5 messages via `ContextSummarizer`.  
4. **Generate** 3-sentence reply, injecting `profile.applyTone()`.  

---

## 4. Word Success Tracker Agent

**Description:**  
Logs each word’s usage success/failure and updates reinforcement-learning weights.

**Properties:**
- `logFile` (`analytics_data/logs.jsonl`)  
- `cache` (Map<string, { success: number; attempts: number }>)  

**Tools & Interfaces:**
- `recordUsage(word: string, success: boolean)` → append JSONL entry   
- `getStats(word: string): { successRate: number }`  

**Workflow:**
1. **On `learnWord()`**: call `recordUsage()`.  
2. **Batching**: flush batched writes every 1 s to minimize I/O.  
3. **Analytics**: Provides data for charts under simulation canvas.  

---

## 5. Character Profile Agent

**Description:**  
Defines distinct conversation “personalities” (curious, playful, scientific).

**Properties:**
- `id` (string)  
- `tone` (`'curious'|'playful'|'scientific'`)  

**Tools & Interfaces:**
- `applyTone(text: string): string` → wraps text with tone-specific phrases  

**Workflow:**
1. **Initialized** per dialogue partner.  
2. **Injected** at end of generated reply to add color and variation.  

---

## 6. Context Summarizer Agent

**Description:**  
Condenses recent chat history into a single summary string for relevance.

**Properties:**
- `cache` (Map<string, string>)  

**Tools & Interfaces:**
- `summarize(messages: Array<{sender, text}>): Promise<string>` → offloads to Web Worker  

**Workflow:**
1. **Window**: take last 5 messages.  
2. **Cache**: return stored summary if key matches.  
3. **Worker**: spawn `summarizerWorker.js` to perform NLP under 20 ms.  

---

## 7. Charting Agent (UI)

**Description:**  
Renders real-time performance and learning metrics under the simulation canvas.

**Properties:**
- `chart` (Chart.js instance)  

**Tools & Interfaces:**
- `updateCharts(metrics: { energy: number[]; wordCount: number[]; responseTime: number })`  

**Workflow:**
1. **On every tick/dialogue**: gather metrics from `SimulationManager.getState()`.  
2. **Call** `chart.data.datasets[i].data.push(...)` and `chart.update()`.  

---

## Contributing and Versioning

- **Version:** 1.0.0  
- **Last Updated:** 2025-06-27  
- **How to Add a New Agent:**  
  1. Fork repo and create branch `feature/new-agent`.  
  2. Add a new section in `agents.md` and implement agent module under `src/`.  
  3. Submit PR for review.

---

This `agents.md` gives a unified view of each autonomous component in NeoMagv8, making onboarding and extension straightforward.
::contentReference[oaicite:1]{index=1}
