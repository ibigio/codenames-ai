import { config } from "https://deno.land/x/dotenv/mod.ts";

interface Config {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  n?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  logprobs?: number;
  stop?: string | string[];
}

interface Completion {
  text: string;
  index: number;
  logprobs: any;
  finish_reason: string;
}

const default_options = {
  model: "text-davinci-002",
  temperature: 0.7,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

export class GPT3Client {
  complete = async (options: Config): Promise<Completion[]> => {
    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + config().OPENAI_API_KEY,
        },
        body: JSON.stringify({
          ...default_options,
          ...options,
        }),
      });
      const json = await response.json();
      return json?.choices;
    } catch (e) {
      console.log(e);
      return [];
    }
  };
}
