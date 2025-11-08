import dotenv from "dotenv";
import { spawn } from "child_process";

dotenv.config();

const GEMINI_CLI_COMMAND = process.env.GEMINI_CLI_COMMAND || "gemini";
const GEMINI_ATS_MODEL = process.env.GEMINI_ATS_MODEL || "gemini-1.5-flash";
const GEMINI_CLI_ARGS = process.env.GEMINI_CLI_ARGS
  ? process.env.GEMINI_CLI_ARGS.split(/\s+/).filter(Boolean)
  : [];

const buildPrompt = (job, applicant = {}, applicationInput = {}, resumeText = "") => {
  const requirements = Array.isArray(job?.requirements)
    ? job.requirements.join(", ")
    : job?.requirements || "";
  const applicantSkills = Array.isArray(applicant?.profile?.skills)
    ? applicant.profile.skills.join(", ")
    : applicant?.profile?.skills || "";

  const resumeSnippet =
    typeof resumeText === "string" && resumeText.length
      ? resumeText.slice(0, 2000)
      : "";

  return `You are an Applicant Tracking System that scores how well a candidate matches a job.
Return ONLY valid minified JSON like {"score":87,"explanation":"short reasoning"}.
Rules:
- score must be an integer between 0 and 100.
- explanation must be <= 60 words and reference specific overlaps.
- consider role requirements, skills, experience, and cover letter quality.
- prioritize information from the resume extract when available.

Job Details:
Title: ${job?.title || ""}
Description: ${job?.description || ""}
Requirements: ${requirements}

Candidate Info:
Name: ${applicationInput?.fullName || applicant?.fullname || ""}
Email: ${applicationInput?.email || applicant?.email || ""}
Phone: ${applicationInput?.phoneNumber || applicant?.phoneNumber || ""}
Profile Bio: ${applicant?.profile?.bio || ""}
Profile Skills: ${applicantSkills}
Cover Letter: ${applicationInput?.coverLetter || ""}
Resume Extract (trimmed): ${resumeSnippet || "Not provided"}
`;
};

const extractJson = (text = "") => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    return null;
  }
};

const sanitizeCommand = (command) =>
  typeof command === "string" ? command.trim().replace(/^["']+|["']+$/g, "") : command;

const runGeminiCli = (prompt) => {
  return new Promise((resolve, reject) => {
    const args = [];
    if (GEMINI_ATS_MODEL) {
      args.push("-m", GEMINI_ATS_MODEL);
    }
    args.push(...GEMINI_CLI_ARGS);
    const executable = sanitizeCommand(GEMINI_CLI_COMMAND);

    let child;
    const spawnOptions = { env: process.env, windowsHide: true };
    if (process.platform === "win32") {
      child = spawn(executable, args, { ...spawnOptions, shell: true });
    } else {
      child = spawn(executable, args, spawnOptions);
    }
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      if (code !== 0) {
        const error = new Error(`Gemini CLI exited with code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        return reject(error);
      }
      const cleaned = stdout.replace(/^Loaded cached credentials\.?\s*/i, "").trim();
      resolve(cleaned);
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
};

export const generateAtsInsights = async ({ job, applicant, applicationInput, resumeText }) => {
  try {
    const prompt = buildPrompt(job, applicant, applicationInput, resumeText);
    const raw = await runGeminiCli(prompt);
    const parsed = extractJson(raw);
    if (!parsed) {
      console.error("Unable to parse ATS response", raw);
      return null;
    }
    const atsScore = Number(parsed.score);
    const atsExplanation = typeof parsed.explanation === "string" ? parsed.explanation.trim() : "";
    return {
      score: Number.isFinite(atsScore) ? Math.max(0, Math.min(100, Math.round(atsScore))) : undefined,
      explanation: atsExplanation,
    };
  } catch (error) {
    console.error("ATS scoring error", error);
    return null;
  }
};
