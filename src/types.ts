export interface Personality {
  optimism: number;
  sociability: number;
  creativity: number;
  adventurousness: number;
  traditionalism: number;
}

export interface Bacteria {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  age: number;
  energy_level: number;
  growth_rate: number;
  consciousness_level: number;
  mood: number;
  language_stage: number;
  personality: Personality;
  vocabulary: Set<string>;
  interaction_count: number;
  memory_bank: any[];
  velocity: { x: number; y: number };
  color: string;
  lastMessage: string;
  lastMessageTime: number;
  selected?: boolean;
  currentContext?: string;
}

export interface SimulationManager {
  bacteriaPopulation: Bacteria[];
  initialize(): Promise<void>;
  start(): void;
  stop(): void;
  addChatMessage(sender: string, message: string, type: string): void;
}

export interface LanguageEvolutionEngine {
  init(): Promise<void>;
  initializeLanguageStyle(bacteria: Bacteria): void;
  generateCreativeExpression(bacteria: Bacteria, context: string): Promise<string>;
  adaptLanguageStyle(
    bacteria: Bacteria,
    wasSuccessful: boolean,
    context: string,
    responseWords?: string[]
  ): void;
  updateBigrams(bacteria: Bacteria, words: string[]): void;
  getStatus(): any;
}
