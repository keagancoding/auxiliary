![](./assets/aux.png)

# Auxiliary

My personal ai assistant. Using OpenAI apis on your machine with some super powers. Sometimes he forgets he has access to those super powers but if you just remind him he'll use them.

For example if you ask him what the code is doing on your screen and the response is I cant see your screen, tell him to take a screenshot to see.

There are a few caveats to using Auxiliary. When prompting the ai has no idea of your machines file structure. For example if I asked: `Create a new python project in my python development directory.`
The knowlege is not there to know where that directory is until you've talked about it or provided a path to that directory.

He works by taking in a users prompt with knowlege of the tools he has access too, and with that goes into a feedback loop (less that 5 times), to iterate on information gatherd with tools to generate the final response

## Auxiliary has 4 tools:

- Clipboard access, read and write to clipboard
- Screenshot to gain information about whats on your screen
- Script Runner / Terminal access (with given os windows/linux/mac)
- Websearch using serper api

## Installation

```bash
git clone

bun install
bun start --setup
```

This will take you through the setup process to add your api keys for openai, gemini, and serper. And ask if you want to set up an alias.

- Openai is the brain of auxiliary
- Gemini is the imagle analysis
- Serper is the web search engine

## Customization

You can add more tools but to many will start to confuse him. Check out the docs for [Vercel AI SDK](https://sdk.vercel.ai/docs/foundations/tools) tools to learn their structure.

You can also customize auxiliarys personality by editing his system prompt in the [`src/core/auxiliary.ts`](./src/core/auxiliary.ts) file

## Goals

- [x] Tools
- [ ] Ollama Support
- [ ] Voice interaction
- [ ] Gui for outputs and voice activity

## Extra

Using bun you can build the program as an executable (ive only tried this on macos so system by system may vary) but you cd into the project folder and run `bun compile` and the executable will be put in the `dist` directory.
