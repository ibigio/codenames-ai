import { GPT3Client } from "./gpt3.ts";
import {
  GuessNominator,
  WordSet,
  AttributedGuess,
  PartialGameState,
  Hint,
} from "./interfaces.ts";
import { content_of, parse_word_set } from "./util.ts";

const PROMPT = `Codenames is a game for two teams of at least two players each. One player on each team is the "spymaster," and the other players on the team are the "field operatives." The game is played on a grid of cards, with each card representing a word. The spymasters give one-word clues to their field operatives, who then try to guess which card the clue is referring to. The first team to guess all of their cards correctly wins the game. A good hint associates multiple words from one team, without accidentally applying to words belonging to the opposite team.

Start of Game 1

Remaining Words: alps, band, block, cat, centaur, crown, death, dog, engine, fair, fence, hand, head, limousine, mint, mouse, organ, pirate, shop, smuggler, table, tick, wave

Red Hint: (car, 2)
Thought Process: Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.
Final Guess: (limousine, engine)

Remaining Words: alps, band, block, cat, centaur, crown, death, dog, fair, fence, hand, head, mint, mouse, organ, pirate, shop, smuggler, table, tick, wave

Blue Hint: (greeting, 2)
Thought Process: You can greet death, a dog greets you, a hand is used for a greeting, to wave is a greeting. From these the most fitting feel like hand and wave.
Final Guess: (hand, wave)

Remaining Words: alps, band, block, cat, centaur, crown, death, dog, fair, fence, head, mint, mouse, organ, pirate, shop, smuggler, table, tick

Red Hint: (frozen, 2)
Thought Process: The alps are frozen, that's pretty clear. A block could be frozen, mints are cold, and you can die frozen. From those, freezing to death seems the most related.
Final Guess: (alps, death)

Remaining Words: band, block, cat, centaur, crown, dog, fair, fence, head, mint, mouse, organ, pirate, shop, smuggler, table, tick

End of Game 1`;

export class GPT3GuessNominator implements GuessNominator {
  id = "GPT3Guesser";
  team = "Red";
  gpt3_client: GPT3Client;
  game_state?: PartialGameState;
  num_guesses: number;

  constructor(game_state?: PartialGameState, num_guesses?: number) {
    this.game_state = game_state;
    this.gpt3_client = new GPT3Client();
    this.num_guesses = num_guesses ?? 1;
  }

  get_game_state(): PartialGameState {
    if (this.game_state == undefined) {
      throw new Error("tried to get undefined game state");
    }
    return this.game_state;
  }

  parse_response(response: string): AttributedGuess | undefined {
    const lines = response
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
    if (lines.length != 2) {
      return undefined;
    }
    const guess = parse_word_set(content_of(lines[1]));
    if (guess == undefined) {
      return undefined;
    }
    return {
      guess: guess,
      guesser_id: this.id,
      metadata: { thought_process: lines[0] },
    };
  }

  format_hint(hint: Hint) {
    return `(${hint.word}, ${hint.number})`;
  }

  format_game_state() {
    return `Remaining Words: ${this.get_game_state()
      .words.sort()
      .join(", ")}\n`;
  }

  format_guess_prompt(hint: Hint) {
    let prompt = `Red Hint: ${this.format_hint(hint)}\n`;
    prompt += "Thought Process:";
    return prompt;
  }

  construct_prompt(hint: Hint) {
    let prompt = PROMPT;
    prompt += "\n\n";
    prompt += "Start of Game 2\n\n";
    prompt += this.format_game_state();
    prompt += "\n";
    prompt += this.format_guess_prompt(hint);
    return prompt;
  }

  async nominate(hint: Hint): Promise<AttributedGuess[]> {
    const prompt = this.construct_prompt(hint);
    const completion = await this.gpt3_client.complete({
      prompt: prompt,
      stop: ["Remaining Words"],
      n: this.num_guesses,
    });

    if (completion == undefined) {
      return [];
    }
    return completion
      .map((c) => this.parse_response(c.text))
      .filter((t): t is AttributedGuess => !!t);
  }
  update_state(update: PartialGameState): void {
    this.game_state = update;
  }
}
