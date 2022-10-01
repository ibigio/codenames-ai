import { Agent } from "./agent.ts";
import { GPT3GuessNominator } from "./guess_nominators.ts";
import { GPT3HintNominator } from "./hint_nominators.ts";
import { CompleteGameState } from "./interfaces.ts";
import { to_partial } from "./util.ts";

const sample_complete_game_state: CompleteGameState = {
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
    hint_nominators: [new GPT3HintNominator(10)],
    guess_nominators: [new GPT3GuessNominator(5)],
  });
  a.update_state(sample_complete_game_state);
  const hint = await a.generate_hint();
  console.log(hint);
});
