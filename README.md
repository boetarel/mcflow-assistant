# McFlow Assistant 🌊

> **Work smart, stay chilled.**
> An AI-powered workplace assistant that writes your emails, researches your topics and turns messy meeting notes into clear action items, all in one dashboard with no login.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-E8553D?style=for-the-badge)](https://mcflow-assistant.lovable.app)
![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-10261E?style=flat-square)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)

🔗 **Live app:** https://mcflow-assistant.lovable.app
📦 **Repository:** https://github.com/boetarel/mcflow-assistant

---

## Table of Contents
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Try It in 60 Seconds](#try-it-in-60-seconds)
- [Features](#features)
- [Screenshots](#screenshots)
- [Responsible AI](#responsible-ai)
- [Prompt Engineering](#prompt-engineering)
- [Tech Stack](#tech-stack)
- [Run It Locally](#run-it-locally)
- [Known Limitations](#known-limitations)
- [Next Steps](#next-steps)
- [How This Maps to the Project Brief](#how-this-maps-to-the-project-brief)
- [Author](#author)

---

## The Problem

Professionals lose hours every week on repetitive admin: drafting emails in the right tone for the right audience, researching and summarising information, and writing up meetings. Rushed emails damage credibility, and missed action items cost time.

## The Solution

McFlow Assistant puts three AI tools in a single, responsive dashboard. You enter your own input, the AI generates a draft, and you review and edit it before use. There is no login, no registration and no database, so anyone can open the link and start using it.

## Try It in 60 Seconds

1. Open the [live app](https://mcflow-assistant.lovable.app).
2. **Email:** write an email to a client, then generate it in **Formal**, then switch to **Persuasive** and compare.
3. **Research:** enter a topic such as *"load shedding and small businesses in Gqeberha"*, then try pasting a URL.
4. **Meetings:** paste some notes that include a name and a deadline, then click **Draft follow-up email**.

## Features

### 1. Smart Email Generator
- Writes a subject line and body from the recipient, audience (client, manager or team), key points and length
- Three tones: **Formal**, **Friendly** and **Persuasive**
- Editable output with **Copy**, **Regenerate** and **Switch tone**

### 2. AI Research Assistant
- Accepts a topic, pasted article or URL
- Returns a **Summary**, **Key Insights** and **Recommendations / Next Steps**
- Editable sections with a **Copy as notes** button
- If a URL can't be read, the app says so and asks you to paste the text. It never invents page content.

### 3. Meeting Notes Summarizer
- Accepts pasted notes or a transcript, with **Brief** or **Detailed** output
- Extracts **Key Decisions**, **Action Items** (task, owner, deadline) and **Deadlines**
- Shows **"Not specified"** for anything missing instead of guessing
- **Draft follow-up email** sends the summary into the Email tool, so the three tools work as one workflow

### Across the app
- Dashboard layout with collapsible sidebar (bottom tab bar on mobile)
- Responsive on desktop, tablet and mobile
- Light and dark theme
- Loading, error and empty states on every tool
- Editable AI output everywhere

## Responsible AI

- **Disclaimer on first use** and a persistent sidebar card
- Every output is labelled **"AI-generated · editable"**, so the user stays in control
- AI can make mistakes: **review every output before sending or acting on it**
- **Don't enter sensitive or confidential information**
- **Nothing is saved.** Data lives in your browser tab and disappears on refresh.
- The app is instructed **never to fabricate** URL content, action items, owners or deadlines

## Prompt Engineering

The app was built with short, structured prompts to conserve free Lovable credits. Each prompt follows the same pattern:

**Product and constraints → layout → feature inputs and outputs → design → responsible AI rules**

Key techniques:
- **Explicit constraints:** "No login, no registration, no database"
- **Real AI requirement:** "All outputs must be real AI-generated responses based on the user's actual input. No canned or generic text."
- **Guardrails inside the prompt:** "Use 'Not specified' for anything missing; never invent items." and "If a URL can't be read, say so; never invent page contents."
- **Batched refinement:** fixes were grouped into single messages after testing tones, topics and edge cases

<details>
<summary>Example build prompt (condensed)</summary>

```text
Build a modern, responsive SaaS web app called "McFlow Assistant" for professionals.
No login, no registration, no database. Keep the code compact.
Layout: dashboard with collapsible sidebar (Email, Research, Meetings),
input and output sections, theme toggle, bottom tab bar on mobile.
All outputs must be real AI-generated responses based on the user's actual input.
Show loading, error and empty states.
1. Smart Email Generator: recipient, audience, key points, length; tone (Formal / Friendly / Persuasive).
2. AI Research Assistant: topic, article or URL; Summary, Key Insights, Recommendations.
3. Meeting Notes Summarizer: notes in; Summary, Decisions, Action Items, Deadlines out.
Responsible AI: first-use disclaimer and sidebar card; label every output "AI-generated · editable".
```
</details>

## Tech Stack

| Purpose | Tool |
|---|---|
| App building | [Lovable](https://lovable.dev) |
| Prompt design and README drafting | Claude (Anthropic) |
| AI responses in the app | Lovable AI |
| Frontend (generated) | React, TypeScript, Tailwind CSS |
| Version control | GitHub |
| Deployment | Lovable Publish |

## Run It Locally

You don't need to install anything to use the app: just open the [live link](https://mcflow-assistant.lovable.app).

To run the code on your machine you need [Node.js](https://nodejs.org) installed.

```bash
git clone https://github.com/boetarel/mcflow-assistant.git
cd mcflow-assistant
npm install
npm run dev
```

Then open the address shown in the terminal (usually `http://localhost:5173`).

> **Note:** the AI features use Lovable AI, which is set up for the published app. Locally the interface runs, but AI generation may need extra configuration.

## Known Limitations

- AI output can be wrong or biased, so always review it before use
- Some URLs (login-protected or script-heavy pages) can't be read, so you may need to paste the text
- Meeting summaries are only as good as the notes you paste in
- Nothing is saved, so copy your results before leaving or refreshing the page

## Next Steps

- Add the **AI Task Planner** (prioritised daily and weekly schedules)
- Add an **AI Chatbot** that can reference your latest email, research and meeting summary
- Export meeting summaries to PDF and Word
- Add optional saved history for users who want it

## How This Maps to the Project Brief

| Brief criterion | Where it is addressed |
|---|---|
| Problem relevance | [The Problem](#the-problem): everyday workplace admin |
| Prompt engineering | [Prompt Engineering](#prompt-engineering): structured prompts with guardrails and batched refinement |
| Functionality | Three working AI tools, linked by the follow-up email workflow |
| Innovation | Meeting-to-email workflow, "Not specified" honesty rule, tone switching on the same draft |
| Responsible AI | [Responsible AI](#responsible-ai) and [Known Limitations](#known-limitations) |
| Presentation | Clean responsive UI, live demo, this README |

## Author

**Relton McMaster**, sole developer
Built for the CAPACITI AI Skills Accelerator Programme in Gqeberha 🌊
