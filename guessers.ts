import { GPT3Client } from "./gpt3.ts";
import { Guesser, AttributedGuess, PartialGameState } from "./interfaces.ts";

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

export class GPT3Guesser implements Guesser {
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

  format_game_state() {
    return `Remaining Words: ${this.game_state?.words}\n`;
  }

  format_hint_prompt() {
    let prompt = `Red Hint\n`;
    // prompt += `Red Words: ${this.game_state?.categorized_words.red.join(
    //   ", "
    // )}\n`;
    // prompt += "Thought Process:";
    return prompt;
  }

  construct_prompt() {
    let prompt = PROMPT;
    prompt += "\n\n";
    prompt += "Start of Game 2\n\n";
    prompt += this.format_game_state();
    prompt += "\n";
    prompt += this.format_hint_prompt();
    return prompt;
  }

  guess(): Promise<AttributedGuess[]> {
    throw new Error("Method not implemented.");
  }
  update_state(): void {
    throw new Error("Method not implemented.");
  }
}
