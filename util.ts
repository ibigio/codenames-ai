import {
  CompleteGameState,
  PartialGameState,
  WordSet,
  WordType,
} from "./interfaces.ts";

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

export const to_partial = (game_state: CompleteGameState): PartialGameState => {
  let words: string[] = [];
  for (const [_, value] of Object.entries(game_state.words)) {
    words = words.concat(value);
  }
  return { words: words, turns: game_state.turns };
};

export const to_word_groups = (
  game_state: CompleteGameState
): { [key: string]: WordType } => {
  const groups: { [key: string]: WordType } = {};
  for (const group of Object.keys(game_state.words) as WordType[]) {
    for (const w of game_state.words[group]) {
      groups[w] = group;
    }
  }
  return groups;
};
