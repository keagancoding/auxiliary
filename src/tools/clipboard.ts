import { tool } from 'ai';
import { z } from 'zod';
import clipboardy from 'clipboardy';

export default tool({
    description: 'interact with the users clipboard',
    parameters: z.object({
        prompt: z.string().describe('The prompt for the clipboard action'),
        method: z.enum(['read', 'write']).describe('The method to use: read or write')
    }),
    execute: async ({ prompt, method }) => {
        if (method === 'read') {
            return clipboardy.readSync();
        } else if (method === 'write') {
            clipboardy.writeSync(prompt);
            return 'Clipboard updated successfully';
        } else {
            throw new Error('Invalid method');
        }
    }
});
