import { Chat } from "./chat";
import { Auxiliary } from "./auxiliary";

import { unlink, mkdir, appendFile } from "node:fs/promises";
import { readFileSync } from 'node:fs';
import { parse } from 'node:path';

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";

export class Program {
    private configDirectory: string
    program: Command
    constructor() {
        this.configDirectory = `${process.env.HOME}/.config/auxiliary`
        const program = new Command()
            .name(`'auxiliary' or 'aux'`)
            .description('your ai personal assistant')
            .version('0.0.1')

        program.argument('[input...]').action(async (input, options) => {
            if (options.setup) {
                await this._setup()
                console.log(`${chalk.greenBright('[Auxiliary]')} Setup complete.`);
                process.exit(0);
            }

            if (options.clear) {
                try {
                    await unlink(`${this.configDirectory}/storage/history.sqlite`);
                } catch (_) { }
                console.log(`${chalk.greenBright('[Auxiliary]')} Chat history cleared.`);
                process.exit(0);
            }

            this._initEnv();
            const enableHistory = options.history ? false : true
            const chat = new Chat(enableHistory);
            const auxiliary = new Auxiliary(chat, 'openai');

            if (input && input.length > 0) {
                chat.addMessage({ role: 'user', content: input.join(' ').trim() });
                const response = await auxiliary.generateResponse();
                chat.output(response);
            } else {
                try {
                    while (true) {
                        await chat.input();
                        const response = await auxiliary.generateResponse();
                        chat.output(response);
                    }
                }
                catch (e) {
                    console.log(e);
                } finally {
                    process.exit(0);
                }
            }
        })
            .option('-c, --clear', 'clear chat history')
            .option('-s, --setup', 'setup')
            .option('-H, --history', 'disable chat history to save usage cost')

        this.program = program
    }

    private async _setup() {
        const { openai_key, gemini_key, serper_api_key, make_alias } = await inquirer.prompt([
            {
                name: "openai_key",
                type: "input",
                message: `${chalk.greenBright('[Auxiliary]')} Enter your OpenAI API key:`,
                validate: (input) => {
                    return input.length > 0
                }
            },
            {
                name: "gemini_key",
                type: "input",
                message: `${chalk.greenBright('[Auxiliary]')} Enter your Gemini API key:`,
                validate: (input) => {
                    return input.length > 0
                }
            },
            {
                name: "serper_api_key",
                type: "input",
                message: `${chalk.greenBright('[Auxiliary]')} Enter your Serper API key:`,
                validate: (input) => {
                    return input.length > 0
                }
            },
            {
                name: "make_alias",
                type: "input",
                message: `${chalk.greenBright('[Auxiliary]')} Create alias? y or N:`,
                validate: (input) => {
                    return input.length > 0
                }
            },
        ])

        // create config directory
        await mkdir(`${this.configDirectory}/storage`, { recursive: true });
        await Bun.write(`${this.configDirectory}/.env`, `OPENAI_API_KEY=${openai_key}\nGEMINI_API_KEY=${gemini_key}\nSERPER_API_KEY=${serper_api_key}`);

        if (make_alias === 'y') {
            const currentPath = parse(process.argv[1]).dir
            const allConfigs = ['.bashrc', '.bash_profile', '.zshrc']

            for (const config of allConfigs) {
                const path = `${process.env.HOME}/${config}`
                const file = Bun.file(path)

                if (await file.exists()) {
                    appendFile(path, `\n\nalias auxiliary='bun ${currentPath}/index.ts'\nalias aux='bun ${currentPath}/index.ts'`)
                }
            }
        }
    }

    private _initEnv() {
        try {
            const env = readFileSync(`${this.configDirectory}/.env`).toString().split('\n').map((x) => {
                return x.trim().split('=')
            });
            for (const [key, value] of env) {
                process.env[key] = value
            }

            if (!process.env.OPENAI_API_KEY) {
                console.log(`${chalk.redBright('[Auxiliary]')} OpenAI API key not found. Please run with '--setup'`);
                process.exit(0);
            }
        } catch (_) {
            console.log(`${chalk.redBright('[Auxiliary]')} .env Not found. Please run with '--setup'`);
            process.exit(0);
        }
    }

    async start() {
        this.program.parse()
    }
}