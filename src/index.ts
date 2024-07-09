import { Command } from "commander";
import { attachEnvironment, setup } from "./core/system";
import { unlink } from "fs/promises";
import chalk from "chalk";

import { Chat } from "@/core/chat";
import { generateResponse } from "@/core/auxiliary";

const main = async () => {
    const program = new Command()
        .name(`'auxiliary' or 'aux'`)
        .description('your ai personal assistant')
        .version('0.0.1')

    program.argument('[input...]').action(async (input, options) => {
        if (options.setup) {
            await setup()
            console.log(`${chalk.greenBright('[Auxiliary]')} Setup complete.`);
            process.exit(0);
        }

        if (options.clear) {
            try {
                await unlink(`${process.env.HOME}/.config/auxiliary/storage/history.sqlite`);
            } catch (_) { }
            console.log(`${chalk.greenBright('[Auxiliary]')} Chat history cleared.`);
            process.exit(0);
        }

        const chat = new Chat(options.history ? false : true);
        attachEnvironment();

        if (input.length > 0) {
            chat.addMessage({ role: 'user', content: input.join(' ') })
            const response = await generateResponse(chat.messages, 'openai');
            chat.output(response)
            chat.addMessage({ role: 'assistant', content: response })
        } else {
            try {
                while (true) {
                    const input = await chat.input();
                    chat.addMessage({ role: 'user', content: input })
                    const response = await generateResponse(chat.messages, 'openai');
                    chat.output(response)
                    chat.addMessage({ role: 'assistant', content: response })
                }
            } catch (e) {
                console.log(`${chalk.redBright('[Auxiliary]')} ${e}`);
            }
        }
    })
        .option('-c, --clear', 'clear chat history')
        .option('-s, --setup', 'setup')
        .option('-H, --history', 'disable chat history to save usage cost')

    program.parse();
}

main();