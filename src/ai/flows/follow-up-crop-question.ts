'use server';
/**
 * @fileOverview An AI agent that answers follow-up questions about crop recommendations.
 *
 * - followUpCropQuestion - A function that handles answering follow-up questions.
 * - FollowUpCropQuestionInput - The input type for the followUpCropQuestion function.
 * - FollowUpCropQuestionOutput - The return type for the followUpCropQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FollowUpCropQuestionInputSchema = z.object({
  recommendation: z.string().describe('The original crop recommendation provided.'),
  question: z.string().describe('The user\'s follow-up question.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi").'),
});
export type FollowUpCropQuestionInput = z.infer<typeof FollowUpCropQuestionInputSchema>;

const FollowUpCropQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s follow-up question.'),
});
export type FollowUpCropQuestionOutput = z.infer<typeof FollowUpCropQuestionOutputSchema>;

export async function followUpCropQuestion(input: FollowUpCropQuestionInput): Promise<FollowUpCropQuestionOutput> {
  return followUpCropQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followUpCropQuestionPrompt',
  input: { schema: FollowUpCropQuestionInputSchema },
  output: { schema: FollowUpCropQuestionOutputSchema },
  prompt: `You are an expert agricultural advisor. A user has received a crop recommendation and now has a follow-up question. Provide a clear and concise answer to their question based on the context provided.

Respond in the following language: {{{language}}}

Original Recommendation: {{{recommendation}}}
User's Question: {{{question}}}

Answer the user's question directly and helpfully.`,
});

const followUpCropQuestionFlow = ai.defineFlow(
  {
    name: 'followUpCropQuestionFlow',
    inputSchema: FollowUpCropQuestionInputSchema,
    outputSchema: FollowUpCropQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
