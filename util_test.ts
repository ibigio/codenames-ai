import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { WordType } from "./interfaces.ts";
import { to_word_groups } from "./util.ts";

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

Deno.test("word groups", () => {
  const groups = to_word_groups(sample_complete_game_state);
  console.log(groups);
  const expected_groups: { [key: string]: WordType } = {
    screen: "red",
    robin: "red",
    rock: "red",
    bond: "red",
    bug: "red",
    dice: "red",
    log: "red",
    mammoth: "red",
    capital: "blue",
    jet: "blue",
    mole: "blue",
    racket: "blue",
    nurse: "blue",
    fish: "blue",
    novel: "blue",
    tower: "blue",
    saturn: "blue",
    ice: "neutral",
    press: "neutral",
    piano: "neutral",
    princess: "neutral",
    ship: "neutral",
    africa: "neutral",
    net: "neutral",
    pass: "neutral",
    sand: "black",
  };
  assertEquals(groups, expected_groups);
});
