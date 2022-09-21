import { config } from "https://deno.land/x/dotenv/mod.ts";

// const game_state = {
//   turns: [
//     {
//       words: {
//         RedWords: [
//           "alps",
//           "mouse",
//           "death",
//           "limousine",
//           "mint",
//           "pirate",
//           "engine",
//           "table",
//           "band",
//         ],
//         BlueWords: [
//           "wave",
//           "crown",
//           "shop",
//           "smuggler",
//           "centaur",
//           "fair",
//           "tick",
//           "hand",
//         ],
//         NeutralWords: ["organ", "cat", "dog", "block", "head"],
//         BlackWord: ["fence"],
//       },
//       hint: {
//         team: "Red",
//         thought_process:
//           'Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.',
//         final_hint: { word: "Car", number: "2" },
//       },
//     },
//   ],
// };

const PROMPT = `Codenames is a game for two teams of at least two players each. One player on each team is the "spymaster," and the other players on the team are the "field operatives." The game is played on a grid of cards, with each card representing a word. The spymasters give one-word clues to their field operatives, who then try to guess which card the clue is referring to. The first team to guess all of their cards correctly wins the game. A good hint associates multiple words from one team, without accidentally applying to words belonging to the opposite team.

Game Setup
Red Words: alps, mouse, death, limousine, mint, pirate, engine, table, band
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Red Hint
Thought Process: Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.
Final Hint: (Car, 2)

Remaining Words
Red Words: alps, mouse, death, mint, pirate, table, band
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Blue Hint
Thought Process: Wave and hand are related, but I'm not sure what word can relate them that isn't "wave". Maybe "greeting"? Since you greet people by waving and also by shaking hands.
Final Hint: (Greeting, 2)

Remaining Words
Red Words: alps, mouse, death, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Red Hint
Thought Process: "Frozen" could relate alps and death, but could maybe refer to organ, or block. To relate pirate and death maybe "plank" for walk the plank to your death. However frozen is more direct.
Final Hint: (Frozen, 2)

Remaining Words
Red Words: mouse, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Blue Hint`;

const PROMPT2 = `Codenames is a game for two teams of at least two players each. One player on each team is the "spymaster," and the other players on the team are the "field operatives." The game is played on a grid of cards, with each card representing a word. The spymasters give one-word clues to their field operatives, who then try to guess which card the clue is referring to. The first team to guess all of their cards correctly wins the game. A good hint associates multiple words from one team, without accidentally applying to words belonging to the opposite team.

Game Setup
Red Words: alps, mouse, death, limousine, mint, pirate, engine, table, band
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Red Hint
Thought Process: Scanning through, the most obvious related words I see are limousine and engine, since both related to "car", and it looks like no other words are.
Final Hint: (Car, 2)

Remaining Words
Red Words: alps, mouse, death, mint, pirate, table, band
Blue Words: wave, crown, shop, smuggler, centaur, fair, tick, hand
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Blue Hint
Thought Process: Wave and hand are related, but I'm not sure what word can relate them that isn't "wave". Maybe "greeting"? Since you greet people by waving and also by shaking hands.
Final Hint: (Greeting, 2)

Remaining Words
Red Words: alps, mouse, death, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Red Hint
Thought Process: "Frozen" could relate alps and death, but could maybe refer to organ, or block. To relate pirate and death maybe "plank" for walk the plank to your death. However frozen is more direct.
Final Hint: (Frozen, 2)

Remaining Words
Red Words: mouse, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

Blue Hint`;

const REPLIES = `Thought Process: Centaur and fair are both related to mythology, so I'm thinking of a word like "legend" or "myth".
Final Hint: (Mythology, 2)

Thought Process: The only word that relates "crown" and "smuggler" is "treasure".
Final Hint: (Treasure, 2)

Thought Process: I want to use the word "fairy" since it relates to crown, shop, and tick. However, I'm not sure if there are any other words that could be related.
Final Hint: (Fairy, 3)



Thought Process: Centaur and fair could be related by "mythical".
Final Hint: (Mythical, 2)



Thought Process: I see that "queen" relates crown and fair.
Final Hint: (Queen, 2)`;

const complete = async (
  prompt: string,
  stop: string[],
  n: number
): Promise<
  {
    text: string;
    index: number;
    logprobs: any;
    finish_reason: string;
  }[]
