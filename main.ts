import { Agent } from "./agent.ts";
import { GPT3Client } from "./gpt3.ts";
import { GPT3GuessNominator } from "./guess_nominators.ts";
import { GPT3HintNominator } from "./hint_nominators.ts";

async function main() {
  const game_state = {
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

  const agent = new Agent({
    hint_nominators: [new GPT3HintNominator()],
    guess_nominators: [new GPT3GuessNominator()],
  });

  agent.update_state(game_state);

  const gpt3_client = new GPT3Client();
  const resp = await gpt3_client.complete({
    prompt: "Write a poem.",
    n: 2,
  });
  console.log(resp);
}

main();
