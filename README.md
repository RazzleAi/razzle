## Introduction

Large language models have become have become quite popular in recent years, understandably so. Tools like GPT-3 and ChatGPT by extension have show what software driven by natural language can accomplish in terms of ease of use and power. We've seen use cases everywhere from text generation to code generation and many more to come, we've also seen companies introduce a chat experience to their products to make them more accessible and easy to use.

We at Razzle however are fascinated by one question: 
<br />

**What if we could build LLM native software?**

How would the world change if instead of having large applications build a "chat experience" we could empower engineers to build software that is `chat native`. Where AI is not an afterthought but a core part of the product, acting as the glue layer that takes the natural language input from the user and translates it into a programmatic action.

Razzle is a platform that enables developers to build software that is powered by natural language. We've designed this with a few core considerations in mind:

1. **Multiple Languages Support (uniform API)**: Most tools available in the AI space are available majorly in python. We believe that this is a major barrier to entry for developers who are not familiar with python. We've designed Razzle to be language agnostic, allowing developers to build their software in any language they choose. We've also designed a uniform API that allows developers to build their software in any language they choose and still be able to use the same Razzle components.

    We currently support the following languages:
    - Typescript
    - Java
    - Python (coming soon)
    - Go (coming soon)


2. **Using existing primitives in the language**: We believe this will guarantee the best developer experience. We've designed Razzle to be a thin layer on top of the language primitives, allowing developers to use the language primitives they are familiar with.

3. **Enterprise ready**: We try to make sure that Razzle is enterprise ready meaning that we take things into consideration that other platforms don't for example

    - **Human in the loop friendly**: Razzle presents you with an action plan before it executes allowing the user to VET the action plan before it is executed. This allows the user to make sure that the action plan is what they intended to execute.

    - **End to end tools**: Not only does Razzle provide you with the tools to build software backed by LLMs, it also provides you simple UI components that allow you to build a UI for your software, because we recognize tha will natural language is great sometimes being able to click a button is just better.


We are still early on this journey and if you want to be part of it, please join us on our [Discord](https://discord.gg/TzRt9wQM5u) and let us know what you think.


