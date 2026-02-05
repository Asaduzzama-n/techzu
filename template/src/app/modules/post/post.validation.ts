import { z } from 'zod'

const createPostZodSchema = z.object({
    body: z.object({
        content: z.string({
            required_error: 'Content is required',
        }),
    }),
})

const addCommentZodSchema = z.object({
    body: z.object({
        content: z.string({
            required_error: 'Comment content is required',
        }),
    }),
})

export const PostValidation = {
    createPostZodSchema,
    addCommentZodSchema,
}
