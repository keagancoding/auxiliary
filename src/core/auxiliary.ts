import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type CoreMessage } from 'ai';
import { chatInput, chatOutput, connectDatabase } from './utils';
import { Database } from 'bun:sqlite';
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
    private db: Database

    constructor(options?: AuxiliaryOptions) {
        const defaults = {
            provider: 'openai',
            model: 'gpt-4o',
        }

        this.options = Object.assign(defaults, options)
        this.model = getOpenAIModel(this.options.model)
        this.db = connectDatabase()
    }


    async chat() {
        while (true) {
            const input = await chatInput()
            const response = await this._generate(input)
            chatOutput(response)
        }
    }

    async cli(input: string) {
        const response = await this._generate(input)
        chatOutput(response)
    }

    async voice() {
        chatOutput('Voice mode not supported yet.', true)
    }

    private _loadMessages(count: number) {
        const query = this.db?.query(`SELECT content, role FROM messages ORDER BY id LIMIT ${count}`);
        return query?.all() as CoreMessage[]
    }


    private _saveMessage(message: CoreMessage) {
        const query = this.db?.query(`INSERT INTO messages (content, role) VALUES ($content, $role)`);
        query.run({ $content: message.content.toString(), $role: message.role.toString() })
    }

    private async _generate(input: string) {
        const saveLongTermMemory = this.options.history ? 50 : 10
        try {
            // Store input in short term memory and in database if enabled
            const userMessage = { role: 'user', content: input } as CoreMessage
            this._saveMessage(userMessage)

            const { text } = await generateText({
                model: this.model,
                tools,
                system: 'You are a helpful assistant named Auxiliary.' +
                    'You are witty, slightly sarcastic, and helpful.' +
                    'Check for tools you have access too before you say you cant do it.' +
                    'When you respond, respond consisely and in a conversational manner.' +
                    'Dont worry about asking if I need help, Ill ask if I do' +
                    'Do not format your response in markdown please. Just respond in plain text unless otherwise noted.',
                temperature: 0.3,
                maxToolRoundtrips: 5,
                maxTokens: 1500,
                messages: this._loadMessages(saveLongTermMemory),
            })

            // Store Response in short term memory and in database if enabled
            const assistantMessage = { role: 'assistant', content: text } as CoreMessage
            this._saveMessage(assistantMessage)

            return text
        } catch (e) {
            throw e
        }
    }
}