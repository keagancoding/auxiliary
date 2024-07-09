import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type CoreMessage } from 'ai';
import { chatInput, chatOutput, loadChatHistory, saveChatMessage } from './utils';
import tools from '@/tools';

const getOpenAIModel = (model: 'gpt-4o' | 'gpt-3.5-turbo' = 'gpt-4o') => {
    const apiKey = process.env.OPENAI_API_KEY
    const openai = createOpenAI({
        apiKey: apiKey,
    })

    return openai("gpt-4o")
}

type AuxiliaryOptions = {
    provider?: 'openai'
    model?: 'gpt-4o' | 'gpt-3.5-turbo'
    history: boolean
}

export class Auxiliary {
    private options: AuxiliaryOptions
    private model: any
    messages: CoreMessage[]

    constructor(options?: AuxiliaryOptions) {
        const defaults = {
            provider: 'openai',
            model: 'gpt-4o',
        }

        this.options = Object.assign(defaults, options)
        this.model = getOpenAIModel(this.options.model)
        this.messages = this.options.history ? loadChatHistory() : []
    }


    async chat() {
        while (true) {
            const input = await chatInput()
            saveChatMessage({ role: 'user', content: input })
            const response = await this._generate(input)
            chatOutput(response)
        }
    }

    async cli(input: string) {
        saveChatMessage({ role: 'user', content: input })
        const response = await this._generate(input)
        chatOutput(response)
    }

    async voice() {
        chatOutput('Voice mode not supported yet.', true)
    }

    private async _generate(input: string) {
        try {
            // Store input in short term memory and in database if enabled
            const userMessage = { role: 'user', content: input } as CoreMessage
            this.messages.push(userMessage)
            if (this.options.history) {
                saveChatMessage(userMessage)
            }

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
                messages: this.messages,
            })

            // Store Response in short term memory and in database if enabled
            const assistantMessage = { role: 'assistant', content: text } as CoreMessage
            this.messages.push({ role: 'assistant', content: text })
            if (this.options.history) {
                saveChatMessage(assistantMessage)
            }

            return text
        } catch (e) {
            throw e
        }
    }
}