import {
  Nominator,
  Nomination,
  GameState,
  AttributedHint,
  WordSet,
  Hint,
} from "./interfaces.ts";
import { GPT3Client } from "./gpt3.ts";

// TODO: implement CompoundNominator

// TODO: move prompt string elsewhere
const PROMPT = `Codenames is a game for two teams of at least two players each. One player on each team is the "spymaster," and the other players on the team are the "field operatives." The game is played on a grid of cards, with each card representing a word. The spymasters give one-word clues to their field operatives, who then try to guess which card the clue is referring to. The first team to guess all of their cards correctly wins the game. A good hint associates multiple words from one team, without accidentally applying to words belonging to the opposite team.

Start of Game 1

Remaining Words
Red Words: alps, mouse, death, limousine, mint, pirate, engine, table, band
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Red Hint
Red Words: alps, mouse, death, limousine, mint, pirate, engine, table, band
Thought Process: Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.
Intended Words: (limousine, engine)
Final Hint: (car, 2)

Remaining Words
Red Words: alps, mouse, death, mint, pirate, table, band
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Blue Hint
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Thought Process: Wave and hand are related, but I'm not sure what word can relate them that isn't "wave". Maybe "greeting"? Since you greet people by waving and also by shaking hands.
Intended Words: (hand, wave)
Final Hint: (greeting, 2)

Remaining Words
Red Words: alps, mouse, death, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Red Hint
Red Words: alps, mouse, death, mint, pirate, table, band
Thought Process: "frozen" could relate alps and death, but could maybe refer to organ, or block. To relate pirate and death maybe "plank" for walk the plank to your death. However frozen is more direct.
Intended Words: (alps, death)
Final Hint: (frozen, 2)

Remaining Words
Red Words: mouse, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

End of Game 1`;

const content_of = (line: string) => {
  return line.split(":")[1];
};

export class GPT3Nominator implements Nominator {
  id = "GPT3Nominator";
  team = "Red";
  gpt3_client: GPT3Client;
  game_state?: GameState;
  num_nominations: number;

  constructor(game_state?: GameState, num_nominations?: number) {
    this.game_state = game_state;
    this.gpt3_client = new GPT3Client();
    this.num_nominations = num_nominations ?? 1;
  }

  format_game_state() {
    let s = "Remaining Words\n";
    s += `Red Words: ${this.game_state?.words.red.join(", ")}\n`;
    s += `Blue Words: ${this.game_state?.words.blue.join(", ")}\n`;
    s += `Neutral Words: ${this.game_state?.words.neutral.join(", ")}\n`;
    s += `Black Word: ${this.game_state?.words.black.join(", ")}\n`;
    return s;
  }

  format_hint_prompt() {
    let prompt = `Red Hint\n`;
    prompt += `Red Words: ${this.game_state?.words.red.join(", ")}\n`;
    prompt += "Thought Process:";
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

  parse_hint = (hint_text: string): Hint => {
    const [word, number] = hint_text
      .trim()
      .slice(1, -1)
      .split(",")
      .map((x) => x.trim());
    // for some reason might be swapped
    if (isNaN(+number)) {
      return {
        word: number,
        number: +word,
      };
    }
    return {
      word: word,
      number: +number,
    };
  };

  parse_word_set = (word_set: string): WordSet => {
    return word_set
      .trim()
      .slice(1, -1)
      .trim()
      .split(",")
      .map((word) => word.trim().toLowerCase());
  };

  parse_response(response: string): AttributedHint | undefined {
    const lines = response
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
    if (lines.length != 3) {
      return undefined;
    }
    return {
      hint: this.parse_hint(content_of(lines[2])),
      intended_words: this.parse_word_set(content_of(lines[1])),
      nominator_id: this.id,
      metadata: { thought_process: lines[0] },
    };
  }

  async nominate(): Promise<Nomination[]> {
    const prompt = this.construct_prompt();
    const completion = await this.gpt3_client.complete({
      prompt: prompt,
      stop: ["Remaining Words"],
      n: this.num_nominations,
    });

    return completion
      .map((c) => this.parse_response(c.text))
      .filter((t): t is AttributedHint => !!t)
      .map((t) => ({
        hint: t,
      }));
  }

  update_state(update: GameState): void {
    this.game_state = update;
  }
}