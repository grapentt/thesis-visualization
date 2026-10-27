# LLMs beyond the chat window

A narrated video (about 13 minutes, 24 scenes) for students who are new to
cybersecurity and AI. It explains how LLMs are used outside chat apps, how to
build them into security workflows, and what the project "Triaging Security
Alerts with a Local LLM" (PJ Intelligent Cybersecurity Applications, TU Berlin)
is about.

It reuses the thesis repo's video engine (`src/`): same player, same scene
format, same look. It is not part of the thesis videos, so `npm run build`
and `npm test` do not pick it up; it has its own build and export scripts.

## Story

**Part 1 · LLMs as building blocks**
1. Title and agenda.
2. What an LLM does: tokens in, a probability for every next token, append, repeat.
3. Under the chat window: the JSON request and response, and three layers (model, API server, app).
4. Calling a local model (Ollama) from Python, line by line, synced with the round trip.
5. Putting the call in a loop: from 10 alerts an hour by hand to thousands a night.
6. Structured output: ask for JSON (a schema), not prose, so code can act on it.
7. The context window as the model's desk; retrieval-augmented generation (RAG).
8. Hallucination and grounding: rules, evidence and citations.

**Part 2 · LLMs in security operations**
9. Six typical uses (alert triage, log summaries, phishing, threat intel, ATT&CK mapping, reports), with the analyst in the loop.
10. Two risks: confidentiality (hence a local model) and prompt injection through attacker-controlled log fields.

**Part 3 · The project**
11. Title card.
12. The SOC problem: most of an analyst's time goes into collecting context.
13. The lab: VM network, Suricata, Loki, FleetDM, Kubernetes, the local LLM.
14. Anatomy of a Suricata alert, and what it does not tell you.
15. The six-step pipeline and its core function in code.
16. Step 2a: a LogQL query around the alert, condensed to six telling lines.
17. Step 2b: the host from FleetDM, including a failing policy check.
18. Step 3: assembling the prompt from labelled blocks within a token budget.
19. Step 4: ATT&CK tactics and techniques, and how context changes the choice.
    **Playable:** the viewer can switch the context the model sees (alert only, + host, + logs, both).
20. Step 5: the JSON answer with every claim linked to its evidence.
21. Step 6: ground truth from scripted attacks (Atomic Red Team, Caldera).
22. Measuring: accuracy, precision, recall, F1; faithfulness via an LLM judge and a human spot check.
23. Design decisions (model size, quantization, Ollama or vLLM) and example research questions.
24. Summary, where to start, and the reading list.

One running example connects part 3: an "ET SCAN Potential SSH Scan" alert
that the context reveals as a likely successful password-guessing attack
(T1110.001). All numbers that are not facts about the tools (minutes per alert,
probabilities, F1 scores, token counts) are illustrative and marked as such on
screen.

## Run, build, export

From the repo root:

```bash
npm run dev                                 # then open http://localhost:5173/private/other/llm-soc/
node private/other/llm-soc/build.mjs        # → private/other/llm-soc/dist/llm-soc.html (self-contained)
```

Render check frames (PNG) and catch page errors:

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/llm-soc/render.mjs --out /tmp/frames           # 3 frames per scene
PLAYWRIGHT_CHANNEL=chrome node private/other/llm-soc/render.mjs --out /tmp/frames --scene 18 # one scene, every 4 s
```

Export an MP4 with the repo's exporter (needs `ffmpeg`), pointing it at this build:

```bash
PLAYWRIGHT_CHANNEL=chrome npm run export -- --video ../private/other/llm-soc/dist/llm-soc --fps 30 --mp4 llm-soc.mp4
```

## Files

- `index.js` lists the scenes in playing order; `meta.json` names the video.
- `shared.js` re-exports the repo kit and adds this video's colour code (alert red, Loki cyan, FleetDM green, ATT&CK orange, LLM violet, answers gold), panels, icons, syntax-highlighted code blocks with line focus, moving packets, and the running example.
- `scenes/NN-*.js`, one scene per file.
- `index.html` and `main.js` are the development page; `build.mjs` and `render.mjs` build and check it.
