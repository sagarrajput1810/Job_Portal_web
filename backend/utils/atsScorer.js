const DEFAULT_OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_ATS_MODEL = process.env.OLLAMA_ATS_MODEL || "phi4:mini";

const buildPrompt = (job, applicant = {}, applicationInput = {}) => {
  const requirements = Array.isArray(job?.requirements)
    ? job.requirements.join(", ")
    : job?.requirements || "";
  const applicantSkills = Array.isArray(applicant?.profile?.skills)
    ? applicant.profile.skills.join(", ")
    : applicant?.profile?.skills || "";

  return `You are an Applicant Tracking System that scores how well a candidate matches a job.
Return ONLY valid minified JSON like {"score":87,"explanation":"short reasoning"}.
Rules:
- score must be an integer between 0 and 100.
- explanation must be <= 60 words and reference specific overlaps.
- consider role requirements, skills, experience, and cover letter quality.

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

export const generateAtsInsights = async ({ job, applicant, applicationInput }) => {
  try {
    const prompt = buildPrompt(job, applicant, applicationInput);
    const response = await fetch(`${DEFAULT_OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DEFAULT_ATS_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("ATS model call failed", response.statusText);
      return null;
    }
    const data = await response.json();
    const parsed = extractJson(data?.response);
    if (!parsed) {
      console.error("Unable to parse ATS response", data?.response);
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

