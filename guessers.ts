import { Guesser, AttributedGuess } from "./interfaces.ts";

export class GPT3Guesser implements Guesser {
  id = "GPT3Guesser";

  guess(): Promise<AttributedGuess[]> {
    throw new Error("Method not implemented.");
  }
  update_state(): void {
    throw new Error("Method not implemented.");
  }
}
