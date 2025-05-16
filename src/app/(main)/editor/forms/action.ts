import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canUseAITools } from "@/lib/permissions";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

console.log("Gemini API Key:", process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("AI tools not available on your plan");
  }

  const { jobTitle, educations, workExperiences, skills } =
    generateSummarySchema.parse(input);

  const systemMessage = `You are a job resume generator AI. Your task is to write a professional introduction summary for a resume given the user's provided data. Only return the summary and do not include any other information in the response. Keep it concise and professional.`;

  const userPrompt =
    `System: ${systemMessage}\n\nGenerate a professional resume summary from this data:\n\n` +
    `Job Title: ${jobTitle || "N/A"}\n\n` +
    `Work experience:\n${workExperiences
      ?.map(
        (exp) =>
          `Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${
            exp.endDate || "Present"
          }\nDescription: ${exp.description || "N/A"}`,
      )
      .join("\n\n")}\n\n` +
    `Education:\n${educations
      ?.map(
        (edu) =>
          `Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}`,
      )
      .join("\n\n")}\n\n` +
    `Skills: ${skills}`;

  // Generate content via Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  const aiResponse = response.text();

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  return aiResponse.trim();
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("AI tools not available on your plan");
  }
  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage =
    `You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input. Your response must adhere to the following structure. You can omit fields if they can't be inferred from the provided data, but don't add any new ones.\n\n` +
    `Job title: <job title>\n` +
    `Company: <company name>\n` +
    `Start date: <format: YYYY-MM-DD> (Only if provided)\n` +
    `End date: <format: YYYY-MM-DD> (Only if provided)\n` +
    `Description: <an optimized description in bullet format, might be inferred from the job title>`;

  const userPrompt = `System: ${systemMessage}\n\nPlease provide a work experience entry from this description:\n${description}`;

  // Generate content via Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  const aiResponse = response.text();

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  // Parse fields from Gemini response
  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
