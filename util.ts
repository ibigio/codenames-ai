import { CompleteGameState, PartialGameState, WordSet } from "./interfaces.ts";

export const content_of = (line: string) => {
  return line.split(":")[1];
};

export const parse_word_set = (word_set: string): WordSet | undefined => {
  return word_set
    .trim()
    .slice(1, -1)
    .trim()
    .split(",")
    .map((word) => word.trim().toLowerCase());
};

export const complete_to_partial_game_state = (
  game_state: CompleteGameState
): PartialGameState => {
  let words: string[] = [];
  for (const [_, value] of Object.entries(game_state.words)) {
    words = words.concat(value);
  }
  return { words: words, turns: game_state.turns };
};