> => {
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + config().OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "text-davinci-002",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: stop,
        n: n,
      }),
    });
    const json = await response.json();
    return json?.choices;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const content_of = (line: string) => {
  return line.split(":")[1];
};

const parse_hint_text = (hint_text: string) => {
  const [word, number] = hint_text
    .trim()
    .slice(1, -1)
    .split(",")
    .map((x) => x.trim());
  return {
    word: word,
    number: +number,
  };
};

const format_hint_text = (hint: { word: string; number: number }) => {
  return `(${hint.word}, ${hint.number})`;
};

const parse_hint_response = (response: string) => {
  const lines = response
    .trim()
    .split("\n")
    .filter((line) => line.includes(":"));
  if (lines.length != 4) {
    return null;
  }
  return {
    thought_process: content_of(lines[0]),
    intended_words: content_of(lines[2]),
    final_hint: parse_hint_text(content_of(lines[3])),
  };
};

const parse_guess_response = (response: string) => {
  let lines = response
    .trim()
    .split("\n")
    .filter((line) => line.includes(":"));

  if (lines.length != 2) {
    return null;
  }

  return {
    thought_process: content_of(lines[0]),
    final_guess: content_of(lines[1]),
  };
};

const parse_word_set = (word_set: string) => {
  return new Set(
    word_set
      .slice(1, -1)
      .split(",")
      .map((word) => word.trim().toLowerCase())
  );
};

const score_hint = (intended_words: string, guessed_words: string) => {
  // TODO: account for opposing words vs neutral words vs black word
  // TODO: add weighting for more words
  const a = parse_word_set(intended_words);
  const b = parse_word_set(guessed_words);
  const intersect = new Set([...a].filter((i) => b.has(i)));
  return intersect.size;
};

const generate_optimized_guess = async () => {
  // Generate n guesses.
  let spymaster_prompt = await Deno.readTextFile("./spymaster_prompt.txt");
  spymaster_prompt += "\n\n" + "Blue Hint";
  console.log(spymaster_prompt);
  const possible_hints = await complete(
    spymaster_prompt,
    ["Remaining Words"],
    10
  );

  // TODO: filter out illegal / repeated words

  // Guess words for each hint.
  const scored_hints = [];
  const guesser_prompt = await Deno.readTextFile("./guesser_prompt.txt");
  for (const hint of possible_hints) {
    const hint_obj = parse_hint_response(hint.text);
    if (hint_obj == null) {
      continue;
    }
    const cur_guesser_prompt =
      guesser_prompt +
      "\n\n" +
      "Blue Hint: " +
      format_hint_text(hint_obj.final_hint);
    console.log(cur_guesser_prompt);
    const response_guess = await complete(cur_guesser_prompt, ["Red Hint"], 1);
    console.log(response_guess);
    const guess_obj = parse_guess_response(response_guess[0].text);
    console.log("Guess OBJ");
    console.log(guess_obj);
    if (guess_obj == null) {
      continue;
    }
    console.log(guess_obj);
    console.log();
    console.log("Hint: " + format_hint_text(hint_obj.final_hint));
    console.log("Guess: " + guess_obj.final_guess);
    console.log("Intended: " + hint_obj.intended_words);
    console.log("Guess Thought Process:" + guess_obj.thought_process);
    console.log("Hint Thought Process:" + hint_obj.thought_process);
    console.log();
    scored_hints.push({
      hint: hint_obj,
      score: score_hint(hint_obj.intended_words, guess_obj.final_guess),
    });
  }

  // Return best hint.
  scored_hints.sort((hint1, hint2) => {
    const score_diff = hint2.score - hint1.score;
    if (score_diff != 0) {
      return score_diff;
    }
    const h1 = hint2.hint.final_hint;
    const h2 = hint2.hint.final_hint;
    return score_diff;
  });
  console.log(
    scored_hints.map(
      (hint) => format_hint_text(hint.hint.final_hint) + " Score: " + hint.score
    )
  );
  return scored_hints[0].hint.final_hint;
};

const hint = await generate_optimized_guess();
console.log(hint);

// const prompt = await Deno.readTextFile("./prompt.txt");
// const choices = await complete(prompt);
// for (const c of choices) {
//   console.log(c.text);
// }
