import os from "node:os";
import { join } from "node:path";
import { pipeline } from "@xenova/transformers";

const classifier = await pipeline(
  "image-classification",
  "Xenova/vit-base-patch16-224",
  {
    cache_dir: join(os.tmpdir(), "models"),
  }
);

export async function handler(event, context) {
  let text;
  try {
    if (event.httpMethod === "GET") {
      text = event.queryStringParameters.text;
    } else if (event.httpMethod === "POST") {
      text = event.body;
    }
    if (!text?.length) {
      return {
        statusCode: 400,
        body: "Please provide an image URL",
      };
    }
    if (!text.startsWith("https://")) {
      return {
        statusCode: 400,
        body: "Please provide a valid URL",
      };
    }
    const url = new URL(text);
    console.log(url.toString());
    console.time("classify");

    const data = await classifier(url.toString(), { topk: 3 });

    console.timeEnd("classify");

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
}
