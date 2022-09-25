import {
  HintNominator,
  GuessNominator,
  AttributedHint,
  AttributedGuess,
  Hint,
  CompleteGameState,
} from "./interfaces.ts";
import { complete_to_partial } from "./util.ts";

export class Agent {
  hint_nominators: HintNominator[];
  guess_nominators: GuessNominator[];

  constructor(options: {
    hint_nominators: HintNominator[];
    guess_nominators: GuessNominator[];
  }) {
    this.hint_nominators = options.hint_nominators;
    this.guess_nominators = options.guess_nominators;
  }

  // TODO: implement better scoring
  score_guess(hint: AttributedHint, guess: AttributedGuess): number {
    const intended_word_set = new Set(hint.intended_words);
    const guessed_word_set = new Set(guess.guess);

    const intersect = new Set(
      [...intended_word_set].filter((i) => guessed_word_set.has(i))
    );
    return intersect.size;
  }

  async generate_hint(): Promise<Hint> {
    // Nominate hints
    let nominated_hints: AttributedHint[] = [];
    for (const nominator of this.hint_nominators) {
      const hints = await nominator.nominate();
      console.log(hints);
      nominated_hints = nominated_hints.concat(hints);
    }
    console.log(nominated_hints);

    // Filter nominations
    // TODO: implement

    // Nominate guesses
    let hints_with_guesses: {
      hint: AttributedHint;
      guesses: AttributedGuess[];
    }[] = [];
    for (const hint of nominated_hints) {
      let guesses: AttributedGuess[] = [];
      for (const guesser of this.guess_nominators) {
        guesses = guesses.concat(await guesser.nominate(hint.hint));
      }
      console.log(guesses);
      hints_with_guesses = hints_with_guesses.concat({
        hint: hint,
        guesses: guesses,
      });
    }
    console.log(hints_with_guesses);

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
      console.log(scored_guesses_per_hint);
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
    console.log(scored_hints);
    return scored_hints[0].hint.hint;
  }

  update_state(update: CompleteGameState): void {
    this.hint_nominators.forEach((n) => n.update_state(update));
    this.guess_nominators.forEach((n) =>
      n.update_state(complete_to_partial(update))
    );
  }
}
