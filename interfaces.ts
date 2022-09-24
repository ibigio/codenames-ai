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
  // attribution: AttributedHint;
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

export interface Guesser {
  id: string;
  guess(hint: Hint): Promise<AttributedGuess[]>;
  update_state(update: PartialGameState): void;
}

export interface Nomination {
  hint: AttributedHint;
  metadata?: any;
}

export interface Nominator {
  id: string;
  nominate(): Promise<Nomination[]>;
  update_state(update: CompleteGameState): void;
}
