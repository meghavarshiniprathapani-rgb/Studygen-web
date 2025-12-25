import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlan, DayDetails, Duration, Intensity, CodeEvaluationResult, QuizQuestion, FinalExam } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const FLASH_MODEL = "gemini-3-flash-preview";
const PRO_MODEL = "gemini-3-pro-preview";

export const generateStudyPlan = async (
  topic: string,
  duration: Duration,
  intensity: Intensity
): Promise<StudyPlan> => {
  const prompt = `
    Analyze the following request to create a structured study plan:
    Topic: "${topic}"
    Duration: ${duration}
    Intensity: ${intensity}

    CRITICAL VALIDATION STEP:
    You must first determine if the topic is a "Correct Course". A correct course is defined as:
    1. A recognized academic subject (e.g., Calculus, Organic Chemistry, World History).
    2. A professional or technical skill (e.g., React Development, Project Management, Data Science).
    3. A specific exam syllabus (e.g., SAT Prep, AWS Certified Developer, Bar Exam).
    4. A legitimate hobby that requires structured learning (e.g., Photography, Music Theory, Chess Strategy).

    REJECT AND MARK AS 'INVALID_TOPIC' IF:
    - The input is gibberish or random letters (e.g., "asdf", "qwerty").
    - The input is a trivial daily task (e.g., "how to sleep", "how to walk").
    - The input is a meme, joke, or nonsensical trend (e.g., "skibidi", "rizz").
    - The input is offensive, harmful, or inappropriate.

    If the topic is INVALID:
    - Set the "title" field to "INVALID_TOPIC".
    - Provide a short, polite explanation in the "overview" field about why it was rejected.
    
    If the topic is VALID:
    - Generate a comprehensive, professional study plan.
    - Break it down into periods and specific daily tasks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a strict academic curriculum engineer. You only generate high-quality, professional study plans for legitimate educational topics. You have a zero-tolerance policy for gibberish, memes, or trivial non-educational inputs.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for maximum speed on this task
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Professional title of the plan, or 'INVALID_TOPIC'" },
            overview: { type: Type.STRING, description: "A summary of the plan, or the rejection reason if invalid" },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING },
                        topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from the AI service.");
    }

    const plan = JSON.parse(text) as StudyPlan;

    if (plan.title === 'INVALID_TOPIC') {
      throw new Error(plan.overview || "That doesn't look like a valid study topic. Please enter a real subject, skill, or syllabus.");
    }

    return plan;
  } catch (error: any) {
    console.error("Error generating study plan:", error);
    throw error;
  }
};

export const getDayDetails = async (
  focus: string,
  day: string,
  topics: string[]
): Promise<DayDetails> => {
  const prompt = `
    Generate detailed study resources for: ${focus} - ${day}
    Topics: ${topics.join(", ")}

    Provide:
    1. A 100-150 word conceptual overview.
    2. 3-5 YouTube search queries.
    3. 5 practice problems (coding challenges if technical, otherwise descriptive problems).
  `;

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            youtubeQueries: { type: Type.ARRAY, items: { type: Type.STRING } },
            practiceProblems: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}') as DayDetails;
  } catch (error) {
    console.error("Error fetching day details:", error);
    throw error;
  }
};

export const checkCode = async (
  problem: string,
  code: string,
  language: string,
  input: string
): Promise<CodeEvaluationResult> => {
  const prompt = `
    Analyze and simulate the following ${language} code for this problem: "${problem}"
    Input: "${input}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            output: { type: Type.STRING },
            analysis: { type: Type.STRING },
            isCorrect: { type: Type.BOOLEAN }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}') as CodeEvaluationResult;
  } catch (error) {
    return { output: "Evaluation failed.", analysis: "Internal error.", isCorrect: false };
  }
};

export const getSolution = async (
  problem: string,
  language: string
): Promise<string> => {
  const prompt = `Return ONLY the raw optimal code for: "${problem}" in ${language}. No markdown.`;
  const response = await ai.models.generateContent({ model: PRO_MODEL, contents: prompt });
  return response.text?.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '') || "// Error";
};

export const generateQuiz = async (topics: string[]): Promise<QuizQuestion[]> => {
  const prompt = `Generate 5 MCQs for: ${topics.join(", ")}`;
  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]') as QuizQuestion[];
};

export const generateFinalExam = async (topic: string): Promise<FinalExam> => {
  const prompt = `Generate a rigorous final exam for: ${topic}. Include 5 difficult multiple choice questions and 3 comprehensive coding challenges.`;
  const response = await ai.models.generateContent({
    model: FLASH_MODEL, // Switch to Flash for speed
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 }, // Disable thinking to reduce latency
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mcqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              }
            }
          },
          codingProblems: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}') as FinalExam;
};