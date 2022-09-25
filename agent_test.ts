import { Agent } from "./agent.ts";
import { GPT3GuessNominator } from "./guess_nominators.ts";
import { GPT3HintNominator } from "./hint_nominators.ts";
import { complete_to_partial } from "./util.ts";

const sample_complete_game_state = {
  words: {
    red: ["screen", "robin", "rock", "bond", "bug", "dice", "log", "mammoth"],
    blue: [
      "capital",
      "jet",
      "mole",
      "racket",
      "nurse",
      "fish",
      "novel",
      "tower",
      "saturn",
    ],
    neutral: [
      "ice",
      "press",
      "piano",
      "princess",
      "ship",
      "africa",
      "net",
      "pass",
    ],
    black: ["sand"],
  },
  turns: [],
};

Deno.test("agent test", async () => {
  const a = new Agent({
    hint_nominators: [new GPT3HintNominator(sample_complete_game_state, 5)],
    guess_nominators: [
      new GPT3GuessNominator(
        complete_to_partial(sample_complete_game_state),
        3
      ),
    ],
  });
  const hint = await a.generate_hint();
  console.log(hint);
});
