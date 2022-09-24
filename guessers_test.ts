import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { GPT3Guesser } from "./guessers.ts";
import { AttributedGuess, Hint } from "./interfaces.ts";
import { complete_to_partial_game_state } from "./util.ts";

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

[
  "africa",
  "bond",
  "bug",
  "capital",
  "dice",
  "fish",
  "ice",
  "jet",
  "log",
  "mammoth",
  "mole",
  "net",
  "novel",
  "nurse",
  "pass",
  "piano",
  "press",
  "princess",
  "racket",
  "robin",
  "rock",
  "sand",
  "saturn",
  "screen",
  "ship",
  "tower",
];

const sample_partial_game_state = complete_to_partial_game_state(
  sample_complete_game_state
);

const sample_guess = ` Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.
Final Guess: (limousine, engine)
`;

Deno.test("game_state format", () => {
  const g = new GPT3Guesser(sample_partial_game_state);
  const f = g.format_game_state();
  assert(
    f.includes(
      "Remaining Words: africa, bond, bug, capital, dice, fish, ice, jet, log, mammoth, mole, net, novel, nurse, pass, piano, press, princess, racket, robin, rock, sand, saturn, screen, ship, tower"
    )
  );
});

Deno.test("parse response", () => {
  const g = new GPT3Guesser(sample_partial_game_state);
  const parsed_hint = g.parse_response(sample_guess);
  const expected_guess: AttributedGuess = {
    guess: ["limousine", "engine"],
    guesser_id: g.id,
    metadata: {
      thought_process:
        'Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.',
    },
  };
  assertEquals(parsed_hint, expected_guess);
});

Deno.test("construct prompt", () => {
  const g = new GPT3Guesser(sample_partial_game_state);
  const sample_hint: Hint = {
    word: "hint",
    number: 2,
  };
  const prompt = g.construct_prompt(sample_hint);
  assert(
    prompt.includes(`Red Hint: (hint, 2)
Thought Process:`)
  );
});

// Deno.test("produce guess", async () => {
//   const g = new GPT3Guesser(sample_partial_game_state);
//   const sample_hint: Hint = {
//     word: "",
//     number: 2,
//   };
//   const guesses = await g.guess(sample_hint);
//   console.log(guesses);
// });
