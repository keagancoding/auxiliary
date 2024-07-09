import { Command } from "commander";
import { attachEnvironment, chatOutput, clearMessages, setup } from "./core/utils";
import chalk from "chalk";

import { Auxiliary } from "@/core/auxiliary";

const main = async () => {
    const program = new Command()
        .name(`'auxiliary' or 'aux'`)
        .description('your ai personal assistant')
        .version('0.0.1')

    program.argument('[input...]').action(async (input, options) => {
        if (options.setup) {
            await setup()
            chatOutput('Setup complete. Please restart your terminal if you set up the alias.')
            process.exit(0);
        }

        if (options.clear) {
            clearMessages()
            chatOutput('Chat history cleared.')
            process.exit(0);
        }

        attachEnvironment();

        const auxiliary = new Auxiliary({
            history: options.history ? false : true
        });

        if (input.length > 0) {
            await auxiliary.cli(input.join(' '));
        } else {
            if (options.voice) {
                await auxiliary.voice();
            } else {
                await auxiliary.chat();
            }
        }
    })
        .option('-s, --setup', 'setup')
        .option('-c, --clear', 'clear chat all history')
        .option('-H, --history', 'disable long term chat history to save usage cost')
        .option('-v, --voice', 'use voice')

    program.parse();
}

main()