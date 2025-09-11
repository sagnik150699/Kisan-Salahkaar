'use server';
/**
 * @fileOverview An AI agent that answers follow-up questions about plant remedies.
 *
 * - followUpRemedyQuestion - A function that handles answering follow-up questions.
 * - FollowUpRemedyQuestionInput - The input type for the followUpRemedyQuestion function.
 * - FollowUpRemedyQuestionOutput - The return type for the followUpRemedyQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FollowUpRemedyQuestionInputSchema = z.object({
  diagnosis: z.string().describe('The original diagnosis of the plant issue.'),
  remedy: z.string().describe('The specific remedy the user is asking about.'),
  question: z.string().describe('The user\'s follow-up question.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi").'),
});
export type FollowUpRemedyQuestionInput = z.infer<typeof FollowUpRemedyQuestionInputSchema>;

const FollowUpRemedyQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s follow-up question.'),
});
export type FollowUpRemedyQuestionOutput = z.infer<typeof FollowUpRemedyQuestionOutputSchema>;

export async function followUpRemedyQuestion(input: FollowUpRemedyQuestionInput): Promise<FollowUpRemedyQuestionOutput> {
  return followUpRemedyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followUpRemedyQuestionPrompt',
  input: { schema: FollowUpRemedyQuestionInputSchema },
  output: { schema: FollowUpRemedyQuestionOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert agricultural advisor. Your role is to assist with farming-related questions. If the user asks a question that is not about agriculture, plant health, or farming practices, politely decline to answer and state that you can only help with farming topics.

A user has received a diagnosis and a suggested remedy for their plant. They now have a follow-up question. Provide a clear and concise answer to their question based on the context provided.

Respond in the following language: {{{language}}}

Original Diagnosis: {{{diagnosis}}}
Suggested Remedy: {{{remedy}}}
User's Question: {{{question}}}

Answer the user's question directly and helpfully.`,
});

const followUpRemedyQuestionFlow = ai.defineFlow(
  {
    name: 'followUpRemedyQuestionFlow',
    inputSchema: FollowUpRemedyQuestionInputSchema,
    outputSchema: FollowUpRemedyQuestionOutputSchema,
    rateLimit: {
      key: 'user',
      queries: 10,
      per: 'minute',
    },
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
