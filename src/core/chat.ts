import type { CoreMessage } from "ai";
import { Database } from "bun:sqlite";

import chalk from "chalk";
import inquirer from "inquirer";

export class Chat {
    enable_history: boolean
    messages: CoreMessage[]
    private db: Database | undefined
    constructor(enable_history: boolean = false) {
        this.enable_history = enable_history
        this.db = this._connectDatabase()
        this.messages = []
        this._load_history()
    }

    addMessage({ role, content }: { role: string, content: string }) {
        this._storeMessage({ role, content })
        this.messages.push({ role, content } as CoreMessage)
    }

    input = async (system = false, prompt?: string) => {
        let message = chalk.blueBright(`${prompt ? `[You]: ${prompt}\n` : '[You]:'}`)
        if (system) {
            message = chalk.yellow(`${prompt ? `[Auxiliary]: ${prompt}\n` : ''}`)
        }

        const { input } = await inquirer.prompt({
            name: "input",
            message,
        })

        this.addMessage({ role: 'user', content: input })
        return input
    }

    output = async (output: string, error: boolean = false) => {
        if (error) {
            console.log(`${chalk.redBright('[Aux]')} ${output}`)
        }
        console.log(`${chalk.greenBright('[Aux]')} ${output}`)
    }

    private _load_history() {
        if (this.enable_history) {
            const query = this.db?.query("SELECT * FROM messages ORDER BY id DESC");
            const results = query?.all() as { role: string, content: string }[]

            this.messages = results
        }
    }

    private _storeMessage({ role, content }: { role: string, content: string }) {
        if (this.enable_history) {
            const insertMessage = this.db?.prepare(`
                INSERT INTO messages (content, role) VALUES (?, ?)
              `);

            insertMessage?.run(content, role);
        }
    }

    private _connectDatabase() {
        if (this.enable_history) {
            try {
                let db = new Database(`${process.env.HOME}/.config/auxiliary/storage/history.sqlite`, { create: true })

                db.run(`
                CREATE TABLE IF NOT EXISTS messages (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  content TEXT,
                  role TEXT
                )
            `);

                return db
            } catch (_) {
                console.log(`${chalk.redBright('[Auxiliary]')} Chat history not found. Please run with '--setup'`);
                process.exit(0);
            }
        } else {
            return undefined
        }
    }
}