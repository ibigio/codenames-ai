export interface Hint {
  word: string;
  number: number;
}

export type WordSet = string[];

export interface AttributedHint {
  hint: Hint;
  intended_words: WordSet;
  nominator_id: string;
  metadata?: any;
}

export interface AttributedGuess {
  guess: WordSet;
  guesser_id: string;
  metadata?: any;
}

interface Turn {
  team: string;
  hint: Hint;
  guess: WordSet;
}

export interface CompleteGameState {
  words: {
    red: string[];
    blue: string[];
    neutral: string[];
    black: string[];
  };
  turns: Turn[];
}

export interface PartialGameState {
  words: WordSet;
  turns: Turn[];
}

export interface GuessNominator {
  id: string;
  nominate(hint: Hint): Promise<AttributedGuess[]>;
  update_state(update: PartialGameState): void;
}

export interface HintNominator {
  id: string;
  nominate(): Promise<AttributedHint[]>;
  update_state(update: CompleteGameState): void;
}
