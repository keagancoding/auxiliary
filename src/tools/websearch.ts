import { tool } from 'ai';
import { z } from 'zod';

export default tool({
    description: 'perform a web search using the Serper API',
    parameters: z.object({
        query: z.string().describe('The search query to perform')
    }),
    execute: async ({ query }) => {
        const apiKey = process.env.SERPER_API_KEY;
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey!,
            },
            body: JSON.stringify({ q: query })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error();
        }

        const data = await response.json();
        return data;
    }
});
