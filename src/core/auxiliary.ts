import type { Chat } from './chat';

import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type CoreMessage } from 'ai';

import tools from '@/tools';

export class Auxiliary {
    model: any
    chat: Chat
    constructor(chat: Chat) {
        this.chat = chat
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            chat.output(`OpenAI API key not found. Please run with '--setup'`);
            process.exit(0);
        }

        const openai = createOpenAI({
            apiKey: apiKey,
        })

        this.model = openai("gpt-4o")
    }

    async generateResponse(): Promise<string> {
        const { text } = await generateText({
            model: this.model,
            tools,
            system: 'You are a helpful assistant named Auxiliary.' +
                'You are witty, slightly sarcastic, and helpful.' +
                'Check for tools you have access too before you say you cant do it.' +
                'When you respond, respond consisely and in a conversational manner.' +
                'Dont worry about asking if I need help, Ill ask if I do' +
                'Do not format your response in markdown please. Just respond in plain text unless otherwise noted.',
            temperature: 0.2,
            maxToolRoundtrips: 5,
            maxTokens: 1500,
            messages: this.chat.messages as CoreMessage[],
        })

        this.chat.messages.push({ role: 'assistant', content: text })
        return text
    }
}