import { GPT3Client } from "./gpt3.ts";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.156.0/testing/asserts.ts";

Deno.test("game_state format", async () => {
  const client = new GPT3Client();
  const response = await client.complete({ prompt: "Write a poem." });
  console.log(response);
});
