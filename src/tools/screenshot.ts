// Screenshot Tool
import screenshot from 'screenshot-desktop'
import { tool } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

export default tool({
    description: 'take screen shots/get content of prompters screen with this tool',
    parameters: z.object({
        prompt: z.string().describe('original prompt')
    }),
    execute: async ({ prompt }) => {
        return await screenshot().then(async (img) => {
            const google = createGoogleGenerativeAI({
                apiKey: process.env.GEMINI_API_KEY
            })

            const { text } = await generateText({
                model: google("models/gemini-1.5-flash-latest"),
                system: `You are an image analysis AI.
                You will use users prompt and the image and return relavent information pertaining to the users prompt and context of the image
                This reponse will be sent to another AI to generate the final response.`,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image", image: img }
                        ]
                    }
                ]
            })

            return text
        })
    }
})