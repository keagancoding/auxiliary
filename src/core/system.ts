import { mkdir, appendFile } from "node:fs/promises";
import { readFileSync } from 'node:fs';
import { parse } from 'node:path';

import inquirer from "inquirer";
import chalk from "chalk";

export const setup = async () => {
    const configPath = `${process.env.HOME}/.config/auxiliary`
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
    await mkdir(`${configPath}/storage`, { recursive: true });
    await Bun.write(`${configPath}/.env`, `OPENAI_API_KEY=${openai_key}\nGEMINI_API_KEY=${gemini_key}\nSERPER_API_KEY=${serper_api_key}`);

    // create alias
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

export const attachEnvironment = () => {
    const configPath = `${process.env.HOME}/.config/auxiliary`
    try {
        const env = readFileSync(`${configPath}/.env`).toString().split('\n').map((x) => {
            return x.trim().split('=')
        });
        for (const [key, value] of env) {
            process.env[key] = value
        }

        if (!process.env.OPENAI_API_KEY) {
            console.log(`${chalk.redBright('[Auxiliary]')} OpenAI API key not found. Please run with '--setup'`);
            process.exit(0);
        }

        if (!process.env.GEMINI_API_KEY) {
            console.log(`${chalk.redBright('[Auxiliary]')} Gemini API key not found. Please run with '--setup'`);
            process.exit(0);
        }

        if (!process.env.SERPER_API_KEY) {
            console.log(`${chalk.redBright('[Auxiliary]')} Serper API key not found. Please run with '--setup'`);
            process.exit(0);
        }
    } catch (_) {
        console.log(`${chalk.redBright('[Auxiliary]')} .env Not found. Please run with '--setup'`);
        process.exit(0);
    }
}