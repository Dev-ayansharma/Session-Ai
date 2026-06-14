import z from  'zod';

export const PreInterviewRequestSchema = z.object({
    githuburl: z.string()
});