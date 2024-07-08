// Script Runner Tool

import { tool } from "ai";
import { z } from "zod";

export default tool({
    description: 'execute scripts scripts in terminal with this tool.',
    parameters: z.object({
        command: z.string().describe(`The python/bash/ps/node command you want to execute, if using python3 or node you must incude python or node to start because you are in the shell, keep in mind your running on a ${process.platform} system`)
    }),
    execute: async ({ command }) => {
        const proc = Bun.spawn(["sh", "-c", command], {
            stderr: "pipe",
        });

        if (proc.exitCode !== null) {
            const errorOutput = await new Response(proc.stderr).text();
            return `Error output: ${errorOutput}`
        } else {
            const output = await new Response(proc.stdout).text() || 'Excecuted Successfully';
            return output
        }
    }
})