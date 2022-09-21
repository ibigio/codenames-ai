import {
  Nominator,
  Guesser,
  AttributedHint,
  AttributedGuess,
  Hint,
  GameState,
} from "./interfaces.ts";

export class Agent {
  nominators: Nominator[];
  guessers: Guesser[];

  constructor(options: { nominators: Nominator[]; guessers: Guesser[] }) {
    this.nominators = options.nominators;
    this.guessers = options.guessers;
  }

  score_guess(hint: AttributedHint, guess: AttributedGuess): number {
    const intended_word_set = new Set(hint.intended_words);
    const guessed_word_set = new Set(guess.guess);

    const intersect = new Set(
      [...intended_word_set].filter((i) => guessed_word_set.has(i))
    );
    return intersect.size;
  }

  async give_hint(): Promise<Hint> {
    // Nominate hints
    const nominated_hints: AttributedHint[] = [];
    for (const nominator of this.nominators) {
      const nominations = await nominator.nominate();
      const hints = nominations.map((n) => n.hint);
      nominated_hints.concat(hints);
    }

    // Filter nominations
    // TODO: implement

    // Generate guesses
    const hints_with_guesses: {
      hint: AttributedHint;
      guesses: AttributedGuess[];
    }[] = [];
    for (const hint of nominated_hints) {
      const guesses: AttributedGuess[] = [];
      for (const guesser of this.guessers) {
        guesses.concat(await guesser.guess(hint));
      }
      hints_with_guesses.concat({
        hint: hint,
        guesses: guesses,
      });
    }

    // Score guesses
    const scored_guesses_per_hint = [];
    for (const { hint, guesses } of hints_with_guesses) {
      const scored_guesses = [];
      for (const guess of guesses) {
        const score = this.score_guess(hint, guess);
        scored_guesses.push({
          guess: guess,
          score: score,
        });
      }
      scored_guesses_per_hint.push({
        hint: hint,
        scored_guesses: scored_guesses,
      });
    }

    // Evaluate hints
    const scored_hints = scored_guesses_per_hint.map(
      ({ hint, scored_guesses }) => {
        const score =
          scored_guesses.reduce((acc, sg) => acc + sg.score, 0) /
          scored_guesses.length;
        return {
          hint: hint,
          score: score,
        };
      }
    );

    // Select guess
    scored_hints.sort((a, b) => b.score - a.score);
    return scored_hints[0].hint.hint;
  }

  update_state(update: GameState): void {
    this.nominators.forEach((n) => n.update_state(update));
    this.guessers.forEach((n) => n.update_state(update));
  }
}
