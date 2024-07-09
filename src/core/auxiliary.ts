import { createOpenAI } from '@ai-sdk/openai';
// import { createOllama } from 'ollama-ai-provider';
import { generateText, type CoreMessage } from 'ai';

import tools from '@/tools';

// Ollama Doesnt Support Function Calling Yet
// type ollamaModels = 'mistral:7b' | 'llama3'
// const getOllamaModel = async (model: ollamaModels = 'llama3') => {
//     const ollama = createOllama()
//     return ollama(model)
// }

const getOpenAIModel = async () => {
    const apiKey = process.env.OPENAI_API_KEY
    const openai = createOpenAI({
        apiKey: apiKey,
    })

    return openai("gpt-4o")
}

export const generateResponse = async (messages: CoreMessage[], provider: 'openai' | 'ollama', model?: ollamaModels) => {
    const activatedModel = await getOpenAIModel()
    const { text } = await generateText({
        model: activatedModel,
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
        messages,
    })

    return text
}