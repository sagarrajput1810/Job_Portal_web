import { createRequire } from "module";
const require = createRequire(import.meta.url);
let PDFParseClass = null;
try {
  const pkg = require("pdf-parse");
  PDFParseClass = pkg?.PDFParse || pkg?.default?.PDFParse || null;
  if (!PDFParseClass) {
    console.error("pdf-parse loaded but PDFParse class not found");
  }
} catch (err) {
  console.error("Failed to load pdf-parse via require", err);
}

const cleanText = (text = "") =>
  text
    .replace(/\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const extractResumeText = async (file) => {
  if (!file?.buffer) return "";
  const mime = file.mimetype || "";
  const name = file.originalname?.toLowerCase() || "";

  const isPdf = mime === "application/pdf" || name.endsWith(".pdf");
  if (isPdf && PDFParseClass) {
    try {
      const instance = new PDFParseClass({ data: file.buffer });
      const parsed = await instance.getText();
      if (parsed?.text) {
        return cleanText(parsed.text);
      }
    } catch (error) {
      console.error("Failed to parse PDF resume", error);
    }
  }

  // Only attempt UTF-8 fallback for non-PDF files to avoid binary gibberish
  if (!isPdf) {
    try {
      return cleanText(file.buffer.toString("utf8"));
    } catch (error) {
      console.error("Failed to read resume buffer", error);
    }
  }
  return "";
};
