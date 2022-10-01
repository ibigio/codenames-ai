import {
  HintNominator,
  GuessNominator,
  AttributedHint,
  AttributedGuess,
  Hint,
  CompleteGameState,
  WordType,
} from "./interfaces.ts";
import { to_partial, to_word_groups } from "./util.ts";

export class Agent {
  hint_nominators: HintNominator[];
  guess_nominators: GuessNominator[];
  game_state?: CompleteGameState;

  constructor(
    options: {
      hint_nominators: HintNominator[];
      guess_nominators: GuessNominator[];
    },
    game_state?: CompleteGameState
  ) {
    this.hint_nominators = options.hint_nominators;
    this.guess_nominators = options.guess_nominators;
    this.game_state = game_state;
  }

  get_game_state(): CompleteGameState {
    if (this.game_state == undefined) {
      throw new Error("tried to get undefined game state");
    }
    return this.game_state;
  }

  // TODO: implement better scoring
  score_guess(
    hint: AttributedHint,
    guess: AttributedGuess,
    word_groups: { [key: string]: WordType }
  ): number {
    // const intended_word_set = new Set(hint.intended_words);
    // const guessed_word_set = new Set(guess.guess);

    // Score words
    let points = 0;
    const point_map = { red: 1, blue: -1, neutral: 0, black: -10 };
    for (const word of guess.guess) {
      const group = word_groups[word]; // TODO: handle undefined
      points += point_map[group];
    }

    // const intersect = new Set(
    //   [...intended_word_set].filter((i) => guessed_word_set.has(i))
    // );
    return points;
  }

  score_hints(
    hints_with_guesses: {
      hint: AttributedHint;
      guesses: AttributedGuess[];
    }[]
  ) {
    const word_groups = to_word_groups(this.get_game_state());
    const scored_guesses_per_hint = [];
    for (const { hint, guesses } of hints_with_guesses) {
      const scored_guesses = [];
      for (const guess of guesses) {
        const score = this.score_guess(hint, guess, word_groups);
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
    return scored_guesses_per_hint;
  }

  async generate_hint(): Promise<Hint> {
    this.get_game_state(); // validate game state
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
    const scored_guesses_per_hint = this.score_hints(hints_with_guesses);

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
    this.game_state = update;
    this.hint_nominators.forEach((n) => n.update_state(update));
    this.guess_nominators.forEach((n) => n.update_state(to_partial(update)));
  }
}
