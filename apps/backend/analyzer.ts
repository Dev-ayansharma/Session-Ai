import { GoogleGenAI, Type } from '@google/genai';
import { prisma } from './db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runPostInterviewAnalysis(interviewId: string) {
  try {
    // Pull out relational array fields ordered chronologically
    const targetData = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        conversations: { orderBy: { id: 'asc' } }
      }
    });

    if (!targetData || targetData.conversations.length === 0) return;

    const textualTranscript = targetData.conversations
      .map(m => `${m.type}: ${m.message}`)
      .join("\n\n");

    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Assess the candidate's performance based on this interview transcript script:\n\n${textualTranscript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "A technical depth rating score from 1 to 100." },
            feedback: { type: Type.STRING, description: "Detailed structural review pointing out pros, cons, and tech stacks proficiency descriptions." }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const report = JSON.parse(analysisResponse.text!);

    // Save final analytical data back into Prisma rows
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        score: report.score,
        feedback: report.feedback
      }
    });

  } catch (error) {
    console.error("Failed executing post-session script wrapper matrix:", error);
  }
}