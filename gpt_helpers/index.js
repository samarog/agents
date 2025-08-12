import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/openapi.yaml", (req, res) => {
  res.sendFile(path.join(__dirname, "openapi.yaml"));
});

// FUNCTIONS
function segmentWords(text) {
  if (!text || typeof text !== "string") return [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter("pt", { granularity: "word" });
      const words = Array.from(segmenter.segment(text))
        .filter((segment) => segment.isWordLike)
        .map((segment) => segment.segment.trim().toLowerCase())
        .filter(
          (word) =>
            word.length > 0 &&
            /[a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/.test(word),
        );
      if (words.length > 0) return words;
    } catch (error) {
      console.error("Intl.Segmenter error:", error);
    }
  }

  return text
    .toLowerCase()
    .replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/gi, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 0 &&
        /[a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/.test(word),
    );
}

function countWordsAccurate(text) {
  return segmentWords(text).length;
}

function matchedWords(text, words) {
  return segmentWords(text).filter((word) => words.includes(word)).length;
}

// POST

app.post("/count", (req, res) => {
  try {
    const text = (req.body.text || "").trim();
    const wordCount = countWordsAccurate(text);
    res.json({ word_count: wordCount });
  } catch (error) {
    console.error("Erro ao processar contagem:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

app.post("/match", (req, res) => {
  try {
    const text = (req.body.text || "").trim();
    const matches = matchedWords(text, req.body.words);
    res.json({ matches: matches });
  } catch (error) {
    console.error("Erro ao processar contagem:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

// SERVER START

app.listen(3000, "0.0.0.0", () => console.log("API running on 0.0.0.0:3000"));
