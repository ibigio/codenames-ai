import { Agent } from "./agent.ts";
import { GPT3Client } from "./gpt3.ts";
import { GPT3Guesser } from "./guessers.ts";
import { GPT3Nominator } from "./nominators.ts";

async function main() {
  let game_state = {
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
    nominators: [new GPT3Nominator()],
    guessers: [new GPT3Guesser()],
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
