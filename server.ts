/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON scanning for requests
app.use(express.json());

// Lazy-loaded GenAI Client to prevent startup crash if GEMINI_API_KEY is unset
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets. Please set it in Settings > Secrets to enable emotional analysis.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint to analyze the journal entry
app.post("/api/analyze", async (req, res) => {
  try {
    const { entryText } = req.body;

    if (!entryText || typeof entryText !== "string" || entryText.trim() === "") {
      return res.status(400).json({ error: "Journal entry text is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a highly compassionate, validating, and wise mindfulness guide.
Analyze the emotional texture of the user's writing. Be insightful, deeply empathetic, and constructive.
Formulate a validated response, a specific breathing exercise, a practical coping strategy, and select an uplifting quote from historical figures, philosophers, or literature.
Ensure your responses represent true Zen counseling, avoiding cliche or clinical talk.`;

    const modelName = "gemini-flash-latest";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Perform emotion analysis on the following personal journal entry:
"${entryText}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: {
              type: Type.STRING,
              description: "The primary identified emotion. Use simple single-word descriptors like Sadness, Joy, Anger, Overwhelmed, Peaceful, Anxiety, Grief, Hope, Loneliness, Exhausted, etc."
            },
            intensity: {
              type: Type.INTEGER,
              description: "Emotional intensity level rated from 1 (very mild) to 10 (overwhelmingly intense)."
            },
            colorTheme: {
              type: Type.STRING,
              description: "A peaceful color palette theme identifier matching this emotional state. Choose one of: 'indigo', 'teal', 'amber', 'rose', 'emerald', 'sky', 'violet', 'fuchsia'."
            },
            shortResponseText: {
              type: Type.STRING,
              description: "A highly empathetic, non-judgmental response validating their day and thoughts. Ensure it feels customized, comforting, and authentic. Max 3-4 sentences."
            },
            copingMechanism: {
              type: Type.STRING,
              description: "A tailored positive coping mechanism or mindfulness practice that the user can do right now to help ground or support them (e.g. progressive muscle relaxation, taking a 5-minute walk, 5-4-3-2-1 sensory grounding, journaling further on a specific prompt)."
            },
            breathingExercise: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "A calming name of a breathing exercise. Examples: '4-7-8 Relaxing Breath', 'Square Box Breathing', 'Sama Vritti Equal Breathing', 'Anulom Vilom Calming', 'Decompression Sigh'."
                },
                inhale: {
                  type: Type.INTEGER,
                  description: "Seconds to inhale."
                },
                hold: {
                  type: Type.INTEGER,
                  description: "Seconds to hold breath after inhaling."
                },
                exhale: {
                  type: Type.INTEGER,
                  description: "Seconds to exhale."
                },
                holdPostExhale: {
                  type: Type.INTEGER,
                  description: "Seconds to hold breath after exhaling (0 if none)."
                },
                cycles: {
                  type: Type.INTEGER,
                  description: "Recommended number of full repetition cycles."
                },
                description: {
                  type: Type.STRING,
                  description: "A clear, beautifully simple setup instruction on how to execute this exercise."
                }
              },
              required: ["name", "inhale", "hold", "exhale", "holdPostExhale", "cycles", "description"]
            },
            quote: {
              type: Type.STRING,
              description: "A carefully curated comfort-giving, uplifting, or deep-meaning quote matching this emotional texture."
            },
            quoteAuthor: {
              type: Type.STRING,
              description: "The author or source of the quote."
            }
          },
          required: ["emotion", "intensity", "colorTheme", "shortResponseText", "copingMechanism", "breathingExercise", "quote", "quoteAuthor"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty analysis result from the AI model.");
    }

    const payload = JSON.parse(resultText);
    res.json(payload);
  } catch (error: any) {
    console.error("Analysis route error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during emotional analysis."
    });
  }
});

// Configure Vite integration or static file serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving static bundle...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server securely active at http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
