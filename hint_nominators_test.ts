import { GPT3HintNominator } from "./hint_nominators.ts";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.156.0/testing/asserts.ts";

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

const sample_hint = ` "frozen" could relate alps and death, but could maybe refer to organ, or block. To relate pirate and death maybe "plank" for walk the plank to your death. However frozen is more direct.
Intended Words: (alps, death)
Final Hint: (frozen, 2)
`;

const test_hint_nominator = (n?: number) => {
  return new GPT3HintNominator(n ?? 1, sample_complete_game_state);
};

Deno.test("game_state format", () => {
  const n = test_hint_nominator();
  const f = n.format_game_state();
  assert(
    f.includes(`Remaining Words
Red Words: screen, robin, rock, bond, bug, dice, log, mammoth
Blue Words: capital, jet, mole, racket, nurse, fish, novel, tower, saturn
Neutral Words: ice, press, piano, princess, ship, africa, net, pass
Black Word: sand`)
  );
  console.log(f);
});

Deno.test("construct prompt", () => {
  const n = test_hint_nominator();
  const prompt = n.construct_prompt();
  assert(
    prompt.includes(`Red Hint
Red Words: screen, robin, rock, bond, bug, dice, log, mammoth
Thought Process:`)
  );
});

Deno.test("parse response", () => {
  const n = test_hint_nominator();
  const parsed_hint = n.parse_response(sample_hint);
  const expected_hint = {
    hint: { word: "frozen", number: 2 },
    intended_words: ["alps", "death"],
    nominator_id: n.id,
    metadata: {
      thought_process:
        '"frozen" could relate alps and death, but could maybe refer to organ, or block. To relate pirate and death maybe "plank" for walk the plank to your death. However frozen is more direct.',
    },
  };
  assertEquals(parsed_hint, expected_hint);
});

Deno.test("nominate hint", async () => {
  const n = test_hint_nominator();
  const nominations = await n.nominate();
  console.log(nominations);
});

Deno.test("nominate multiple hints", async () => {
  const n = test_hint_nominator(3);
  const nominations = await n.nominate();
  console.log(nominations);
});
